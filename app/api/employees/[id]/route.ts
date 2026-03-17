import { NextResponse } from 'next/server'
import { employeeService } from '@/lib/services/employee.service'

/**
 * GET /api/employees/[id]
 * Retrieves full details for a specific employee, including mentors/mentees relations.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const employee = await employeeService.getEmployeeById(id)
    return NextResponse.json(employee, { status: 200 })
  } catch (error: any) {
    if (error.message === 'Employee not found') return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    console.error(`Failed to fetch employee:`, error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

/**
 * PATCH /api/employees/[id]
 * Updates any subset of employee fields.
 * Accepted body fields: name, email, password, contactNo, role, address, collegeName, degree
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    // Build update payload from only the recognized, non-empty fields
    const allowed = ['name', 'email', 'password', 'contactNo', 'role', 'address', 'collegeName', 'degree']
    const updateData: Record<string, unknown> = {}
    for (const key of allowed) {
      if (body[key] !== undefined && body[key] !== '') {
        updateData[key] = body[key]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid update fields provided' }, { status: 400 })
    }

    const updated = await employeeService.updateEmployee(id, updateData)
    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error(`Failed to update employee:`, error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

/**
 * DELETE /api/employees/[id]
 * Deletes an employee from the system entirely.
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await employeeService.deleteEmployee(id)
    return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error(`Failed to delete employee:`, error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
