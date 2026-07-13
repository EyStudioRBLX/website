import { NextRequest, NextResponse } from 'next/server'
import { requireFounder } from '@/lib/adminGuard'
import { connectDB } from '@/lib/mongodb'
import { CustomRole } from '@/lib/models/CustomRole'
import { ALL_PERMISSION_KEYS } from '@/lib/roles'

export async function GET() {
  const guard = await requireFounder()
  if ('error' in guard) return guard.error

  await connectDB()
  const roles = await CustomRole.find().sort({ createdAt: 1 }).lean()
  return NextResponse.json({ roles })
}

export async function POST(req: NextRequest) {
  const guard = await requireFounder()
  if ('error' in guard) return guard.error

  const body = await req.json()
  const { name, displayName, color, permissions } = body as {
    name: string
    displayName: string
    color: string
    permissions: string[]
  }

  if (!name || !displayName || !color) {
    return NextResponse.json({ error: 'name, displayName and color are required' }, { status: 400 })
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-')

  const reservedNames = ['user', 'helper', 'skripter', 'mapper', 'owner', 'founder']
  if (reservedNames.includes(slug)) {
    return NextResponse.json({ error: 'Dieser Name ist reserviert' }, { status: 400 })
  }

  const validPerms = (permissions ?? []).filter((p) => ALL_PERMISSION_KEYS.includes(p as any))

  await connectDB()
  try {
    const role = await CustomRole.create({
      name: slug,
      displayName,
      color,
      permissions: validPerms,
      createdBy: guard.discordId,
    })
    return NextResponse.json({ role }, { status: 201 })
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json({ error: 'Eine Rolle mit diesem Namen existiert bereits' }, { status: 409 })
    }
    throw err
  }
}
