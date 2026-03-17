import { topicRepository } from '../repositories/topic.repo'
import { Prisma } from '@prisma/client'

export const topicService = {
  getAllTopics: async () => {
    return topicRepository.findAll()
  },

  createTopicWithMilestones: async (
    name: string,
    milestones: { name: string; content?: string; link?: string }[]
  ) => {
    return topicRepository.create({
      name,
      milestones: {
        create: milestones
      }
    })
  },

  deleteTopic: async (id: string) => {
    return topicRepository.delete(id)
  }
}
