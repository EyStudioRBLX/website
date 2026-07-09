import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Game } from '@/lib/models/Game'

export const dynamic = 'force-dynamic'

export async function GET() {
  await connectDB()
  const games = await Game.find().sort({ createdAt: 1 }).lean()
  return NextResponse.json({ games })
}
