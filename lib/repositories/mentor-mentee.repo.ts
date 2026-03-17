import { prisma } from '../prisma'
import { Prisma } from '@prisma/client'

export const mentorMenteeRepository = {
  getMenteesByMentorId: async (mentorId: string) => {
    return prisma.mentorMentee.findMany({
      where: { mentorId },
      include: { mentee: true }
    })
  },

  assignMentee: async (mentorId: string, menteeId: string) => {
    // Delete any existing assignment for this mentee first
    await prisma.mentorMentee.deleteMany({
      where: { menteeId }
    })
    
    return prisma.mentorMentee.create({
      data: { mentorId, menteeId }
    })
  },

  unassignMentee: async (mentorId: string, menteeId: string) => {
    return prisma.mentorMentee.delete({
      where: {
        mentorId_menteeId: { mentorId, menteeId }
      }
    })
  }
}
