const { PrismaClient } = require('@prisma/client')
const { setMatchState, buildMatchState } = require('./matchState')
const { broadcastMatchUpdate } = require('./socketManager')

const prisma = new PrismaClient()

/**
 * Process a ball delivery with full stat updates and idempotency.
 */
async function processBall(data) {
  const {
    matchId, inningsId, overId, ballNumber,
    batsmanId, bowlerId, runsScored = 0,
    extrasType = 'NONE', extrasRuns = 0,
    isWicket = false, wicketType = null,
    dismissedPlayerId = null, fielderId = null,
    wagonX = null, wagonY = null, pitchZone = null,
    idempotencyKey
  } = data

  // ── Idempotency check ──
  const existing = await prisma.ball.findUnique({ where: { idempotencyKey } })
  if (existing) {
    return { duplicate: true, ball: existing }
  }

  const totalRuns = runsScored + extrasRuns
  const isLegalDelivery = extrasType !== 'WIDE' && extrasType !== 'NO_BALL'

  // ── Create ball + update stats in a transaction ──
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create the ball record
    const ball = await tx.ball.create({
      data: {
        overId, ballNumber, batsmanId, bowlerId,
        runsScored, extrasType, extrasRuns,
        isWicket, wicketType, dismissedPlayerId, fielderId,
        wagonX, wagonY, pitchZone, idempotencyKey
      }
    })

    // 2. Update innings totals
    const overIncrement = isLegalDelivery ? calculateOverIncrement(ballNumber) : 0
    await tx.innings.update({
      where: { id: inningsId },
      data: {
        totalRuns: { increment: totalRuns },
        totalWickets: { increment: isWicket ? 1 : 0 },
        totalOvers: { increment: overIncrement },
        totalExtras: { increment: extrasRuns }
      }
    })

    // 3. Update over stats
    await tx.over.update({
      where: { id: overId },
      data: {
        runsConceded: { increment: totalRuns },
        wickets: { increment: isWicket ? 1 : 0 }
      }
    })

    // 4. Update batsman innings
    const batsmanUpdate = {
      ballsFaced: { increment: isLegalDelivery ? 1 : 0 },
      runs: { increment: runsScored },
      fours: { increment: runsScored === 4 ? 1 : 0 },
      sixes: { increment: runsScored === 6 ? 1 : 0 }
    }

    const updatedBatsman = await tx.batsmanInnings.update({
      where: { inningsId_playerId: { inningsId, playerId: batsmanId } },
      data: batsmanUpdate
    })

    // Recalculate strike rate
    const newSR = updatedBatsman.ballsFaced > 0
      ? parseFloat(((updatedBatsman.runs / updatedBatsman.ballsFaced) * 100).toFixed(2))
      : 0
    await tx.batsmanInnings.update({
      where: { id: updatedBatsman.id },
      data: { strikeRate: newSR }
    })

    // 5. Handle wicket: mark batsman as OUT
    if (isWicket && dismissedPlayerId) {
      await tx.batsmanInnings.update({
        where: { inningsId_playerId: { inningsId, playerId: dismissedPlayerId } },
        data: {
          status: 'OUT',
          dismissalType: wicketType,
          dismissedById: bowlerId,
          fielderId: fielderId
        }
      })
    }

    // 6. Update bowler innings
    const bowlerUpdate = {
      runsConceded: { increment: totalRuns },
      wickets: { increment: isWicket ? 1 : 0 },
      extras: { increment: extrasRuns },
      dotBalls: { increment: totalRuns === 0 && isLegalDelivery ? 1 : 0 },
      oversBowled: { increment: isLegalDelivery ? calculateOverIncrement(ballNumber) : 0 }
    }

    const updatedBowler = await tx.bowlerInnings.update({
      where: { inningsId_playerId: { inningsId, playerId: bowlerId } },
      data: bowlerUpdate
    })

    // Recalculate economy
    const bowlerBalls = Math.floor(updatedBowler.oversBowled) * 6 + Math.round((updatedBowler.oversBowled % 1) * 10)
    const newEcon = bowlerBalls > 0
      ? parseFloat((updatedBowler.runsConceded / (bowlerBalls / 6)).toFixed(2))
      : 0
    await tx.bowlerInnings.update({
      where: { id: updatedBowler.id },
      data: { economy: newEcon }
    })

    return ball
  })

  // ── Update Redis cache & broadcast ──
  await refreshAndBroadcast(matchId, inningsId)

  return { duplicate: false, ball: result }
}

