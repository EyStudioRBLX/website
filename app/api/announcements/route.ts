import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Announcement } from '@/lib/models/Announcement'

export async function GET() {
  await connectDB()
  const announcements = await Announcement.find().sort({ date: -1 }).lean()
  return NextResponse.json({ announcements })
}
