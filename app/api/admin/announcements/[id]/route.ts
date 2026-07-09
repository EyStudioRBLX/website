import { NextRequest, NextResponse } from 'next/server'
import { requireFounder } from '@/lib/adminGuard'
import { connectDB } from '@/lib/mongodb'
import { Announcement } from '@/lib/models/Announcement'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireFounder()
  if ('error' in guard) return guard.error

  const { id } = params
  const body = await req.json()

  await connectDB()
  const announcement = await Announcement.findByIdAndUpdate(id, body, { new: true })
  if (!announcement) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ announcement })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireFounder()
  if ('error' in guard) return guard.error

  const { id } = params

  await connectDB()
  const announcement = await Announcement.findByIdAndDelete(id)
  if (!announcement) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ success: true })
}
