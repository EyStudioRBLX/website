import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Application } from '@/lib/models/Application'
import { requireFounder } from '@/lib/adminGuard'
import { sendApplicationDecisionWebhook } from '@/lib/webhook'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireFounder()
  if ('error' in guard) return guard.error

  try {
    await connectDB()
    const application = await Application.findById(params.id).lean()
    if (!application) return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    return NextResponse.json({ application })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireFounder()
  if ('error' in guard) return guard.error

  try {
    await connectDB()
    const body = await req.json() as { status: 'accepted' | 'rejected' }

    if (!['accepted', 'rejected'].includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const application = await Application.findByIdAndUpdate(
      params.id,
      { status: body.status },
      { new: true }
    )

    if (!application) return NextResponse.json({ error: 'Application not found' }, { status: 404 })

    await sendApplicationDecisionWebhook({
      applicantName: application.applicantName,
      positionTitle: application.positionTitle,
      gameName: application.gameName,
      decision: body.status,
    })

    return NextResponse.json({ application })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
