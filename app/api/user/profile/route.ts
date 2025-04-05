import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/app/api/auth/auth.config'
import { connectDB } from '../../../lib/db'
import User from '@/models/User'

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name } = await request.json()

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { message: 'Name must be at least 2 characters long' },
        { status: 400 }
      )
    }

    await connectDB()

    // First check if user exists
    const existingUser = await User.findOne({ email: session.user.email })
    if (!existingUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Update the user's name
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: { name: name.trim() } },
      { new: true, runValidators: true }
    )

    if (!updatedUser) {
      return NextResponse.json(
        { message: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email
      }
    })
  } catch (error: any) {
    console.error('Profile update error:', error)
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { message: Object.values(error.errors).map((err: any) => err.message).join(', ') },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 