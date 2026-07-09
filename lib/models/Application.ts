import mongoose, { Schema, Document, models, model } from 'mongoose'

export interface IApplication extends Document {
  positionId: mongoose.Types.ObjectId
  positionTitle: string
  gameName: string
  discordId: string
  applicantName: string
  applicantTag: string
  message: string
  portfolio: string
  status: 'pending' | 'accepted' | 'rejected'
  appliedAt: Date
}

const ApplicationSchema = new Schema<IApplication>({
  positionId: { type: Schema.Types.ObjectId, ref: 'Position', required: true },
  positionTitle: { type: String, required: true },
  gameName: { type: String, default: '' },
  discordId: { type: String, required: true },
  applicantName: { type: String, required: true },
  applicantTag: { type: String, default: '' },
  message: { type: String, required: true },
  portfolio: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  appliedAt: { type: Date, default: Date.now },
})

export const Application = models.Application ?? model<IApplication>('Application', ApplicationSchema)
