import { NextResponse } from 'next/server'
import { topicService } from '@/lib/services/topic.service'

export async function GET() {
  try {
    const topics = await topicService.getAllTopics()
    return NextResponse.json(topics, { status: 200 })
  } catch (error) {
    console.error('Failed to fetch topics:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!body.name) {
      return NextResponse.json({ error: 'Topic name is required' }, { status: 400 })
    }

    // Body should be { name: string, milestones: { name, content, link }[] }
    const topic = await topicService.createTopicWithMilestones(body.name, body.milestones || [])
    return NextResponse.json(topic, { status: 201 })
  } catch (error) {
    console.error('Failed to create topic:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
