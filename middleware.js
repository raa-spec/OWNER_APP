import { NextResponse } from 'next/server';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/session';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Protected Owner routes
  const isOwnerProtectedRoute =
    pathname.startsWith('/owner/dashboard') ||
    pathname.startsWith('/owner/select-category') ||
    pathname.startsWith('/owner/configure-business') ||
    pathname.startsWith('/owner/onboarding');

  // Protected Staff routes
  const isStaffProtectedRoute = pathname.startsWith('/staff/dashboard');

  if (!isOwnerProtectedRoute && !isStaffProtectedRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySession(token);

  // If no valid session exists, block access and redirect to login
  if (!session) {
    const loginUrl = new URL(
      isStaffProtectedRoute ? '/owner/staff-login' : '/owner/login',
      request.url
    );
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based protection: pure Staff/Doctor cannot access Owner portals
  if (isOwnerProtectedRoute) {
    if (session.role === 'staff' || session.role === 'doctor') {
      return NextResponse.redirect(new URL('/staff/dashboard', request.url));
    }
  }

  // Role-based protection: Owners attempting staff portal are routed to Owner dashboard
  if (isStaffProtectedRoute) {
    if (session.role === 'owner') {
      return NextResponse.redirect(new URL('/owner/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/owner/dashboard/:path*',
    '/owner/select-category/:path*',
    '/owner/configure-business/:path*',
    '/owner/onboarding/:path*',
    '/staff/dashboard/:path*',
  ],
};
