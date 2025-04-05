import mongoose from 'mongoose'

export interface IUser extends mongoose.Document {
  name: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot be more than 50 characters'],
      validate: [{
        validator: function(value: string): boolean {
          return Boolean(value && value.trim().length >= 2);
        },
        message: 'Name cannot be empty or less than 2 characters'
      }]
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password should be at least 6 characters'],
    },
  },
  {
    timestamps: true,
  }
)

// Add middleware to ensure name is properly trimmed
userSchema.pre('save', function(this: IUser, next) {
  if (this.name) {
    this.name = this.name.trim()
  }
  next()
})

userSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate() as { $set?: { name?: string } }
  if (update?.$set?.name) {
    update.$set.name = update.$set.name.trim()
  }
  next()
})

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema)

export default User 