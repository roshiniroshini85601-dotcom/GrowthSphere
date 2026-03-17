import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * PATCH /api/intern-milestones/[id]
 * Updates the internStatus of an InternMilestone (e.g. mark as complete).
 * Body: { internStatus: boolean }
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const updated = await prisma.internMilestone.update({
      where: { id },
      data: { internStatus: body.internStatus }
    })

    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error('Failed to update intern milestone:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
