import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ContactFormField {
  id: string
  label: string
  type: 'text' | 'textarea' | 'email' | 'select' | 'checkbox'
  placeholder: string
  required: boolean
  options: string[]
  order: number
}

export interface IContactFormConfig extends Document {
  fields: ContactFormField[]
  updatedAt: Date
}

const ContactFormFieldSchema = new Schema<ContactFormField>(
  {
    id:          { type: String, required: true },
    label:       { type: String, required: true },
    type:        { type: String, enum: ['text', 'textarea', 'email', 'select', 'checkbox'], required: true },
    placeholder: { type: String, default: '' },
    required:    { type: Boolean, default: true },
    options:     { type: [String], default: [] },
    order:       { type: Number, default: 0 },
  },
  { _id: false }
)

const ContactFormConfigSchema = new Schema<IContactFormConfig>(
  { fields: { type: [ContactFormFieldSchema], default: [] } },
  { timestamps: true }
)

export const ContactFormConfig: Model<IContactFormConfig> =
  mongoose.models.ContactFormConfig ??
  mongoose.model<IContactFormConfig>('ContactFormConfig', ContactFormConfigSchema)

export const DEFAULT_CONTACT_FIELDS: ContactFormField[] = [
  { id: 'name',    label: 'Name',      type: 'text',     placeholder: 'Dein Name',              required: true,  options: [], order: 0 },
  { id: 'email',   label: 'E-Mail',    type: 'email',    placeholder: 'deine@email.de',          required: true,  options: [], order: 1 },
  { id: 'subject', label: 'Betreff',   type: 'text',     placeholder: 'Worum geht es?',          required: true,  options: [], order: 2 },
  { id: 'message', label: 'Nachricht', type: 'textarea', placeholder: 'Beschreibe dein Anliegen…', required: true,  options: [], order: 3 },
]
