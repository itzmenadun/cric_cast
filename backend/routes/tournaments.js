const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function tournamentRoutes(fastify) {
  // List all tournaments
  fastify.get('/api/tournaments', async (request, reply) => {
    const tournaments = await prisma.tournament.findMany({
      include: { matches: { select: { id: true, status: true } } },
      orderBy: { createdAt: 'desc' }
    })
    return tournaments
  })

  // Get single tournament
  fastify.get('/api/tournaments/:id', async (request, reply) => {
    const tournament = await prisma.tournament.findUnique({
      where: { id: request.params.id },
      include: {
        matches: {
          include: { homeTeam: true, awayTeam: true },
          orderBy: { matchDate: 'asc' }
        }
      }
    })
    if (!tournament) return reply.status(404).send({ error: 'Tournament not found' })
    return tournament
  })

  // Create tournament
  fastify.post('/api/tournaments', async (request, reply) => {
    const { name, format, oversPerInnings, startDate, endDate } = request.body
    const tournament = await prisma.tournament.create({
      data: {
        name,
        format,
        oversPerInnings: oversPerInnings || getDefaultOvers(format),
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      }
    })
    return reply.status(201).send(tournament)
  })

  // Update tournament
  fastify.put('/api/tournaments/:id', async (request, reply) => {
    const tournament = await prisma.tournament.update({
      where: { id: request.params.id },
      data: request.body
    })
    return tournament
  })

  // Delete tournament
  fastify.delete('/api/tournaments/:id', async (request, reply) => {
    await prisma.tournament.delete({ where: { id: request.params.id } })
    return { success: true }
  })
}

function getDefaultOvers(format) {
  switch (format) {
    case 'T10': return 10
    case 'T20': return 20
    case 'ODI': return 50
    case 'TEST': return 0
    default: return 20
  }
}

module.exports = tournamentRoutes
