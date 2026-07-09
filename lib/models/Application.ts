import mongoose, { Schema, Document, models, model } from 'mongoose'

export interface IApplicationResponse {
  fieldId: string
  label: string
  value: string
}

export interface IApplication extends Document {
  positionId: mongoose.Types.ObjectId
  positionTitle: string
  gameName: string
  discordId: string
  applicantName: string
  applicantTag: string
  responses: IApplicationResponse[]
  status: 'pending' | 'accepted' | 'rejected'
  appliedAt: Date
}

const ResponseSchema = new Schema<IApplicationResponse>(
  {
    fieldId: { type: String, required: true },
    label: { type: String, required: true },
    value: { type: String, default: '' },
  },
  { _id: false }
)

const ApplicationSchema = new Schema<IApplication>({
  positionId: { type: Schema.Types.ObjectId, ref: 'Position', required: true },
  positionTitle: { type: String, required: true },
  gameName: { type: String, default: '' },
  discordId: { type: String, required: true },
  applicantName: { type: String, required: true },
  applicantTag: { type: String, default: '' },
  responses: { type: [ResponseSchema], default: [] },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  appliedAt: { type: Date, default: Date.now },
})

export const Application = models.Application ?? model<IApplication>('Application', ApplicationSchema)
