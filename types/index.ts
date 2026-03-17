import { Employee, Topic, TopicMilestone, Task, Review } from '@prisma/client'

export type { Employee, Topic, TopicMilestone, Task, Review }

// Add any custom or extended types needed across the application that build on top of Prisma.
export type EmployeeWithRelations = Employee & {
  mentees: { mentee: Employee }[]
  mentors: { mentor: Employee }[]
}

export type TopicWithMilestones = Topic & {
  milestones: TopicMilestone[]
}

export type TaskWithRelations = Task & {
  intern: Employee
  reviewer: Employee
}

export type ReviewWithRelations = Review & {
  intern: Employee
  reviewer: Employee
}
