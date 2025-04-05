import mongoose from 'mongoose'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { resolve } from 'path'

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from .env.local
const envPath = resolve(process.cwd(), '.env.local')
console.log('Loading environment variables from:', envPath)
config({ path: envPath })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set')
  console.error('Please make sure you have a .env.local file with MONGODB_URI defined')
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

// Encode special characters in the connection string
const encodedUri = MONGODB_URI.replace(
  /mongodb\+srv:\/\/([^:]+):([^@]+)@/,
  (_, username, password) => {
    const encodedPassword = encodeURIComponent(password)
    return `mongodb+srv://${username}:${encodedPassword}@`
  }
)

// Define a type for the cached mongoose connection
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Add mongoose to the global type
declare global {
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose as MongooseCache;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  try {
    if (cached.conn) {
      console.log('✅ Using cached database connection')
      return cached.conn
    }

    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4 // Force IPv4
      }

      console.log('🔄 Connecting to MongoDB...')
      console.log('Connection details:', {
        uri: encodedUri.replace(/:[^@]+@/, ':****@'),
        options: opts
      })
      
      cached.promise = mongoose.connect(encodedUri, opts)
        .then((mongoose) => {
          console.log('✅ Successfully connected to MongoDB')
          mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err)
          })
          mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected')
            cached.conn = null
            cached.promise = null
          })
          return mongoose
        })
    }

    cached.conn = await cached.promise
    return cached.conn
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error)
    cached.promise = null
    cached.conn = null
    throw error
  }
}

// Test the database connection
export async function testConnection() {
  try {
    const mongoose = await connectDB()
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      await mongoose.connection.db.admin().ping()
      console.log('🟢 MongoDB connection test successful')
      return true
    }
    console.error('🔴 MongoDB connection not established')
    return false
  } catch (error) {
    console.error('🔴 MongoDB connection test failed:', error)
    return false
  }
} 