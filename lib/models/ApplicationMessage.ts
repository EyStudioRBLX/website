import mongoose, { Schema, Document, models, model } from 'mongoose'

export interface IApplicationMessage extends Document {
  applicationId: mongoose.Types.ObjectId
  discordId: string
  direction: 'admin' | 'user'
  content: string
  authorName: string
  timestamp: Date
  read: boolean
}

const ApplicationMessageSchema = new Schema<IApplicationMessage>({
  applicationId: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
  discordId: { type: String, required: true },
  direction: { type: String, enum: ['admin', 'user'], required: true },
  content: { type: String, required: true },
  authorName: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
})

ApplicationMessageSchema.index({ applicationId: 1, timestamp: 1 })
ApplicationMessageSchema.index({ discordId: 1, direction: 1 })

export const ApplicationMessage =
  models.ApplicationMessage ?? model<IApplicationMessage>('ApplicationMessage', ApplicationMessageSchema)
