import { prisma } from '../prisma'
import { Prisma } from '@prisma/client'

export const topicRepository = {
  findAll: async () => {
    return prisma.topic.findMany({
      include: { milestones: true }
    })
  },

  create: async (data: Prisma.TopicCreateInput) => {
    return prisma.topic.create({ data })
  },

  update: async (id: string, data: Prisma.TopicUpdateInput) => {
    return prisma.topic.update({
      where: { id },
      data
    })
  },

  delete: async (id: string) => {
    return prisma.topic.delete({
      where: { id }
    })
  }
}
