import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

// Force dynamic rendering - don't try to build this at build time
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Create the auth handlers with the imported configuration
const handler = NextAuth(authConfig)

// Export the GET and POST handlers
export { handler as GET, handler as POST } 