import { prisma } from '../prisma'
import { Prisma } from '@prisma/client'

export const internMilestoneRepository = {
  findByInternId: async (internId: string) => {
    return prisma.internMilestone.findMany({
      where: { internId },
      include: { milestone: { include: { topic: true } }, intern: true }
    })
  },

  create: async (data: Prisma.InternMilestoneCreateInput) => {
    return prisma.internMilestone.create({ data })
  },

  update: async (id: string, data: Prisma.InternMilestoneUpdateInput) => {
    return prisma.internMilestone.update({
      where: { id },
      data
    })
  }
}
