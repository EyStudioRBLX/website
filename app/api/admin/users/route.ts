import { NextResponse } from 'next/server'
import { requirePermission } from '@/lib/adminGuard'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/lib/models/User'

export const dynamic = 'force-dynamic'

export async function GET() {
  const guard = await requirePermission('manageUsers')
  if ('error' in guard) return guard.error

  await connectDB()
  const users = await User.find({}).sort({ joinedAt: -1 }).lean()
  return NextResponse.json({ users })
}
