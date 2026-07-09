import mongoose, { Schema, Document, models, model } from 'mongoose'

export interface FormField {
  id: string
  label: string
  type: 'text' | 'textarea' | 'url' | 'select' | 'image'
  placeholder: string
  required: boolean
  options: string[]
  order: number
}

export interface IPosition extends Document {
  title: string
  description: string
  requirements: string
  gameName: string
  status: 'open' | 'closed'
  fields: FormField[]
  createdAt: Date
  updatedAt: Date
}

const FormFieldSchema = new Schema<FormField>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: ['text', 'textarea', 'url', 'select', 'image'], default: 'text' },
    placeholder: { type: String, default: '' },
    required: { type: Boolean, default: false },
    options: [{ type: String }],
    order: { type: Number, default: 0 },
  },
  { _id: false }
)

const PositionSchema = new Schema<IPosition>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    requirements: { type: String, default: '' },
    gameName: { type: String, default: '' },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    fields: { type: [FormFieldSchema], default: [] },
  },
  { timestamps: true }
)

export const Position = models.Position ?? model<IPosition>('Position', PositionSchema)
