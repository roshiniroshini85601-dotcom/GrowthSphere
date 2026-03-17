import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Public paths
  if (path === '/login' || path.startsWith('/api/auth/')) {
    return NextResponse.next()
  }

  // Check for token
  const token = request.cookies.get('auth_token')?.value
  
  if (!token) {
    // Redirect to login if accessing protected routes without token
    if (path.startsWith('/admin') || path.startsWith('/mentor') || path.startsWith('/mentee')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  // Verify token
  const payload = await verifyToken(token)
  if (!payload) {
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('auth_token')
    return response
  }

  // Role-based routing protection
  const role = payload.role as string

  // If trying to access root or login while authenticated, redirect to their dashboard
  if (path === '/' || path === '/login') {
    if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin', request.url))
    if (role === 'MENTOR') return NextResponse.redirect(new URL('/mentor/mentees', request.url))
    if (role === 'INTERN') return NextResponse.redirect(new URL('/mentee', request.url))
  }

  // Prevent users from accessing incorrect dashboards
  if (path.startsWith('/admin') && role !== 'ADMIN') {
    if (role === 'MENTOR') return NextResponse.redirect(new URL('/mentor/mentees', request.url))
    if (role === 'INTERN') return NextResponse.redirect(new URL('/mentee', request.url))
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  if (path.startsWith('/mentor') && role !== 'MENTOR') {
    if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin', request.url))
    if (role === 'INTERN') return NextResponse.redirect(new URL('/mentee', request.url))
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  if (path.startsWith('/mentee') && role !== 'INTERN') {
    if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin', request.url))
    if (role === 'MENTOR') return NextResponse.redirect(new URL('/mentor/mentees', request.url))
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
