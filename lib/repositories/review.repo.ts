import { prisma } from '../prisma'
import { Prisma } from '@prisma/client'

export const reviewRepository = {
  findByInternId: async (internId: string) => {
    return prisma.review.findMany({
      where: { internId },
      include: { reviewer: true }
    })
  },

  create: async (data: Prisma.ReviewCreateInput) => {
    return prisma.review.create({ data })
  },

  update: async (id: string, data: Prisma.ReviewUpdateInput) => {
    return prisma.review.update({
      where: { id },
      data
    })
  },

  delete: async (id: string) => {
    return prisma.review.delete({
      where: { id }
    })
  }
}
