import { NextResponse } from 'next/server'
import { employeeService } from '@/lib/services/employee.service'

/**
 * GET /api/mentors/[id]/mentees
 * Retrieves all mentees assigned to a specific mentor.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const mentees = await employeeService.getMentorMentees(id)
    return NextResponse.json(mentees, { status: 200 })
  } catch (error) {
    console.error(`Failed to fetch mentees for mentor:`, error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

/**
 * POST /api/mentors/[id]/mentees
 * Assigns a new mentee to a mentor.
 * Payload needs: { menteeId: string }
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { menteeId } = await request.json()
    if (!menteeId) {
      return NextResponse.json({ error: 'menteeId is required' }, { status: 400 })
    }

    const relation = await employeeService.assignMenteeToMentor(id, menteeId)
    return NextResponse.json(relation, { status: 201 })
  } catch (error) {
    console.error(`Failed to assign mentee to mentor:`, error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

/**
 * DELETE /api/mentors/[id]/mentees
 * Removes a mentee from a mentor.
 * Payload needs: { menteeId: string } inside the request or search params
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    // We can read menteeId from URL search parmas since DELETE body is sometimes flaky
    const { searchParams } = new URL(request.url)
    const menteeId = searchParams.get('menteeId')
    
    if (!menteeId) {
      return NextResponse.json({ error: 'menteeId query parameter is required' }, { status: 400 })
    }

    await employeeService.removeMenteeFromMentor(id, menteeId)
    return NextResponse.json({ message: 'Unassigned successfully' }, { status: 200 })
  } catch (error: any) {
    // Specifically handle "Record to delete does not exist" from Prisma
    if (error.code === 'P2025') return NextResponse.json({ error: 'Relation not found' }, { status: 404 })
    console.error(`Failed to unassign mentee:`, error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
