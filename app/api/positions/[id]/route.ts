import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Position } from '@/lib/models/Position'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const position = await Position.findById(params.id).lean()
    if (!position) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ position })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
