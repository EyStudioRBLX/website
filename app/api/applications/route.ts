import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Position } from '@/lib/models/Position'
import { Application } from '@/lib/models/Application'
import { sendNewApplicationWebhook } from '@/lib/webhook'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const discordId = (session.user as any)?.discordId as string
  const applicantName = session.user?.name ?? 'Unknown'
  const applicantTag = (session.user as any)?.tag ?? ''

  if (!discordId) {
    return NextResponse.json({ error: 'Could not determine Discord ID' }, { status: 400 })
  }

  try {
    await connectDB()
    const body = await req.json() as {
      positionId: string
      message: string
      portfolio?: string
    }

    if (!body.positionId || !body.message?.trim()) {
      return NextResponse.json({ error: 'positionId and message are required' }, { status: 400 })
    }

    // Validate position exists and is open
    const position = await Position.findById(body.positionId)
    if (!position) {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 })
    }
    if (position.status !== 'open') {
      return NextResponse.json({ error: 'This position is no longer open' }, { status: 400 })
    }

    // Check for duplicate application
    const existing = await Application.findOne({ positionId: body.positionId, discordId })
    if (existing) {
      return NextResponse.json({ error: 'Du hast dich bereits beworben' }, { status: 409 })
    }

    const application = await Application.create({
      positionId: body.positionId,
      positionTitle: position.title,
      gameName: position.gameName ?? '',
      discordId,
      applicantName,
      applicantTag,
      message: body.message.trim(),
      portfolio: body.portfolio?.trim() ?? '',
    })

    const appUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
    await sendNewApplicationWebhook({
      applicantName,
      positionTitle: position.title,
      gameName: position.gameName ?? '',
      applicationId: String(application._id),
      appUrl,
    })

    return NextResponse.json({ application }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
