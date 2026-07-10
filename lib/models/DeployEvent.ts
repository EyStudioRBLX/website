import { Schema, Document, models, model } from 'mongoose'

export interface IDeployEvent extends Document {
  deployedAt: Date
  environment: string
}

const DeployEventSchema = new Schema<IDeployEvent>({
  deployedAt: { type: Date, default: Date.now },
  environment: { type: String, default: 'production' },
})

export const DeployEvent =
  models.DeployEvent ?? model<IDeployEvent>('DeployEvent', DeployEventSchema)
