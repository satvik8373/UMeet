import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectDB } from '../../lib/db'
import User from '../../../models/User'
import { JWT } from 'next-auth/jwt'

export const authConfig: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Please enter an email and password')
          }

          await connectDB()

          const user = await User.findOne({ email: credentials.email.toLowerCase() })

          if (!user) {
            throw new Error('No user found with this email')
          }

          const isValid = await bcrypt.compare(credentials.password, user.password)

          if (!isValid) {
            throw new Error('Invalid password')
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          }
        } catch (error) {
          console.error('Authorization error:', error)
          throw error
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/',
    error: '/', // Redirect to home page on error
  },
  callbacks: {
    async jwt({ token, user, trigger, session }: { token: JWT; user: any; trigger?: string; session?: any }) {
      if (user) {
        // Initial sign in
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }

      if (trigger === 'update' && session?.name) {
        // Update the token when the session is updated
        token.name = session.name
        
        // Update the user in the database
        try {
          await connectDB()
          await User.findOneAndUpdate(
            { email: token.email },
            { name: session.name },
            { new: true }
          )
        } catch (error) {
          console.error('Error updating user in JWT callback:', error)
        }
      }

      return token
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (session.user) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.name = token.name
      }
      return session
    }
  },
  events: {
    async signIn({ user }) {
      // Ensure user has a name in the database
      try {
        await connectDB()
        const dbUser = await User.findById(user.id)
        if (dbUser && !dbUser.name) {
          await User.findByIdAndUpdate(user.id, { name: user.email.split('@')[0] })
        }
      } catch (error) {
        console.error('Error in signIn event:', error)
      }
    }
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
} 