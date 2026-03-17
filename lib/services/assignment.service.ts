import { taskRepository } from '../repositories/task.repo'
import { reviewRepository } from '../repositories/review.repo'
import { internMilestoneRepository } from '../repositories/intern-milestone.repo'
import { Prisma } from '@prisma/client'

export const assignmentService = {
  // Tasks
  getInternTasks: async (internId: string) => {
    return taskRepository.findByInternId(internId)
  },

  assignTask: async (data: Prisma.TaskCreateInput) => {
    return taskRepository.create(data)
  },

  updateTaskStatus: async (taskId: string, status: 'COMPLETED' | 'PENDING') => {
    return taskRepository.update(taskId, { status })
  },

  addFeedbackToTask: async (taskId: string, feedbackJson: Prisma.InputJsonValue) => {
    return taskRepository.update(taskId, { feedback: feedbackJson })
  },

  // Reviews
  getInternReviews: async (internId: string) => {
    return reviewRepository.findByInternId(internId)
  },

  assignReview: async (data: Prisma.ReviewCreateInput) => {
    return reviewRepository.create(data)
  },

  updateReviewStatus: async (reviewId: string, status: 'COMPLETED' | 'REOPENED' | 'PENDING') => {
    return reviewRepository.update(reviewId, { status })
  },

  addFeedbackToReview: async (reviewId: string, feedbackJson: Prisma.InputJsonValue) => {
    return reviewRepository.update(reviewId, { feedback: feedbackJson })
  },

  // Milestones
  getInternMilestones: async (internId: string) => {
    return internMilestoneRepository.findByInternId(internId)
  },

  assignMilestone: async (data: Prisma.InternMilestoneCreateInput) => {
    return internMilestoneRepository.create(data)
  },

  markMilestoneCompleted: async (id: string, completed: boolean) => {
    return internMilestoneRepository.update(id, { internStatus: completed })
  }
}
