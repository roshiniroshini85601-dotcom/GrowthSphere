import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * DELETE /api/topics/[id]
 * Permanently removes a topic and its cascaded milestones.
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.topic.delete({ where: { id } })
    return NextResponse.json({ message: 'Topic deleted successfully' }, { status: 200 })
  } catch (error: any) {
    if (error.code === 'P2025') return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    console.error(`Failed to delete topic:`, error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

/**
 * PATCH /api/topics/[id]
 * Updates a topic name and replaces all its milestones.
 * Body: { name?: string, milestones?: { name, content?, link? }[] }
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    // Update topic name if provided
    if (body.name) {
      await prisma.topic.update({ where: { id }, data: { name: body.name } })
    }

    // Replace milestones if provided
    if (body.milestones) {
      // Delete old ones first
      await prisma.topicMilestone.deleteMany({ where: { topicId: id } })
      // Create new ones
      await prisma.topicMilestone.createMany({
        data: body.milestones.map((m: any) => ({
          topicId: id,
          name: m.name,
          content: m.content || null,
          link: m.link || null,
        }))
      })
    }

    const updated = await prisma.topic.findUnique({
      where: { id },
      include: { milestones: true }
    })
    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error(`Failed to update topic:`, error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
