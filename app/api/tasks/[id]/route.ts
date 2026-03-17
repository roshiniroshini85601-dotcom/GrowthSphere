import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * PATCH /api/tasks/[id]
 * Updates a task status or appends feedback.
 * Body: { status?: 'COMPLETED'|'PENDING', feedback?: { text, date, author }, internStatus?: boolean }
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    // Build the update payload
    const updateData: any = {}

    if (body.status) {
      updateData.status = body.status
    }

    if (typeof body.internStatus === 'boolean') {
      updateData.internStatus = body.internStatus
    }

    if (body.feedback) {
      // Fetch current task to get existing feedback array
      const existing = await prisma.task.findUnique({ where: { id }, select: { feedback: true } })
      const currentFeedback = Array.isArray(existing?.feedback) ? existing.feedback : []
      updateData.feedback = [...currentFeedback, body.feedback]
    }

    await prisma.task.update({ where: { id }, data: updateData })

    return NextResponse.json({ message: 'Task updated successfully' }, { status: 200 })
  } catch (error) {
    console.error(`Failed to update task:`, error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
