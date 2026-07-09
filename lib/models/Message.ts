import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IMessage extends Document {
  name: string
  email: string
  subject: string
  message: string
  discordId: string | null
  status: 'new' | 'read' | 'replied'
  createdAt: Date
}

const MessageSchema = new Schema<IMessage>(
  {
    name:      { type: String, required: true },
    email:     { type: String, required: true },
    subject:   { type: String, required: true },
    message:   { type: String, required: true },
    discordId: { type: String, default: null },
    status:    { type: String, enum: ['new', 'read', 'replied'], default: 'new' },
  },
  { timestamps: true }
)

export const Message: Model<IMessage> =
  mongoose.models.Message ?? mongoose.model<IMessage>('Message', MessageSchema)
