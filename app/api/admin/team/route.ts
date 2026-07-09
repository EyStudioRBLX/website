import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { TeamMember } from '@/lib/models/TeamMember'
import { requireFounder } from '@/lib/adminGuard'

export const dynamic = 'force-dynamic'

export async function GET() {
  const guard = await requireFounder()
  if ('error' in guard) return guard.error

  await connectDB()
  const members = await TeamMember.find().sort({ order: 1, createdAt: 1 }).lean()
  return NextResponse.json({ members })
}

export async function POST(req: Request) {
  const guard = await requireFounder()
  if ('error' in guard) return guard.error

  const body = await req.json()
  const { initials, name, role, bio, color, badge, level, order } = body

  if (!initials?.trim() || !name?.trim() || !role?.trim()) {
    return NextResponse.json({ error: 'initials, name, and role are required' }, { status: 400 })
  }

  await connectDB()
  const member = await TeamMember.create({ initials, name, role, bio, color, badge, level, order })
  return NextResponse.json({ member }, { status: 201 })
}
