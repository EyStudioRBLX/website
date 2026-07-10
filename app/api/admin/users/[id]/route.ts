import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/adminGuard'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import { canManage, type Role } from '@/lib/roles'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requirePermission('manageUsers')
  if ('error' in guard) return guard.error

  const { id, role: actorRole } = { id: params.id, role: guard.role }
  const body = await req.json()
  const { role } = body as { role: Role }

  if (!role) {
    return NextResponse.json({ error: 'role is required' }, { status: 400 })
  }

  await connectDB()
  const target = await User.findById(id)
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  if (!canManage(actorRole, target.role as Role) || !canManage(actorRole, role)) {
    return NextResponse.json({ error: 'Cannot assign that role' }, { status: 403 })
  }

  target.role = role
  await target.save()

  return NextResponse.json({ user: target })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requirePermission('manageUsers')
  if ('error' in guard) return guard.error

  const { id } = params
  const { discordId: actorDiscordId, role: actorRole } = guard

  await connectDB()
  const user = await User.findById(id)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  if (user.discordId === actorDiscordId) {
    return NextResponse.json({ error: "You can't delete yourself" }, { status: 400 })
  }

  if (!canManage(actorRole, user.role as Role)) {
    return NextResponse.json({ error: 'Cannot delete a user with equal or higher role' }, { status: 403 })
  }

  await User.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}
