const { PrismaClient } = require('@prisma/client')
const { getMatchState } = require('../services/matchState')

const prisma = new PrismaClient()

async function gfxRoutes(fastify) {
  // Live match state for GFX engine (from Redis cache)
  fastify.get('/api/gfx/live/:matchId', async (request, reply) => {
    const state = await getMatchState(request.params.matchId)
    if (!state) return reply.status(404).send({ error: 'No live state' })
    return state
  })

  // Full scorecard for full-screen overlays
  fastify.get('/api/gfx/scorecard/:matchId', async (request, reply) => {
    const match = await prisma.match.findUnique({
      where: { id: request.params.matchId },
      include: {
        homeTeam: true,
        awayTeam: true,
        innings: {
          include: {
            battingTeam: true,
            batsmanInnings: {
              include: { player: true, dismissedBy: true, fielder: true },
              orderBy: { battingPosition: 'asc' }
            },
            bowlerInnings: {
              include: { player: true },
              orderBy: { oversBowled: 'desc' }
            }
          },
          orderBy: { inningsNumber: 'asc' }
        }
      }
    })
    if (!match) return reply.status(404).send({ error: 'Match not found' })
    return match
  })

  // Playing XI for pre-match graphic
  fastify.get('/api/gfx/playing-xi/:matchId', async (request, reply) => {
    const matchPlayers = await prisma.matchPlayer.findMany({
      where: { matchId: request.params.matchId, isPlaying: true },
      include: { player: true, team: true },
      orderBy: { battingOrder: 'asc' }
    })

    const homeTeam = []
    const awayTeam = []
    matchPlayers.forEach(mp => {
      const entry = {
        name: `${mp.player.firstName} ${mp.player.lastName}`,
        role: mp.player.role,
        jerseyNumber: mp.player.jerseyNumber,
        headshotUrl: mp.player.headshotUrl,
        battingOrder: mp.battingOrder
      }
      if (mp.team) {
        // Group by team
        if (homeTeam.length === 0 || homeTeam[0]?.teamId === mp.teamId) {
          entry.teamId = mp.teamId
          homeTeam.push(entry)
        } else {
          entry.teamId = mp.teamId
          awayTeam.push(entry)
        }
      }
    })

    return { homeTeam, awayTeam }
  })

  // Points table for tournament
  fastify.get('/api/gfx/points-table/:tournamentId', async (request, reply) => {
    // For now, return matches grouped by team with basic W/L/NR counts
    const matches = await prisma.match.findMany({
      where: { tournamentId: request.params.tournamentId, status: 'COMPLETED' },
      include: { homeTeam: true, awayTeam: true, innings: true }
    })
    // Points table calculation would go here
    return { tournamentId: request.params.tournamentId, matches: matches.length, table: [] }
  })
}

module.exports = gfxRoutes
