const prisma = require('../db')

async function teamRoutes(fastify) {
  // List all teams
  fastify.get('/api/teams', async () => {
    return prisma.team.findMany({
      include: {
        players: { include: { player: true } },
        _count: { select: { players: true } }
      },
      orderBy: { name: 'asc' }
    })
  })

  // Get single team with roster
  fastify.get('/api/teams/:id', async (request, reply) => {
    const team = await prisma.team.findUnique({
      where: { id: request.params.id },
      include: {
        players: { include: { player: true } }
      }
    })
    if (!team) return reply.status(404).send({ error: 'Team not found' })
    return team
  })

  // Create team
  fastify.post('/api/teams', async (request, reply) => {
    const { name, shortName, color, logoUrl } = request.body
    const team = await prisma.team.create({
      data: { name, shortName, color, logoUrl }
    })
    return reply.status(201).send(team)
  })

  // Update team
  fastify.put('/api/teams/:id', async (request, reply) => {
    const team = await prisma.team.update({
      where: { id: request.params.id },
      data: request.body
    })
    return team
  })

  // Delete team
  fastify.delete('/api/teams/:id', async (request, reply) => {
    await prisma.team.delete({ where: { id: request.params.id } })
    return { success: true }
  })

  // Add player to team roster
  fastify.post('/api/teams/:id/players', async (request, reply) => {
    const { playerId } = request.body
    const teamPlayer = await prisma.teamPlayer.create({
      data: { teamId: request.params.id, playerId },
      include: { player: true }
    })
    return reply.status(201).send(teamPlayer)
  })

  // Remove player from team roster
  fastify.delete('/api/teams/:teamId/players/:playerId', async (request, reply) => {
    await prisma.teamPlayer.delete({
      where: {
        teamId_playerId: {
          teamId: request.params.teamId,
          playerId: request.params.playerId
        }
      }
    })
    return { success: true }
  })
}

module.exports = teamRoutes
