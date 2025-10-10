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
  const { pathname } = request.nextUrl;
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  );

  // If it's a protected route, check for authentication
  if (isProtectedRoute) {
    // In a real app, you'd check for a valid JWT token
    // For now, we'll check if there's user data in the request
    // This is a simplified version - in production, use proper JWT validation
    
    const userCookie = request.cookies.get('user-session');
    
    if (!userCookie) {
      // Redirect to login if not authenticated
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // For profile routes, ensure user can only access their own profile
  if (pathname.startsWith('/profile/')) {
    const userId = pathname.split('/profile/')[1];
    const userCookie = request.cookies.get('user-session');
    
    if (userCookie) {
      try {
        const userData = JSON.parse(userCookie.value);
        // Allow access to own profile or if user is admin
        if (userData.id !== userId && userData.type !== 'admin') {
          // For now, allow viewing but this could be restricted
          console.log(`User ${userData.id} accessing profile ${userId}`);
        }
      } catch (error) {
        console.error('Error parsing user cookie:', error);
      }
    }
  }

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
