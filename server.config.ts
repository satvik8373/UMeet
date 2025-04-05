import { Server as SocketIOServer } from 'socket.io'
import type { ServerOptions } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { Express } from 'express'

interface ServerConfig {
  corsOrigin: string
  socketIOConfig: Partial<ServerOptions>
}

export const createServerConfig = (dev: boolean): ServerConfig => {
  const corsOrigin = dev ? 'http://localhost:3000' : 'https://umeet.onrender.com'

  return {
    corsOrigin,
    socketIOConfig: {
      path: '/socket.io/',
      cors: {
        origin: corsOrigin,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Credentials']
      },
      allowEIO3: true,
      transports: ['polling', 'websocket'],
      pingTimeout: 60000,
      pingInterval: 25000,
      connectTimeout: 45000,
      maxHttpBufferSize: 1e8,
      allowUpgrades: true,
      serveClient: false,
      connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: false
      },
      cleanupEmptyChildNamespaces: true
    }
  }
}

export const setupSocketIO = (server: HTTPServer, config: ServerConfig): SocketIOServer => {
  return new SocketIOServer(server, config.socketIOConfig)
}

export const setupRoutes = (app: Express, nextHandler: any) => {
  // Health check endpoint
  app.get('/api/health', async (req, res) => {
    try {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        uptime: process.uptime()
      })
    } catch (error) {
      res.status(500).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: (error as Error).message || 'Unknown error'
      })
    }
  })

  // Handle all other routes with Next.js
  app.use((req, res) => {
    return nextHandler(req, res)
  })
} 