import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Application } from '@/lib/models/Application'
import { requireFounder } from '@/lib/adminGuard'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const guard = await requireFounder()
  if ('error' in guard) return guard.error

  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (id) {
      const application = await Application.findById(id).lean()
      if (!application) return NextResponse.json({ error: 'Application not found' }, { status: 404 })
      return NextResponse.json({ application })
    }

    const applications = await Application.find().sort({ appliedAt: -1 }).lean()
    return NextResponse.json({ applications })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