/**
 * Undo the last ball by deleting it and recalculating stats.
 */
async function undoLastBall(inningsId) {
  const lastBall = await prisma.ball.findFirst({
    where: { over: { inningsId } },
    orderBy: { createdAt: 'desc' }
  })

  if (!lastBall) return null

  const isLegalDelivery = lastBall.extrasType !== 'WIDE' && lastBall.extrasType !== 'NO_BALL'
  const totalRuns = lastBall.runsScored + lastBall.extrasRuns

  await prisma.$transaction(async (tx) => {
    // Reverse innings totals
    const overDecrement = isLegalDelivery ? calculateOverIncrement(lastBall.ballNumber) : 0
    await tx.innings.update({
      where: { id: inningsId },
      data: {
        totalRuns: { decrement: totalRuns },
        totalWickets: { decrement: lastBall.isWicket ? 1 : 0 },
        totalOvers: { decrement: overDecrement },
        totalExtras: { decrement: lastBall.extrasRuns }
      }
    })

    // Reverse over stats
    await tx.over.update({
      where: { id: lastBall.overId },
      data: {
        runsConceded: { decrement: totalRuns },
        wickets: { decrement: lastBall.isWicket ? 1 : 0 }
      }
    })

    // Reverse batsman stats
    await tx.batsmanInnings.update({
      where: { inningsId_playerId: { inningsId, playerId: lastBall.batsmanId } },
      data: {
        ballsFaced: { decrement: isLegalDelivery ? 1 : 0 },
        runs: { decrement: lastBall.runsScored },
        fours: { decrement: lastBall.runsScored === 4 ? 1 : 0 },
        sixes: { decrement: lastBall.runsScored === 6 ? 1 : 0 }
      }
    })

    // If wicket was taken, reinstate the batsman
    if (lastBall.isWicket && lastBall.dismissedPlayerId) {
      await tx.batsmanInnings.update({
        where: { inningsId_playerId: { inningsId, playerId: lastBall.dismissedPlayerId } },
        data: { status: 'BATTING', dismissalType: null, dismissedById: null, fielderId: null }
      })
    }

    // Reverse bowler stats
    await tx.bowlerInnings.update({
      where: { inningsId_playerId: { inningsId, playerId: lastBall.bowlerId } },
      data: {
        runsConceded: { decrement: totalRuns },
        wickets: { decrement: lastBall.isWicket ? 1 : 0 },
        extras: { decrement: lastBall.extrasRuns },
        dotBalls: { decrement: totalRuns === 0 && isLegalDelivery ? 1 : 0 },
        oversBowled: { decrement: isLegalDelivery ? calculateOverIncrement(lastBall.ballNumber) : 0 }
      }
    })

    // Delete the ball
    await tx.ball.delete({ where: { id: lastBall.id } })
  })

  return lastBall
}

/**
 * Calculate the increment to totalOvers (stored as float like 18.4 = 18 overs 4 balls).
 */
function calculateOverIncrement(ballNumberInOver) {
  // If this was the 6th legal delivery, the over changes from X.5 → (X+1).0
  // We represent overs as float: 0.1 per ball up to 0.5, then +0.5 to roll over
  if (ballNumberInOver === 6) return 0.5 // 0.5 for the roll-over from X.5 to (X+1).0
  return 0.1
}

/**
 * Refresh the Redis state and broadcast to connected clients.
 */
async function refreshAndBroadcast(matchId, inningsId) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { homeTeam: true, awayTeam: true }
  })

  const innings = await prisma.innings.findUnique({
    where: { id: inningsId },
    include: { battingTeam: true, bowlingTeam: true }
  })

  const batsmen = await prisma.batsmanInnings.findMany({
    where: { inningsId, status: 'BATTING' },
    include: { player: true }
  })

  const bowlerInnings = await prisma.bowlerInnings.findFirst({
    where: { inningsId },
    orderBy: { oversBowled: 'desc' },
    include: { player: true }
  })

  const recentBalls = await prisma.ball.findMany({
    where: { over: { inningsId } },
    orderBy: { createdAt: 'desc' },
    take: 6
  })

  const state = buildMatchState(match, innings, batsmen, bowlerInnings, recentBalls.reverse())
  await setMatchState(matchId, state)
  broadcastMatchUpdate(matchId, state)
}

module.exports = { processBall, undoLastBall, refreshAndBroadcast }
