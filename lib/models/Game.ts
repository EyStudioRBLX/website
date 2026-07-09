import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IGame extends Document {
  name: string
  status: 'Dev' | 'Beta' | 'Live'
  visits: string
  fav: string
  statusColor: string
  progress: number
  robloxUrl: string
}

const GameSchema = new Schema<IGame>(
  {
    name:        { type: String, required: true },
    status:      { type: String, enum: ['Dev', 'Beta', 'Live'], default: 'Dev' },
    visits:      { type: String, default: '—' },
    fav:         { type: String, default: '—' },
    statusColor: { type: String, default: '#22d3ee' },
    progress:    { type: Number, min: 0, max: 100, default: 0 },
    robloxUrl:   { type: String, default: '' },
  },
  { timestamps: true }
)

export const Game: Model<IGame> =
  mongoose.models.Game ?? mongoose.model<IGame>('Game', GameSchema)
