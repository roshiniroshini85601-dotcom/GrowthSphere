import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('cookie')
    if (!authHeader) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Extract auth_token from cookies string
    const match = authHeader.match(/auth_token=([^;]+)/)
    const token = match ? match[1] : null

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    return NextResponse.json({ user: payload }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
