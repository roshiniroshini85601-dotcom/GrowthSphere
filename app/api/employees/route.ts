import { NextResponse } from 'next/server'
import { employeeService } from '@/lib/services/employee.service'

/**
 * GET /api/employees
 * Retrieves all employees across the organization.
 */
export async function GET() {
  try {
    const employees = await employeeService.getAllEmployees()
    return NextResponse.json(employees, { status: 200 })
  } catch (error) {
    console.error('Failed to fetch employees:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

/**
 * POST /api/employees
 * Creates a new employee entry.
 * Payload should match Prisma.EmployeeCreateInput
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    // Perform basic validation or standard zod checking here
    if (!body.name || !body.email || !body.contactNo) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newEmployee = await employeeService.createEmployee({
      name: body.name,
      email: body.email,
      contactNo: body.contactNo,
      role: body.role || 'NOT_EMPLOYEE',
      address: body.address,
      collegeName: body.collegeName,
      degree: body.degree,
    })

    return NextResponse.json(newEmployee, { status: 201 })
  } catch (error) {
    console.error('Failed to create employee:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
