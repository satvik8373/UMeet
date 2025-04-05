import { Socket as SocketIOClient } from 'socket.io-client'

declare global {
  type Socket = SocketIOClient
}

export {} 