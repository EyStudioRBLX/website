import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Position } from '@/lib/models/Position'
import { Application } from '@/lib/models/Application'
import { sendNewApplicationWebhook } from '@/lib/webhook'
import { sendDiscordDM } from '@/lib/discordBot'

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
      responses: Array<{ fieldId: string; label: string; value: string }>
    }

    if (!body.positionId || !Array.isArray(body.responses) || body.responses.length === 0) {
      return NextResponse.json({ error: 'positionId and responses are required' }, { status: 400 })
    }

    const position = await Position.findById(body.positionId)
    if (!position) {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 })
    }
    if (position.status !== 'open') {
      return NextResponse.json({ error: 'This position is no longer open' }, { status: 400 })
    }

    // Check required fields are filled
    for (const field of position.fields) {
      if (field.required) {
        const resp = body.responses.find((r) => r.fieldId === field.id)
        if (!resp?.value?.trim()) {
          return NextResponse.json({ error: `Pflichtfeld "${field.label}" ist leer` }, { status: 400 })
        }
      }
    }

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
      responses: body.responses.map((r) => ({
        fieldId: r.fieldId,
        label: r.label,
        value: r.value?.trim() ?? '',
      })),
    })

    const appUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

    await sendDiscordDM(
      discordId,
      `Hey ${applicantName}! 👋\n\nDeine Bewerbung für **${position.title}**${position.gameName ? ` (${position.gameName})` : ''} bei **EyStudio** wurde erfolgreich eingereicht.\n\nWir melden uns so schnell wie möglich bei dir. Danke für dein Interesse! 🎮`,
    )

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
