const { PrismaClient } = require('@prisma/client')
const { processBall, undoLastBall } = require('../services/scoring')

const prisma = new PrismaClient()

async function scoringRoutes(fastify) {
  // Record a ball delivery
  fastify.post('/api/scoring/ball', async (request, reply) => {
    const result = await processBall(request.body)
    if (result.duplicate) {
      return reply.status(200).send({ message: 'Duplicate delivery ignored', ball: result.ball })
    }
    return reply.status(201).send(result.ball)
  })

  // Undo last ball
  fastify.post('/api/scoring/undo', async (request, reply) => {
    const { inningsId } = request.body
    const undone = await undoLastBall(inningsId)
    if (!undone) return reply.status(404).send({ error: 'No ball to undo' })
    return { success: true, undone }
  })

  // Start a new over
  fastify.post('/api/scoring/new-over', async (request, reply) => {
    const { inningsId, overNumber, bowlerId } = request.body
    const over = await prisma.over.create({
      data: { inningsId, overNumber, bowlerId }
    })

    // Create or update bowler innings
    const existing = await prisma.bowlerInnings.findUnique({
      where: { inningsId_playerId: { inningsId, playerId: bowlerId } }
    })
    if (!existing) {
      await prisma.bowlerInnings.create({
        data: { inningsId, playerId: bowlerId }
      })
    }

    return reply.status(201).send(over)
  })

  // Send next batsman in
  fastify.post('/api/scoring/next-batsman', async (request, reply) => {
    const { inningsId, playerId } = request.body
    const batsman = await prisma.batsmanInnings.update({
      where: { inningsId_playerId: { inningsId, playerId } },
      data: { status: 'BATTING' }
    })
    return batsman
  })

  // End innings
  fastify.post('/api/scoring/end-innings', async (request, reply) => {
    const { inningsId, matchId } = request.body

    // Mark all remaining batsmen as NOT_OUT
    await prisma.batsmanInnings.updateMany({
      where: { inningsId, status: 'BATTING' },
      data: { status: 'NOT_OUT' }
    })

    // Update innings status
    const innings = await prisma.innings.update({
      where: { id: inningsId },
      data: { status: 'COMPLETED' }
    })

    // If this was the last innings, set target for next innings
    if (innings.inningsNumber === 1) {
      await prisma.match.update({
        where: { id: matchId },
        data: { status: 'INNINGS_BREAK' }
      })
    }

    return innings
  })

  // Get current innings state
  fastify.get('/api/scoring/state/:matchId', async (request, reply) => {
    const { getMatchState } = require('../services/matchState')
    const state = await getMatchState(request.params.matchId)
    if (!state) return reply.status(404).send({ error: 'No live state found' })
    return state
  })
}

module.exports = scoringRoutes
