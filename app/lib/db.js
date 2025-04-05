import mongoose from 'mongoose';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { resolve } from 'path';
// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Load environment variables from .env.local
const envPath = resolve(process.cwd(), '.env.local');
console.log('Loading environment variables from:', envPath);
config({ path: envPath });
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set');
    console.error('Please make sure you have a .env.local file with MONGODB_URI defined');
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}
// Encode special characters in the connection string
const encodedUri = MONGODB_URI.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, (_, username, password) => {
    const encodedPassword = encodeURIComponent(password);
    return `mongodb+srv://${username}:${encodedPassword}@`;
});
let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}
export async function connectDB() {
    if (cached.conn) {
        console.log('✅ Using cached database connection');
        return cached.conn;
    }
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };
        console.log('🔄 Connecting to MongoDB...');
        console.log('MongoDB URI exists:', !!MONGODB_URI);
        cached.promise = mongoose.connect(encodedUri, opts)
            .then((mongoose) => {
            console.log('✅ Successfully connected to MongoDB');
            return mongoose;
        })
            .catch((error) => {
            console.error('❌ MongoDB connection error:', error);
            throw error;
        });
    }
    try {
        cached.conn = await cached.promise;
    }
    catch (e) {
        cached.promise = null;
        console.error('❌ Failed to establish MongoDB connection:', e);
        throw e;
    }
    return cached.conn;
}
// Test the database connection
export async function testConnection() {
    try {
        await connectDB();
        // Try to ping the database
        if (mongoose.connection.db) {
            await mongoose.connection.db.admin().ping();
            console.log('🟢 MongoDB connection test successful');
            return true;
        }
        console.error('🔴 MongoDB connection not established');
        return false;
    }
    catch (error) {
        console.error('🔴 MongoDB connection test failed:', error);
        return false;
    }
}
