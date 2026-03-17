import { NextResponse } from 'next/server'
import { assignmentService } from '@/lib/services/assignment.service'

/**
 * GET /api/mentees/[id]/progress
 * Compiles and returns all assigned Milestones, Tasks, and Reviews for an intern.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const [milestones, tasks, reviews] = await Promise.all([
      assignmentService.getInternMilestones(id),
      assignmentService.getInternTasks(id),
      assignmentService.getInternReviews(id)
    ])

    return NextResponse.json({
      milestones,
      tasks,
      reviews
    }, { status: 200 })
  } catch (error) {
    console.error(`Failed to fetch progress for mentee:`, error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
