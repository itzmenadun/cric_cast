const prisma = require('../db')

async function matchRoutes(fastify) {
  // List all matches (optionally filtered by tournament)
  fastify.get('/api/matches', async (request) => {
    const { tournamentId, status } = request.query
    const where = {}
    if (tournamentId) where.tournamentId = tournamentId
    if (status) where.status = status
    return prisma.match.findMany({
      where,
      include: { homeTeam: true, awayTeam: true, tournament: true },
      orderBy: { matchDate: 'desc' }
    })
  })

  // Get single match with full details
  fastify.get('/api/matches/:id', async (request, reply) => {
    const match = await prisma.match.findUnique({
      where: { id: request.params.id },
      include: {
        homeTeam: true,
        awayTeam: true,
        tournament: true,
        tossWinner: true,
        matchPlayers: { include: { player: true, team: true } },
        innings: {
          include: {
            battingTeam: true,
            bowlingTeam: true,
            batsmanInnings: { include: { player: true }, orderBy: { battingPosition: 'asc' } },
            bowlerInnings: { include: { player: true }, orderBy: { oversBowled: 'desc' } }
          },
          orderBy: { inningsNumber: 'asc' }
        }
      }
    })
    if (!match) return reply.status(404).send({ error: 'Match not found' })
    return match
  })

  // Create match
  fastify.post('/api/matches', async (request, reply) => {
    const { tournamentId, homeTeamId, awayTeamId, format, oversPerInnings, venue, matchDate } = request.body
    const match = await prisma.match.create({
      data: {
        tournamentId, homeTeamId, awayTeamId,
        format, oversPerInnings,
        venue, matchDate: matchDate ? new Date(matchDate) : null
      },
      include: { homeTeam: true, awayTeam: true }
    })
    return reply.status(201).send(match)
  })

  // Record toss
  fastify.post('/api/matches/:id/toss', async (request, reply) => {
    const { tossWinnerId, tossDecision } = request.body
    const match = await prisma.match.update({
      where: { id: request.params.id },
      data: { tossWinnerId, tossDecision, status: 'TOSS' },
      include: { homeTeam: true, awayTeam: true, tossWinner: true }
    })
    return match
  })

  // Set playing XI lineup
  fastify.post('/api/matches/:id/lineup', async (request, reply) => {
    const { players } = request.body // Array of { playerId, teamId, battingOrder }
    const matchId = request.params.id

    // Clear existing lineup
    await prisma.matchPlayer.deleteMany({ where: { matchId } })

    // Insert new lineup
    const created = await prisma.$transaction(
      players.map((p, i) => prisma.matchPlayer.create({
        data: {
          matchId,
          playerId: p.playerId,
          teamId: p.teamId,
          isPlaying: true,
          battingOrder: p.battingOrder || (i + 1)
        }
      }))
    )
    return reply.status(201).send({ count: created.length, players: created })
  })

  // Start innings
  fastify.post('/api/matches/:id/start-innings', async (request, reply) => {
    const { battingTeamId, bowlingTeamId, inningsNumber } = request.body
    const matchId = request.params.id

    const innings = await prisma.innings.create({
      data: {
        matchId, battingTeamId, bowlingTeamId,
        inningsNumber, status: 'IN_PROGRESS'
      }
    })

    // Update match status to LIVE
    await prisma.match.update({
      where: { id: matchId },
      data: { status: 'LIVE' }
    })

    // Create BatsmanInnings for all playing XI batsmen
    const battingPlayers = await prisma.matchPlayer.findMany({
      where: { matchId, teamId: battingTeamId, isPlaying: true },
      orderBy: { battingOrder: 'asc' }
    })

    await prisma.$transaction(
      battingPlayers.map((mp, i) => prisma.batsmanInnings.create({
        data: {
          inningsId: innings.id,
          playerId: mp.playerId,
          status: i < 2 ? 'BATTING' : 'DID_NOT_BAT',
          battingPosition: mp.battingOrder || (i + 1)
        }
      }))
    )

    return reply.status(201).send(innings)
  })

  // Update match
  fastify.put('/api/matches/:id', async (request, reply) => {
    const match = await prisma.match.update({
      where: { id: request.params.id },
      data: request.body
    })
    return match
  })

  // Delete match
  fastify.delete('/api/matches/:id', async (request, reply) => {
    await prisma.match.delete({ where: { id: request.params.id } })
    return { success: true }
  })
}

module.exports = matchRoutes
