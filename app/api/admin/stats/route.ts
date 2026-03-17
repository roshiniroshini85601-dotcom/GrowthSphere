import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { subDays, startOfDay, endOfDay, format } from 'date-fns'
import { TaskStatus } from '@prisma/client'

export async function GET() {
  try {
    const today = new Date()
    const past7Days = Array.from({ length: 7 }).map((_, i) => subDays(today, 6 - i))

    // 1. Fetch data for Task Completion Chart
    const weeklyTaskStats = await Promise.all(
      past7Days.map(async (date) => {
        const start = startOfDay(date)
        const end = endOfDay(date)

        const completed = await prisma.task.count({
          where: {
            dateReviewed: { gte: start, lte: end },
            status: TaskStatus.COMPLETED
          }
        })

        const incomplete = await prisma.task.count({
          where: {
            dateReviewed: { gte: start, lte: end },
            status: TaskStatus.PENDING
          }
        })

        return {
          day: format(date, 'EEE'), // Short day name, e.g., 'Mon'
          completed,
          incomplete
        }
      })
    )

    // 2. Fetch data for Attendance Chart
    // User requested tracking unique interns who had ether a Task or Review on that day
    const attendanceStats = await Promise.all(
      past7Days.map(async (date) => {
        const start = startOfDay(date)
        const end = endOfDay(date)

        // Find distinct intern IDs who had tasks today
        const tasks = await prisma.task.findMany({
          where: { dateReviewed: { gte: start, lte: end } },
          select: { internId: true },
          distinct: ['internId']
        })

        // Find distinct intern IDs who had reviews today
        const reviews = await prisma.review.findMany({
          where: { dateReviewed: { gte: start, lte: end } },
          select: { internId: true },
          distinct: ['internId']
        })

        // Combine and count unique interns
        const uniqueInternIds = new Set([
          ...tasks.map(t => t.internId),
          ...reviews.map(r => r.internId)
        ])

        return {
          date: format(date, 'MMM d'), // e.g., 'Jun 9'
          count: uniqueInternIds.size
        }
      })
    )

    return NextResponse.json({
      weeklyTaskStats,
      attendanceStats
    }, { status: 200 })
  } catch (error) {
    console.error('Failed to fetch admin stats:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
