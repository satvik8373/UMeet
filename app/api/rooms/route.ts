import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/db'
import Room from '@/models/Room'
import { authConfig } from '../auth/auth.config'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig)

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { videoUrl } = await request.json()

    // Validate YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|live\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
    if (!youtubeRegex.test(videoUrl)) {
      return NextResponse.json(
        { message: 'Invalid YouTube URL' },
        { status: 400 }
      )
    }

    await connectDB()

    const room = await Room.create({
      videoUrl,
      hostId: session.user.id,
      participants: [session.user.id],
    })

    return NextResponse.json(
      {
        message: 'Room created successfully',
        roomId: room._id,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { message: 'Failed to create room' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authConfig)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()

    const rooms = await Room.find({
      $or: [
        { hostId: session.user.id },
        { participants: session.user.id },
      ],
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('hostId', 'email')

    return NextResponse.json({ rooms })
  } catch (error) {
    console.error('Get rooms error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 