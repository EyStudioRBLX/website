import { NextRequest, NextResponse } from 'next/server'
import { requireFounder } from '@/lib/adminGuard'
import { connectDB } from '@/lib/mongodb'
import { Announcement } from '@/lib/models/Announcement'

export const dynamic = 'force-dynamic'

export async function GET() {
  const guard = await requireFounder()
  if ('error' in guard) return guard.error

  await connectDB()
  const announcements = await Announcement.find({}).sort({ date: -1 }).lean()
  return NextResponse.json({ announcements })
}

export async function POST(req: NextRequest) {
  const guard = await requireFounder()
  if ('error' in guard) return guard.error

  const { discordId } = guard
  const body = await req.json()
  const { title, body: bodyText, tag, tagColor } = body

  if (!title || !bodyText) {
    return NextResponse.json({ error: 'title and body are required' }, { status: 400 })
  }

  await connectDB()
  const announcement = await Announcement.create({
    discordId,
    title,
    body: bodyText,
    tag: tag ?? 'news',
    tagColor: tagColor ?? '#22d3ee',
  })

  return NextResponse.json({ announcement }, { status: 201 })
}
