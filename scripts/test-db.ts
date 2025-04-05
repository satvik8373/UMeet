import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local first
const envPath = resolve(process.cwd(), '.env.local')
console.log('Loading environment variables from:', envPath)
config({ path: envPath })

// Then import the database utilities
import { testConnection } from '../lib/db'

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set')
    process.exit(1)
  }

  console.log('🔄 Testing MongoDB connection...')
  console.log('MongoDB URI:', process.env.MONGODB_URI.split('@')[1] || 'Not found') // Only show the part after @ for security
  
  try {
    const isConnected = await testConnection()
    if (isConnected) {
      console.log('✅ MongoDB connection test passed')
      process.exit(0)
    } else {
      console.error('❌ MongoDB connection test failed')
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Error testing MongoDB connection:', error)
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('❌ Unhandled error:', error)
  process.exit(1)
})