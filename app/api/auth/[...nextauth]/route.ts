import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

// Create the auth handlers with the imported configuration
const handler = NextAuth(authConfig)

// Export the GET and POST handlers
export { handler as GET, handler as POST } 