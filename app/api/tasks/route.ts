import { NextResponse } from 'next/server'
import { assignmentService } from '@/lib/services/assignment.service'

/**
 * POST /api/tasks
 * Assigns a new task to an intern
 * Body: Prisma.TaskCreateInput equivalent
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!body.name || !body.internId || !body.reviewerId) {
      return NextResponse.json({ error: 'Missing required assignment fields' }, { status: 400 })
    }

    const task = await assignmentService.assignTask({
      name: body.name,
      description: body.description,
      dateReviewed: new Date(body.dateReviewed || Date.now()),
      intern: { connect: { id: body.internId } },
      reviewer: { connect: { id: body.reviewerId } },
      milestoneIds: body.milestoneIds || []
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Failed to assign task:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
