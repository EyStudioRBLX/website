import mongoose, { Schema, Document, Model } from 'mongoose'

export interface MessageResponse {
  fieldId: string
  label: string
  value: string
}

export interface IMessage extends Document {
  name: string
  email: string
  subject: string
  message: string
  responses: MessageResponse[]
  discordId: string | null
  status: 'new' | 'read' | 'replied'
  createdAt: Date
}

const MessageSchema = new Schema<IMessage>(
  {
    name:      { type: String, default: '' },
    email:     { type: String, default: '' },
    subject:   { type: String, default: '' },
    message:   { type: String, default: '' },
    responses: {
      type: [{ fieldId: String, label: String, value: String, _id: false }],
      default: [],
    },
    discordId: { type: String, default: null },
    status:    { type: String, enum: ['new', 'read', 'replied'], default: 'new' },
  },
  { timestamps: true }
)

export const Message: Model<IMessage> =
  mongoose.models.Message ?? mongoose.model<IMessage>('Message', MessageSchema)
