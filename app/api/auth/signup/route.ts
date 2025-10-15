import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '../../../lib/db'
import User from '@/models/User'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Validate name
    const trimmedName = name.trim()
    if (trimmedName.length < 2) {
      return NextResponse.json(
        { message: 'Name must be at least 2 characters long' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new user with explicit name field
    const userData = {
      name: trimmedName,
      email: email.toLowerCase(),
      password: hashedPassword,
    }

    console.log('Creating user with data:', { ...userData, password: '[REDACTED]' })

    const user = await User.create(userData)

    console.log('User created successfully:', {
      id: user._id,
      name: user.name,
      email: user.email
    })

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Signup error:', error)
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const errorMessage = Object.values(error.errors)
        .map((err: any) => err.message)
        .join(', ')
      console.error('Validation error:', errorMessage)
      return NextResponse.json(
        { message: errorMessage },
        { status: 400 }
      )
    }

    // Handle mongoose duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { message: 'Email already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 