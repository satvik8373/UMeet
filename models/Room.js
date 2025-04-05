import mongoose from 'mongoose';
const roomSchema = new mongoose.Schema({
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
}, {
    timestamps: true,
});
const Room = mongoose.models.Room || mongoose.model('Room', roomSchema);
export default Room;
