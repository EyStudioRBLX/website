import { NextRequest, NextResponse } from 'next/server'
import { requireFounder } from '@/lib/adminGuard'
import { connectDB } from '@/lib/mongodb'
import { CustomRole } from '@/lib/models/CustomRole'
import { User } from '@/lib/models/User'
import { ALL_PERMISSION_KEYS } from '@/lib/roles'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireFounder()
  if ('error' in guard) return guard.error

  const body = await req.json()
  const { displayName, color, permissions } = body as {
    displayName?: string
    color?: string
    permissions?: string[]
  }

  await connectDB()
  const role = await CustomRole.findById(params.id)
  if (!role) return NextResponse.json({ error: 'Role not found' }, { status: 404 })

  if (displayName) role.displayName = displayName
  if (color) role.color = color
  if (permissions !== undefined) {
    role.permissions = permissions.filter((p) => ALL_PERMISSION_KEYS.includes(p as any))
  }
  await role.save()

  // Sync permissions to all users with this role
  await User.updateMany(
    { role: role.name },
    { $set: { customPermissions: role.permissions } }
  )

  return NextResponse.json({ role })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireFounder()
  if ('error' in guard) return guard.error

  await connectDB()
  const role = await CustomRole.findById(params.id)
  if (!role) return NextResponse.json({ error: 'Role not found' }, { status: 404 })

  // Reset all users with this role to 'user'
  await User.updateMany(
    { role: role.name },
    { $set: { role: 'user', customPermissions: [] } }
  )

  await CustomRole.findByIdAndDelete(params.id)
  return NextResponse.json({ success: true })
}
