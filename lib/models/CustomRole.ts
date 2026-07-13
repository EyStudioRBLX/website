import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICustomRole extends Document {
  name: string
  displayName: string
  color: string
  permissions: string[]
  createdBy: string
}

const CustomRoleSchema = new Schema<ICustomRole>(
  {
    name:        { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    color:       { type: String, required: true, default: '#6d28d9' },
    permissions: [{ type: String }],
    createdBy:   { type: String, required: true },
  },
  { timestamps: true }
)

export const CustomRole: Model<ICustomRole> =
  mongoose.models.CustomRole ?? mongoose.model<ICustomRole>('CustomRole', CustomRoleSchema)
