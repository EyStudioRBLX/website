import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Application } from '@/lib/models/Application'
import { ApplicationMessage } from '@/lib/models/ApplicationMessage'
import { requireFounder } from '@/lib/adminGuard'
import { sendDiscordDM } from '@/lib/discordBot'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireFounder()
  if ('error' in guard) return guard.error

  try {
    await connectDB()
    const messages = await ApplicationMessage.find({ applicationId: params.id })
      .sort({ timestamp: 1 })
      .lean()

    // Mark user messages as read
    await ApplicationMessage.updateMany(
      { applicationId: params.id, direction: 'user', read: false },
      { read: true }
    )

    return NextResponse.json({ messages })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireFounder()
  if ('error' in guard) return guard.error

  const { session } = guard

  try {
    await connectDB()

    const body = await req.json() as { content: string }
    if (!body.content?.trim()) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 })
    }

    const application = await Application.findById(params.id)
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const adminName = session.user?.name ?? 'Admin'

    const message = await ApplicationMessage.create({
      applicationId: params.id,
      discordId: application.discordId,
      direction: 'admin',
      content: body.content.trim(),
      authorName: adminName,
      read: true,
    })

    // Send DM to applicant via bot
    await sendDiscordDM(
      application.discordId,
      `📩 **Nachricht von EyStudio Staff** (${adminName}) zu deiner Bewerbung für **${application.positionTitle}**:\n\n${body.content.trim()}\n\n*Antworte auf diese DM um zu antworten.*`
    )

    return NextResponse.json({ message }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
