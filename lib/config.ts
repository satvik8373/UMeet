const isProd = process.env.NODE_ENV === 'production'
const baseUrl = isProd ? 'https://umeet.onrender.com' : 'http://localhost:4000'
const nextUrl = isProd ? 'https://umeet.onrender.com' : 'http://localhost:3000'

export const config = {
  socketUrl: baseUrl,
  nextAuthUrl: process.env.NEXTAUTH_URL || nextUrl,
  env: process.env.NODE_ENV || 'development',
  socketOptions: {
    path: '/socket.io/',
    transports: ['polling', 'websocket'],
    secure: isProd,
    rejectUnauthorized: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    autoConnect: false,
    forceNew: true,
    withCredentials: true,
    pingTimeout: 60000,
    pingInterval: 25000,
    extraHeaders: {
      'Access-Control-Allow-Credentials': 'true'
    }
  }
}