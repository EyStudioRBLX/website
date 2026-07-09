import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { TeamMember } from '@/lib/models/TeamMember'

export async function GET() {
  await connectDB()
  const members = await TeamMember.find().sort({ order: 1, createdAt: 1 }).lean()
  return NextResponse.json({ members })
}
