import mongoose from 'mongoose'

export interface IRoom extends mongoose.Document {
  videoUrl: string
  hostId: mongoose.Types.ObjectId
  participants: mongoose.Types.ObjectId[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const roomSchema = new mongoose.Schema<IRoom>(
  {
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required'],
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

const Room = mongoose.models.Room || mongoose.model<IRoom>('Room', roomSchema)

export default Room 