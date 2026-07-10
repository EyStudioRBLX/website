import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/adminGuard'
import { connectDB } from '@/lib/mongodb'
import { Game } from '@/lib/models/Game'

export const dynamic = 'force-dynamic'

export async function GET() {
  const guard = await requirePermission('manageGames')
  if ('error' in guard) return guard.error

  await connectDB()
  const games = await Game.find({}).sort({ createdAt: -1 }).lean()
  return NextResponse.json({ games })
}

export async function POST(req: NextRequest) {
  const guard = await requirePermission('manageGames')
  if ('error' in guard) return guard.error

  const body = await req.json()
  const { name, status, visits, fav, statusColor, progress, robloxUrl } = body

  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  await connectDB()
  const game = await Game.create({
    name,
    status: status ?? 'Dev',
    visits: visits ?? '—',
    fav: fav ?? '—',
    statusColor: statusColor ?? '#22d3ee',
    progress: progress ?? 0,
    robloxUrl: robloxUrl ?? '',
  })

  return NextResponse.json({ game }, { status: 201 })
}
