import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export const dynamic = 'force-dynamic'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/lib/models/User'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const discordId = (session.user as any)?.discordId
  if (!discordId) return NextResponse.json({ error: 'No discordId' }, { status: 400 })

  try {
    await connectDB()
    const user = await User.findOne({ discordId }).lean()
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json({ user })
  } catch (err) {
    return NextResponse.json({ error: 'Datenbankfehler' }, { status: 500 })
  }
}
