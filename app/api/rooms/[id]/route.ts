import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '../../auth/auth.config'
import { connectDB } from '../../../lib/db'
import Room from '@/models/Room'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig)

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()

    const room = await Room.findById(params.id)
      .populate('hostId', 'email')
      .populate('participants', 'email')

    if (!room) {
      return NextResponse.json(
        { message: 'Room not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(room)
  } catch (error: any) {
    console.error('Error getting room:', error)
    return NextResponse.json(
      { message: 'Failed to get room' },
      { status: 500 }
    )
  }
} 