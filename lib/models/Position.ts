import mongoose, { Schema, Document, models, model } from 'mongoose'

export interface IPosition extends Document {
  title: string
  description: string
  requirements: string
  gameName: string
  status: 'open' | 'closed'
  createdAt: Date
  updatedAt: Date
}

const PositionSchema = new Schema<IPosition>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    requirements: { type: String, default: '' },
    gameName: { type: String, default: '' },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
  },
  { timestamps: true }
)

export const Position = models.Position ?? model<IPosition>('Position', PositionSchema)
