import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import express from 'express'
import type { Request, Response } from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { connectDB } from './app/lib/db.js'
import Room from './models/Room.js'
import mongoose from 'mongoose'
import cors from 'cors'
import next from 'next'

const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const nextHandler = nextApp.getRequestHandler()

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables based on environment
if (dev) {
  const envPath = join(__dirname, '.env.local')
  console.log('Loading environment variables from:', envPath)
  dotenv.config({ path: envPath })
}

const PORT = Number(process.env.PORT) || 4000

console.log('Environment check:')
console.log('- NODE_ENV:', process.env.NODE_ENV)
console.log('- MONGODB_URI exists:', !!process.env.MONGODB_URI)
console.log('- PORT:', PORT)
console.log('- Development mode:', dev)

// Connect to MongoDB and start server
console.log('🔄 Connecting to MongoDB...')
console.log('MongoDB URI exists:', !!process.env.MONGODB_URI)

connectDB()
  .then(() => {
    console.log('✅ Successfully connected to MongoDB')
    return nextApp.prepare()
  })
  .then(() => {
    const app = express()
    const server = createServer(app)

    // Enable CORS with specific origin
    const corsOrigin = dev ? 'http://localhost:3000' : 'https://umeet.onrender.com'
    const corsOptions = {
      origin: corsOrigin,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
      optionsSuccessStatus: 204,
      allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Credentials']
    }
    app.use(cors(corsOptions))

    // Socket.IO server configuration
    const io = new Server(server, {
      path: '/socket.io/',
      cors: corsOptions,
      transports: ['polling', 'websocket'],
      pingTimeout: 60000,
      pingInterval: 25000
    })

    // Log Socket.IO configuration
    console.log('Socket.IO Configuration:', {
      path: '/socket.io/',
      transports: ['polling', 'websocket'],
      cors: corsOptions,
      serverPort: PORT,
      environment: process.env.NODE_ENV
    })

    // Health check endpoint
    app.get('/api/health', async (req: Request, res: Response) => {
      try {
        const isMongoConnected = mongoose.connection.readyState === 1
        const socketStatus = io.engine?.clientsCount !== undefined ? 'active' : 'inactive'
        
        const healthStatus = {
          status: isMongoConnected && socketStatus === 'active' ? 'healthy' : 'degraded',
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development',
          mongoConnected: isMongoConnected,
          socketServer: socketStatus,
          version: '1.0.0',
          uptime: process.uptime()
        }

        res.status(isMongoConnected ? 200 : 503).json(healthStatus)
      } catch (error) {
        const err = error as Error
        console.error('Health check error:', err)
        res.status(500).json({
          status: 'error',
          timestamp: new Date().toISOString(),
          error: err.message || 'Unknown error'
        })
      }
    })

    // Handle all other routes with Next.js
    app.all('*', (req: Request, res: Response) => {
      return nextHandler(req, res)
    })

    // Start server
    server.listen(PORT, () => {
      console.log(`> Server listening on port ${PORT}`)
    })

    // Socket event handlers
    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)
      
      socket.emit('connect_success', { socketId: socket.id })

      socket.on('authenticate', (auth) => {
        console.log('Client authenticated:', auth)
        socket.data.auth = auth
      })

      socket.on('join-room', async ({ roomId, userId, email, name }) => {
        try {
          console.log(`User ${email} (${userId}) attempting to join room ${roomId}`)
          
          const room = await Room.findById(roomId)
          if (!room) {
            socket.emit('error', { message: 'Room not found' })
            return
          }

          await socket.join(roomId)
          
          // Get all sockets in the room
          const sockets = await io.in(roomId).fetchSockets()
          const participants = sockets.reduce((acc, socket) => {
            const auth = socket.data.auth
            if (auth?.userId && auth?.email) {
              acc[auth.userId] = {
                email: auth.email,
                socketId: socket.id,
                isHost: auth.userId === room.hostId.toString(),
                isOnline: true,
                name: auth.name || auth.email
              }
            }
            return acc
          }, {} as Record<string, {
            email: string
            socketId: string
            isHost: boolean
            isOnline: boolean
            name?: string
          }>)

          // Send initial room state
          socket.emit('room-state', {
            participants,
            videoState: {
              videoUrl: room.videoUrl,
              isPlaying: false,
              currentTime: 0,
              lastUpdated: Date.now()
            },
            name: room.name || 'Room'
          })

          socket.emit('room-joined', { roomId })
          socket.to(roomId).emit('user-joined', { userId, email })

        } catch (error) {
          console.error('Error joining room:', error)
          socket.emit('error', { message: 'Failed to join room' })
        }
      })

      // Handle chat messages
      socket.on('chat-message', ({ roomId, message }) => {
        console.log('Received chat message in room:', roomId, message)
        // Broadcast the message to all users in the room
        io.to(roomId).emit('chat-message', message)
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })
  })
  .catch((err) => {
    console.error('Failed to start server:', err)
    process.exit(1)
  })