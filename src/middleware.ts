// src/middleware.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

const PUBLIC_ROUTES = ['/login', '/api/auth'];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Not authenticated → redirect to login
  if (!req.auth) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  const userType = (req.auth.user as any)?.userType as string | undefined;

  // Admin-only routes
  if (pathname.startsWith('/dashboard') && userType !== 'Admin') {
    return NextResponse.redirect(new URL('/producer-portal', req.url));
  }

  // Producer-only routes (Admins can access too, they see everything)
  if (pathname.startsWith('/producer-portal') && !userType) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|png|svg)).*)'],
};