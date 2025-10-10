import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/jobs',
  '/wallet',
  '/chat',
  '/driver',
  '/customer',
  '/admin'
];

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/about',
  '/contact',
  '/api'
];

export function middleware(request: NextRequest) {
  // COMPLETELY DISABLED - ALLOW ALL REQUESTS
  console.log(`✅ Middleware DISABLED - allowing: ${request.nextUrl.pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
