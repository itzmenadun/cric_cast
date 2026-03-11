const { Server } = require('socket.io')

let io = null

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`)

    socket.on('join-match', (matchId) => {
      socket.join(`match:${matchId}`)
      console.log(`[Socket.io] ${socket.id} joined match:${matchId}`)
    })

    socket.on('leave-match', (matchId) => {
      socket.leave(`match:${matchId}`)
      console.log(`[Socket.io] ${socket.id} left match:${matchId}`)
    })

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`)
    })
  })

  return io
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized')
  return io
}

function broadcastMatchUpdate(matchId, data) {
  if (!io) return
  io.to(`match:${matchId}`).emit('match-update', data)
}

function broadcastGfxCommand(matchId, command, payload) {
  if (!io) return
  io.to(`match:${matchId}`).emit('gfx-command', { command, ...payload })
}

module.exports = { initSocket, getIO, broadcastMatchUpdate, broadcastGfxCommand }
