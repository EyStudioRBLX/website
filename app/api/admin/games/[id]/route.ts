import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/adminGuard'
import { connectDB } from '@/lib/mongodb'
import { Game } from '@/lib/models/Game'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requirePermission('manageGames')
  if ('error' in guard) return guard.error

  const { id } = params
  const body = await req.json()

  await connectDB()
  const game = await Game.findByIdAndUpdate(id, body, { new: true })
  if (!game) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ game })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requirePermission('manageGames')
  if ('error' in guard) return guard.error

  const { id } = params

  await connectDB()
  const game = await Game.findByIdAndDelete(id)
  if (!game) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ success: true })
}
