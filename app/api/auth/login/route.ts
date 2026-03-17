import { NextResponse } from 'next/server'
import { employeeService } from '@/lib/services/employee.service'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    let employee
    try {
      employee = await employeeService.getEmployeeByEmail(email)
    } catch {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    if (employee.role === 'NOT_EMPLOYEE' || employee.role === 'NOT_MENTOR') {
      return NextResponse.json({ error: 'you are not given access to use this protal' }, { status: 403 })
    }

    const isMatch = await bcrypt.compare(password, employee.password)
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Generate JWT
    const token = await signToken({
      id: employee.id,
      email: employee.email,
      role: employee.role,
      name: employee.name
    })

    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: employee.id,
        email: employee.email,
        role: employee.role,
        name: employee.name
      }
    }, { status: 200 })

    // Set cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
