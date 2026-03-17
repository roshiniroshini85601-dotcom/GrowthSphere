import { NextResponse } from 'next/server'
import { assignmentService } from '@/lib/services/assignment.service'

/**
 * POST /api/reviews
 * Assigns a new review to an intern
 * Body: Prisma.ReviewCreateInput equivalent
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!body.title || !body.internId || !body.reviewerId) {
      return NextResponse.json({ error: 'Missing required assignment fields' }, { status: 400 })
    }

    const review = await assignmentService.assignReview({
      title: body.title,
      description: body.description,
      dateReviewed: new Date(body.dateReviewed || Date.now()),
      intern: { connect: { id: body.internId } },
      reviewer: { connect: { id: body.reviewerId } }
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Failed to assign review:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
