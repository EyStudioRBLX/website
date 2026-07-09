import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Position } from '@/lib/models/Position'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectDB()
    const positions = await Position.find({ status: 'open' }).sort({ createdAt: -1 }).lean()
    return NextResponse.json({ positions })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
