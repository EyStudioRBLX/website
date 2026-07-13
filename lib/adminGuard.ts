import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { hasPermission, type Role, type RolePermissions } from '@/lib/roles'

export async function requireFounder() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || role !== 'founder') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  const discordId = (session.user as any)?.discordId as string
  return { session, discordId, role: role as Role }
}

export async function requirePermission(permission: keyof RolePermissions) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role as string | undefined
  const permissions = (session?.user as any)?.permissions as string[] | undefined
  if (!session || !role || !hasPermission(role, permission, permissions)) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  const discordId = (session.user as any)?.discordId as string
  return { session, discordId, role: role as Role }
}
