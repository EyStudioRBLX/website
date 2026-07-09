import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function requireFounder() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || role !== 'founder') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  const discordId = (session.user as any)?.discordId as string
  return { session, discordId }
}
