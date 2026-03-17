import { prisma } from '../prisma'
import { Prisma } from '@prisma/client'

export const taskRepository = {
  findByInternId: async (internId: string) => {
    return prisma.task.findMany({
      where: { internId },
      include: { reviewer: true }
    })
  },

  create: async (data: Prisma.TaskCreateInput) => {
    return prisma.task.create({ data })
  },

  update: async (id: string, data: Prisma.TaskUpdateInput) => {
    return prisma.task.update({
      where: { id },
      data
    })
  },
  
  delete: async (id: string) => {
    return prisma.task.delete({
      where: { id }
    })
  }
}
