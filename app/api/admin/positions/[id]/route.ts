import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Position } from '@/lib/models/Position'
import { Application } from '@/lib/models/Application'
import { requireFounder } from '@/lib/adminGuard'

export const dynamic = 'force-dynamic'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireFounder()
  if ('error' in guard) return guard.error

  try {
    await connectDB()
    const body = await req.json() as {
      title?: string
      description?: string
      requirements?: string
      gameName?: string
      status?: 'open' | 'closed'
    }

    const position = await Position.findByIdAndUpdate(
      params.id,
      {
        ...(body.title !== undefined && { title: body.title.trim() }),
        ...(body.description !== undefined && { description: body.description.trim() }),
        ...(body.requirements !== undefined && { requirements: body.requirements.trim() }),
        ...(body.gameName !== undefined && { gameName: body.gameName.trim() }),
        ...(body.status !== undefined && { status: body.status }),
      },
      { new: true }
    )

    if (!position) return NextResponse.json({ error: 'Position not found' }, { status: 404 })
    return NextResponse.json({ position })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireFounder()
  if ('error' in guard) return guard.error

  try {
    await connectDB()
    const position = await Position.findByIdAndDelete(params.id)
    if (!position) return NextResponse.json({ error: 'Position not found' }, { status: 404 })

    // Delete all applications for this position
    await Application.deleteMany({ positionId: params.id })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
