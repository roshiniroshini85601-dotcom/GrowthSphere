// Mock data and types for GrowthSphere
// In a real app these would come from API calls

export type Role = 'admin' | 'mentor' | 'intern' | 'not_mentor' | 'not_employee'

export interface Employee {
  id: string
  name: string
  email: string
  contactNo: string
  role: Role
  address: string
  collegeName: string
  degree: string
  flagged?: boolean
}

export interface Topic {
  id: string
  name: string
}

export interface TopicMilestone {
  id: string
  name: string
  content?: string
  link?: string
  topicId: string
}

export interface InternMilestone {
  id: string
  internId: string
  milestoneId: string
  dateAssigned: string
  internStatus: boolean
  milestone?: TopicMilestone
  topic?: Topic
}

export interface Review {
  id: string
  internId: string
  dateReviewed: string
  status: 'completed' | 'reopened' | 'pending'
  reviewerId: string
  feedback: { text: string; date: string; author: string }[]
  internStatus: boolean
  title?: string
  description?: string
}

export interface Task {
  id: string
  internId: string
  dateReviewed: string
  status: 'completed' | 'pending'
  reviewerId: string
  feedback: { text: string; date: string; author: string }[]
  internStatus: boolean
  name?: string
  description?: string
  milestoneIds?: string[]
}

export interface MentorMenteeRelation {
  mentorId: string
  menteeId: string
}

// ---- MOCK DATA ----

export const mockEmployees: Employee[] = [
  { id: '1', name: 'Xavier Babu', email: 'xavier.babu@org.com', contactNo: '9876543210', role: 'admin', address: '12 MG Road, Bengaluru', collegeName: 'IIT Bombay', degree: 'B.Tech CSE' },
  { id: '2', name: 'Xavier Praveen', email: 'xavier.praveen@org.com', contactNo: '9123456789', role: 'mentor', address: '45 Anna Salai, Chennai', collegeName: 'NIT Trichy', degree: 'M.Tech IT' },
  { id: '3', name: 'Rohan Mehta', email: 'rohan.mehta@org.com', contactNo: '9988776655', role: 'mentor', address: '8 Park Street, Kolkata', collegeName: 'BITS Pilani', degree: 'B.E. ECE' },
  { id: '4', name: 'Roshini', email: 'roshini@org.com', contactNo: '9000112233', role: 'intern', address: '23 Sector 15, Noida', collegeName: 'VIT Vellore', degree: 'B.Tech IT' },
  { id: '5', name: 'Karan Patel', email: 'karan.patel@org.com', contactNo: '9111222333', role: 'intern', address: '5 Civil Lines, Jaipur', collegeName: 'MNIT Jaipur', degree: 'B.E. CS' },
  { id: '6', name: 'Ananya Roy', email: 'ananya.roy@org.com', contactNo: '9555666777', role: 'intern', address: '78 Connaught Place, Delhi', collegeName: 'DTU Delhi', degree: 'B.Tech CSE' },
  { id: '7', name: 'Vikram Singh', email: 'vikram.singh@org.com', contactNo: '9444333222', role: 'not_mentor', address: '90 Banjara Hills, Hyderabad', collegeName: 'CBIT Hyderabad', degree: 'B.Tech IT' },
  { id: '8', name: 'Meera Pillai', email: 'meera.pillai@org.com', contactNo: '9777888999', role: 'intern', address: '33 Marine Drive, Mumbai', collegeName: 'VJTI Mumbai', degree: 'B.E. Computer' },
]

export const mockRelations: MentorMenteeRelation[] = [
  { mentorId: '2', menteeId: '4' },
  { mentorId: '2', menteeId: '5' },
  { mentorId: '3', menteeId: '6' },
]

export const mockTopics: Topic[] = [
  { id: 't1', name: 'React Fundamentals' },
  { id: 't2', name: 'Node.js Basics' },
  { id: 't3', name: 'Database Design' },
]

export const mockMilestones: TopicMilestone[] = [
  { id: 'm1', name: 'JSX & Components', content: 'Learn JSX syntax and functional components', link: 'https://react.dev', topicId: 't1' },
  { id: 'm2', name: 'State & Props', content: 'Understand useState, useEffect, and props drilling', topicId: 't1' },
  { id: 'm3', name: 'Hooks Deep Dive', content: 'Custom hooks and advanced patterns', topicId: 't1' },
  { id: 'm4', name: 'Express Basics', content: 'Setup express server and routing', link: 'https://expressjs.com', topicId: 't2' },
  { id: 'm5', name: 'REST API Design', content: 'RESTful patterns and best practices', topicId: 't2' },
]

