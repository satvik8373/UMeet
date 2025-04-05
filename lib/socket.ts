import { Manager } from 'socket.io-client'
import { config } from './config'

interface SocketAuth {
  userId: string
  email: string
  name?: string
}

const manager = new Manager(config.socketUrl, {
  ...config.socketOptions,
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ['websocket']
})

const socket = manager.socket('/')

// Add type-safe auth setter
const setSocketAuth = (auth: SocketAuth) => {
  if (socket.connected) {
    socket.disconnect()
  }
  
  // Reconnect with new auth
  socket.connect()
  socket.emit('authenticate', auth)
}

export { socket, setSocketAuth }
export type { SocketAuth }
export type { Socket } from 'socket.io-client' 