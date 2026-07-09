import mongoose, { Schema, Document, Model } from 'mongoose'
import type { Role } from '@/lib/roles'

export interface IUser extends Document {
  discordId: string
  name: string
  email: string | null
  image: string | null
  role: Role
  joinedAt: Date
  lastSeen: Date
  stats: {
    loginCount: number
    messagesent: number
  }
}

const UserSchema = new Schema<IUser>(
  {
    discordId: { type: String, required: true, unique: true, index: true },
    name:      { type: String, required: true },
    email:     { type: String, default: null },
    image:     { type: String, default: null },
    role:      { type: String, enum: ['user', 'helper', 'skripter', 'mapper', 'owner', 'founder'], default: 'user' },
    joinedAt:  { type: Date, default: Date.now },
    lastSeen:  { type: Date, default: Date.now },
    stats: {
      loginCount:  { type: Number, default: 1 },
      messagesent: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
)

export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>('User', UserSchema)