export const mockInternMilestones: InternMilestone[] = [
  { id: 'im1', internId: '4', milestoneId: 'm1', dateAssigned: '2025-06-01', internStatus: true, milestone: mockMilestones[0], topic: mockTopics[0] },
  { id: 'im2', internId: '4', milestoneId: 'm2', dateAssigned: '2025-06-08', internStatus: true, milestone: mockMilestones[1], topic: mockTopics[0] },
  { id: 'im3', internId: '4', milestoneId: 'm3', dateAssigned: '2025-06-15', internStatus: false, milestone: mockMilestones[2], topic: mockTopics[0] },
  { id: 'im4', internId: '5', milestoneId: 'm4', dateAssigned: '2025-06-03', internStatus: false, milestone: mockMilestones[3], topic: mockTopics[1] },
  { id: 'im5', internId: '6', milestoneId: 'm1', dateAssigned: '2025-06-05', internStatus: true, milestone: mockMilestones[0], topic: mockTopics[0] },
]

export const mockReviews: Review[] = [
  {
    id: 'r1', internId: '4', dateReviewed: '2025-06-10', status: 'completed', reviewerId: '2',
    feedback: [{ text: 'Great understanding of components.', date: '2025-06-10', author: 'Priya Nair' }],
    internStatus: false, title: 'React Components Review', description: 'Review JSX and component basics',
  },
  {
    id: 'r2', internId: '4', dateReviewed: '2025-06-17', status: 'pending', reviewerId: '2',
    feedback: [], internStatus: true, title: 'Hooks Review', description: 'Demonstrate custom hooks usage',
  },
  {
    id: 'r3', internId: '5', dateReviewed: '2025-06-12', status: 'reopened', reviewerId: '3',
    feedback: [
      { text: 'Needs improvement in error handling.', date: '2025-06-12', author: 'Rohan Mehta' },
      { text: 'Better now, but review REST conventions again.', date: '2025-06-14', author: 'Rohan Mehta' },
    ],
    internStatus: false, title: 'Express Server Review', description: 'Review Express setup and middleware',
  },
]

export const mockTasks: Task[] = [
  {
    id: 'tk1', internId: '4', dateReviewed: '2025-06-09', status: 'completed', reviewerId: '2',
    feedback: [{ text: 'Well done! Clean and readable code.', date: '2025-06-09', author: 'Priya Nair' }],
    internStatus: false, name: 'Build a Counter App', description: 'Create a counter using useState', milestoneIds: ['m1'],
  },
  {
    id: 'tk2', internId: '4', dateReviewed: '2025-06-16', status: 'pending', reviewerId: '2',
    feedback: [], internStatus: true, name: 'Custom Hook Task', description: 'Build a useFetch custom hook', milestoneIds: ['m2', 'm3'],
  },
  {
    id: 'tk3', internId: '5', dateReviewed: '2025-06-11', status: 'pending', reviewerId: '3',
    feedback: [], internStatus: false, name: 'Setup REST API', description: 'Create full CRUD endpoints', milestoneIds: ['m4'],
  },
]

// Weekly stats for charts
export const weeklyTaskStats = [
  { day: 'Mon', completed: 4, incomplete: 2 },
  { day: 'Tue', completed: 6, incomplete: 1 },
  { day: 'Wed', completed: 3, incomplete: 4 },
  { day: 'Thu', completed: 7, incomplete: 2 },
  { day: 'Fri', completed: 5, incomplete: 3 },
  { day: 'Sat', completed: 2, incomplete: 1 },
  { day: 'Sun', completed: 1, incomplete: 0 },
]

export const attendanceStats = [
  { date: 'Jun 9', count: 5 },
  { date: 'Jun 10', count: 6 },
  { date: 'Jun 11', count: 4 },
  { date: 'Jun 12', count: 7 },
  { date: 'Jun 13', count: 5 },
  { date: 'Jun 14', count: 3 },
  { date: 'Jun 15', count: 6 },
]
