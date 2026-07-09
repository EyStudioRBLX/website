import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAnnouncement extends Document {
  discordId: string
  title: string
  body: string
  tag: string
  tagColor: string
  date: Date
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    discordId: { type: String, required: true },
    title:     { type: String, required: true },
    body:      { type: String, required: true },
    tag:       { type: String, default: 'news' },
    tagColor:  { type: String, default: '#22d3ee' },
    date:      { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export const Announcement: Model<IAnnouncement> =
  mongoose.models.Announcement ?? mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema)
