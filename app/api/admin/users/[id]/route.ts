import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/adminGuard'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import { CustomRole } from '@/lib/models/CustomRole'
import { canManage, ROLE_HIERARCHY } from '@/lib/roles'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requirePermission('manageUsers')
  if ('error' in guard) return guard.error

  const { role: actorRole } = guard
  const body = await req.json()
  const { role } = body as { role: string }

  if (!role) {
    return NextResponse.json({ error: 'role is required' }, { status: 400 })
  }

  await connectDB()
  const target = await User.findById(params.id)
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  if (!canManage(actorRole, target.role) || !canManage(actorRole, role)) {
    return NextResponse.json({ error: 'Cannot assign that role' }, { status: 403 })
  }

  const isStaticRole = ROLE_HIERARCHY.includes(role as any)
  if (isStaticRole) {
    target.role = role
    target.customPermissions = []
  } else {
    const customRole = await CustomRole.findOne({ name: role })
    if (!customRole) return NextResponse.json({ error: 'Custom role not found' }, { status: 404 })
    target.role = role
    target.customPermissions = customRole.permissions
  }

  await target.save()
  return NextResponse.json({ user: target })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requirePermission('manageUsers')
  if ('error' in guard) return guard.error

  const { discordId: actorDiscordId, role: actorRole } = guard

  await connectDB()
  const user = await User.findById(params.id)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  if (user.discordId === actorDiscordId) {
    return NextResponse.json({ error: "You can't delete yourself" }, { status: 400 })
  }

  if (!canManage(actorRole, user.role)) {
    return NextResponse.json({ error: 'Cannot delete a user with equal or higher role' }, { status: 403 })
  }

  await User.findByIdAndDelete(params.id)
  return NextResponse.json({ success: true })
}
