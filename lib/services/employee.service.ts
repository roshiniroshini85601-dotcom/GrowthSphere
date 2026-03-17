import { employeeRepository } from '../repositories/employee.repo'
import { mentorMenteeRepository } from '../repositories/mentor-mentee.repo'

export const employeeService = {
  getAllEmployees: async () => {
    return employeeRepository.findAll()
  },

  getEmployeeById: async (id: string) => {
    const employee = await employeeRepository.findById(id)
    if (!employee) throw new Error('Employee not found')
    return employee
  },

  getEmployeeByEmail: async (email: string) => {
    const employee = await employeeRepository.findByEmail(email)
    if (!employee) throw new Error('Employee not found')
    return employee
  },

  createEmployee: async (data: {
    name: string
    email: string
    password?: string
    contactNo: string
    role?: string
    address?: string
    collegeName?: string
    degree?: string
  }) => {
    return employeeRepository.create(data)
  },

  /** Update a specific role field only */
  updateRole: async (id: string, newRole: string) => {
    return employeeRepository.update(id, { role: newRole })
  },

  /** Update any combination of employee fields */
  updateEmployee: async (id: string, data: Record<string, unknown>) => {
    return employeeRepository.update(id, data)
  },

  deleteEmployee: async (id: string) => {
    return employeeRepository.delete(id)
  },

  getMentorMentees: async (mentorId: string) => {
    const relations = await mentorMenteeRepository.getMenteesByMentorId(mentorId)
    return relations.map((r: any) => r.mentee)
  },

  assignMenteeToMentor: async (mentorId: string, menteeId: string) => {
    return mentorMenteeRepository.assignMentee(mentorId, menteeId)
  },

  removeMenteeFromMentor: async (mentorId: string, menteeId: string) => {
    return mentorMenteeRepository.unassignMentee(mentorId, menteeId)
  }
}
