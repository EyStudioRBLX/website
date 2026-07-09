import { NextRequest, NextResponse } from 'next/server'
import { requireFounder } from '@/lib/adminGuard'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import { canManage, type Role } from '@/lib/roles'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireFounder()
  if ('error' in guard) return guard.error

  const { id } = params
  const body = await req.json()
  const { role } = body as { role: Role }

  if (!role) {
    return NextResponse.json({ error: 'role is required' }, { status: 400 })
  }

  if (!canManage('founder', role)) {
    return NextResponse.json({ error: 'Cannot assign that role' }, { status: 403 })
  }

  await connectDB()
  const user = await User.findById(id)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Founders can't downgrade other founders unless they are the only founder
  user.role = role
  await user.save()

  return NextResponse.json({ user })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireFounder()
  if ('error' in guard) return guard.error

  const { id } = params
  const { discordId: actorDiscordId } = guard

  await connectDB()
  const user = await User.findById(id)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  if (user.discordId === actorDiscordId) {
    return NextResponse.json({ error: "You can't delete yourself" }, { status: 400 })
  }

  await User.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}
