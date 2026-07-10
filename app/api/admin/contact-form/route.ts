import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/adminGuard'
import { connectDB } from '@/lib/mongodb'
import { ContactFormConfig, DEFAULT_CONTACT_FIELDS } from '@/lib/models/ContactForm'

export const dynamic = 'force-dynamic'

export async function GET() {
  const guard = await requirePermission('manageContactForm')
  if ('error' in guard) return guard.error

  await connectDB()
  const config = await ContactFormConfig.findOne({}).lean()
  const fields = config?.fields?.length ? config.fields : DEFAULT_CONTACT_FIELDS
  return NextResponse.json({ fields })
}

export async function PUT(req: NextRequest) {
  const guard = await requirePermission('manageContactForm')
  if ('error' in guard) return guard.error

  const { fields } = await req.json()
  if (!Array.isArray(fields)) {
    return NextResponse.json({ error: 'fields must be an array' }, { status: 400 })
  }

  await connectDB()
  const config = await ContactFormConfig.findOneAndUpdate(
    {},
    { fields },
    { upsert: true, new: true }
  )
  return NextResponse.json({ fields: config.fields })
}
