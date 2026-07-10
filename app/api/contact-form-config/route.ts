import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { ContactFormConfig, DEFAULT_CONTACT_FIELDS } from '@/lib/models/ContactForm'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectDB()
    const config = await ContactFormConfig.findOne({}).lean()
    const fields = config?.fields?.length ? config.fields : DEFAULT_CONTACT_FIELDS
    return NextResponse.json({ fields })
  } catch {
    return NextResponse.json({ fields: DEFAULT_CONTACT_FIELDS })
  }
}
