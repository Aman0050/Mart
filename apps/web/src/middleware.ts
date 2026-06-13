import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAuthRoute = path.startsWith('/login') || path.startsWith('/register') || path.startsWith('/forgot-password') || path.startsWith('/reset-password') || path.startsWith('/verify-email');
  const isProtectedRoute = path.startsWith('/dashboard') || path.startsWith('/settings');

  // Because the refresh_token is an httpOnly cookie, we can check for its presence
  // to loosely determine if a user might be logged in. Real verification happens in the API.
  const hasRefreshToken = request.cookies.has('refresh_token');

  if (isAuthRoute && hasRefreshToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isProtectedRoute && !hasRefreshToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
