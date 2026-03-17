import { prisma } from '../prisma'

export const employeeRepository = {
  /**
   * Fetch all employees including their mentor/mentee assignments.
   */
  findAll: async () => {
    return prisma.employee.findMany({
      include: {
        mentors: { include: { mentor: true } },
        mentees: { include: { mentee: true } }
      }
    })
  },

  /**
   * Fetch a single employee with full assignment data.
   */
  findById: async (id: string) => {
    return prisma.employee.findUnique({
      where: { id },
      include: {
        mentors: { include: { mentor: true } },
        mentees: { include: { mentee: true } }
      }
    })
  },

  /**
   * Fetch an employee by email (useful for auth)
   */
  findByEmail: async (email: string) => {
    return prisma.employee.findUnique({
      where: { email },
      include: {
        mentors: { include: { mentor: true } },
        mentees: { include: { mentee: true } }
      }
    })
  },

  /**
   * Create a new employee with the supplied fields.
   */
  create: async (data: {
    name: string
    email: string
    password?: string
    contactNo: string
    role?: string
    address?: string
    collegeName?: string
    degree?: string
  }) => {
    return prisma.employee.create({ data: data as any })
  },

  /**
   * Partially update an employee (e.g. change role, flag, etc.)
   */
  update: async (id: string, data: Record<string, unknown>) => {
    return prisma.employee.update({
      where: { id },
      data: data as any
    })
  },

  /**
   * Permanently delete an employee record.
   */
  delete: async (id: string) => {
    return prisma.employee.delete({
      where: { id }
    })
  }
}
