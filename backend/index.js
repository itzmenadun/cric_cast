require('dotenv').config()
const fastify = require('fastify')({ logger: true })
const cors = require('@fastify/cors')
const { initSocket } = require('./services/socketManager')

// ─── Plugins ─────────────────────────────────────────────
fastify.register(cors, { origin: '*' })

// ─── Routes ──────────────────────────────────────────────
fastify.register(require('./routes/tournaments'))
fastify.register(require('./routes/teams'))
fastify.register(require('./routes/players'))
fastify.register(require('./routes/matches'))
fastify.register(require('./routes/scoring'))
fastify.register(require('./routes/gfx'))

// ─── Health Check ────────────────────────────────────────
fastify.get('/', async () => ({ status: 'ok', service: 'criccast-backend' }))

// ─── Start Server ────────────────────────────────────────
const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' })

    // Attach Socket.io to the underlying HTTP server
    const io = initSocket(fastify.server)
    fastify.log.info('[Socket.io] Server initialized')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
