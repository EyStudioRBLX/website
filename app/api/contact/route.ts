import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Message } from '@/lib/models/Message'
import { ContactFormConfig, DEFAULT_CONTACT_FIELDS, type ContactFormField } from '@/lib/models/ContactForm'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { responses } = body as { responses: { fieldId: string; label: string; value: string }[] }

    await connectDB()

    const configDoc = await ContactFormConfig.findOne({}).lean()
    const fields: ContactFormField[] = configDoc?.fields?.length ? configDoc.fields : DEFAULT_CONTACT_FIELDS

    // Validate required fields
    for (const field of fields) {
      if (!field.required) continue
      const res = responses?.find((r) => r.fieldId === field.id)
      if (!res?.value?.trim()) {
        return NextResponse.json({ error: `"${field.label}" ist ein Pflichtfeld.` }, { status: 400 })
      }
    }

    // Extract name/email/subject/message for backwards compatibility
    const getValue = (id: string) => responses?.find((r) => r.fieldId === id)?.value ?? ''
    const name    = getValue('name')
    const email   = getValue('email')
    const subject = getValue('subject')
    const message = getValue('message')

    const session = await getServerSession(authOptions)
    const discordId = (session?.user as any)?.discordId ?? null

    await Message.create({ name, email, subject, message, responses: responses ?? [], discordId })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Contact API]', err)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}
