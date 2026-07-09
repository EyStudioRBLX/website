import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ITeamMember extends Document {
  initials: string
  name: string
  role: string
  bio: string
  color: string
  badge: string
  level: number
  order: number
}

const TeamMemberSchema = new Schema<ITeamMember>(
  {
    initials: { type: String, required: true, maxlength: 3 },
    name:     { type: String, required: true },
    role:     { type: String, required: true },
    bio:      { type: String, default: '' },
    color:    { type: String, default: '#8b5cf6' },
    badge:    { type: String, default: 'Member' },
    level:    { type: Number, min: 1, max: 50, default: 1 },
    order:    { type: Number, default: 0 },
  },
  { timestamps: true }
)

export const TeamMember: Model<ITeamMember> =
  mongoose.models.TeamMember ?? mongoose.model<ITeamMember>('TeamMember', TeamMemberSchema)
