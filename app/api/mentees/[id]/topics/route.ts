import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/mentees/[id]/topics
 * Bulk assigns a Topic's milestones to an intern.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: internId } = await params
    const { topicId, dateAssigned } = await request.json()

    if (!topicId || !dateAssigned) {
      return NextResponse.json({ error: 'topicId and dateAssigned are required' }, { status: 400 })
    }

    // 1. Fetch the topic and its milestones
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: { milestones: true }
    })

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    // 2. Assign each milestone to the intern
    const assignments = await prisma.$transaction(
      topic.milestones.map((milestone) => 
        prisma.internMilestone.upsert({
          where: {
            internId_milestoneId: {
              internId,
              milestoneId: milestone.id
            }
          },
          update: {
            dateAssigned: new Date(dateAssigned)
          },
          create: {
            internId,
            milestoneId: milestone.id,
            dateAssigned: new Date(dateAssigned),
            internStatus: false
          }
        })
      )
    )

    return NextResponse.json({ message: `Assigned ${assignments.length} milestones successfully`, assignments }, { status: 201 })
  } catch (error) {
    console.error(`Failed to assign topic to mentee:`, error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
