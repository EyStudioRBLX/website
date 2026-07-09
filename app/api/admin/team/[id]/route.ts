import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { TeamMember } from '@/lib/models/TeamMember'
import { requireFounder } from '@/lib/adminGuard'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireFounder()
  if ('error' in guard) return guard.error

  const body = await req.json()
  const { initials, name, role, bio, color, badge, level, order } = body

  if (!initials?.trim() || !name?.trim() || !role?.trim()) {
    return NextResponse.json({ error: 'initials, name, and role are required' }, { status: 400 })
  }

  await connectDB()
  const member = await TeamMember.findByIdAndUpdate(
    params.id,
    { initials, name, role, bio, color, badge, level, order },
    { new: true }
  )
  if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ member })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const guard = await requireFounder()
  if ('error' in guard) return guard.error

  await connectDB()
  const member = await TeamMember.findByIdAndDelete(params.id)
  if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
