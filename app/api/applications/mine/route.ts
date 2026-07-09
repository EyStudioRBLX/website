import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Application } from '@/lib/models/Application'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const discordId = (session.user as any)?.discordId as string
  if (!discordId) return NextResponse.json({ error: 'No Discord ID' }, { status: 400 })

  try {
    await connectDB()
    const applications = await Application.find({ discordId }).sort({ appliedAt: -1 }).lean()
    return NextResponse.json({ applications })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
