const prisma = require('../db')

async function playerRoutes(fastify) {
  // List all players
  fastify.get('/api/players', async (request) => {
    const { role, search } = request.query
    const where = {}
    if (role) where.role = role
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ]
    }
    return prisma.player.findMany({
      where,
      include: { teams: { include: { team: true } } },
      orderBy: { lastName: 'asc' }
    })
  })

  // Get single player
  fastify.get('/api/players/:id', async (request, reply) => {
    const player = await prisma.player.findUnique({
      where: { id: request.params.id },
      include: {
        teams: { include: { team: true } },
        batsmanInnings: { orderBy: { innings: { createdAt: 'desc' } }, take: 10 },
        bowlerInnings: { orderBy: { innings: { createdAt: 'desc' } }, take: 10 }
      }
    })
    if (!player) return reply.status(404).send({ error: 'Player not found' })
    return player
  })

  // Create player
  fastify.post('/api/players', async (request, reply) => {
    const { firstName, lastName, role, headshotUrl, jerseyNumber } = request.body
    const player = await prisma.player.create({
      data: { firstName, lastName, role, headshotUrl, jerseyNumber }
    })
    return reply.status(201).send(player)
  })

  // Bulk import players (CSV-style JSON array)
  fastify.post('/api/players/bulk', async (request, reply) => {
    const { players } = request.body // Array of { firstName, lastName, role, jerseyNumber, teamId? }
    const created = await prisma.$transaction(
      players.map(p => prisma.player.create({
        data: {
          firstName: p.firstName,
          lastName: p.lastName,
          role: p.role || 'ALL_ROUNDER',
          jerseyNumber: p.jerseyNumber,
          headshotUrl: p.headshotUrl,
          ...(p.teamId ? { teams: { create: { teamId: p.teamId } } } : {})
        }
      }))
    )
    return reply.status(201).send({ count: created.length, players: created })
  })

  // Update player
  fastify.put('/api/players/:id', async (request, reply) => {
    const player = await prisma.player.update({
      where: { id: request.params.id },
      data: request.body
    })
    return player
  })

  // Delete player
  fastify.delete('/api/players/:id', async (request, reply) => {
    await prisma.player.delete({ where: { id: request.params.id } })
    return { success: true }
  })
}

module.exports = playerRoutes
