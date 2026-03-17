import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/mentees/[id]/mentor
 * Returns the mentor(s) assigned to a given intern.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const relations = await prisma.mentorMentee.findMany({
      where: { menteeId: id },
      include: {
        mentor: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    })

    const mentors = relations.map((r) => r.mentor)
    return NextResponse.json(mentors, { status: 200 })
  } catch (error) {
    console.error('Failed to fetch mentor:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
