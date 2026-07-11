import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Position } from '@/lib/models/Position'
import { requireFounder } from '@/lib/adminGuard'

export const dynamic = 'force-dynamic'

export async function GET() {
  const guard = await requireFounder()
  if ('error' in guard) return guard.error

  try {
    await connectDB()
    const positions = await Position.find().sort({ createdAt: -1 }).lean()
    return NextResponse.json({ positions })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireFounder()
  if ('error' in guard) return guard.error

  try {
    await connectDB()
    const body = await req.json() as {
      title: string
      description: string
      requirements?: string
      gameName?: string
      guidelines?: string[]
      status?: 'open' | 'closed'
    }

    if (!body.title?.trim() || !body.description?.trim()) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    const position = await Position.create({
      title: body.title.trim(),
      description: body.description.trim(),
      requirements: body.requirements?.trim() ?? '',
      gameName: body.gameName?.trim() ?? '',
      guidelines: body.guidelines ?? [],
      status: body.status ?? 'open',
    })

    return NextResponse.json({ position }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
