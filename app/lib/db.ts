import mongoose from 'mongoose'

// Get MongoDB URI - will be undefined during build, that's okay
const MONGODB_URI = process.env.MONGODB_URI

// Encode special characters in the connection string
function getEncodedUri(): string {
  if (!MONGODB_URI) {
    return ''
  }
  
  return MONGODB_URI.replace(
    /mongodb\+srv:\/\/([^:]+):([^@]+)@/,
    (_, username, password) => {
      const encodedPassword = encodeURIComponent(password)
      return `mongodb+srv://${username}:${encodedPassword}@`
    }
  )
}

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
    const encodedUri = getEncodedUri()
    
    // Check if MONGODB_URI is available
    if (!MONGODB_URI || !encodedUri) {
      throw new Error('MONGODB_URI is not defined. Please set it in your environment variables.')
    }

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