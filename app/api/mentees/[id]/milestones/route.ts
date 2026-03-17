import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/mentees/[id]/milestones
 * Bulk assigns multiple Milestones to an intern.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: internId } = await params
    const { milestoneIds, dateAssigned } = await request.json()

    if (!Array.isArray(milestoneIds) || !dateAssigned) {
      return NextResponse.json({ error: 'Valid milestoneIds array and dateAssigned are required' }, { status: 400 })
    }

    // Assign each milestone to the intern
    const assignments = await prisma.$transaction(
      milestoneIds.map((milestoneId: string) => 
        prisma.internMilestone.upsert({
          where: {
            internId_milestoneId: {
              internId,
              milestoneId
            }
          },
          update: {
            dateAssigned: new Date(dateAssigned)
          },
          create: {
            internId,
            milestoneId,
            dateAssigned: new Date(dateAssigned),
            internStatus: false
          }
        })
      )
    )

    return NextResponse.json({ message: `Assigned ${assignments.length} milestones successfully`, assignments }, { status: 201 })
  } catch (error) {
    console.error(`Failed to assign milestones to mentee:`, error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
