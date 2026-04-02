import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('[MIDDLEWARE] FATAL: JWT_SECRET not set');
}

const secret = new TextEncoder().encode(JWT_SECRET);

const protectedRoutes = ['/dashboard', '/producer-portal'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    
    if (!isProtectedRoute) {
        return NextResponse.next();
    }

    const token = request.cookies.get('token')?.value;
    console.log('[MIDDLEWARE] Path:', pathname);
    console.log('[MIDDLEWARE] Token present:', token ? 'YES' : 'NO');

    if (!token) {
        console.log('[MIDDLEWARE] No token, redirecting to login');
        const url = new URL('/login', request.url);
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
    }

    try {
        const { payload } = await jwtVerify(token, secret);
        
        const userType = payload.userType as string;
        const userId = payload.userId as number;
        const email = payload.email as string;
        
        console.log('[MIDDLEWARE] User:', email, 'Role:', userType, 'Path:', pathname);
        
        // Allow Admins to access everything
        if (userType === 'Admin') {
            console.log('[MIDDLEWARE] Admin user, access granted to all pages.');
            const response = NextResponse.next();
            response.headers.set('X-User-Id', String(userId));
            response.headers.set('X-User-Type', userType);
            return response;
        }

        // If trying to access dashboard and user is NOT Admin → redirect to producer-portal
        if (pathname.startsWith('/dashboard') && userType !== 'Admin') {
            console.log('[MIDDLEWARE] Non-admin trying to access dashboard, redirecting to producer-portal');
            return NextResponse.redirect(new URL('/producer-portal', request.url));
        }

        // User has access to the requested page
        console.log('[MIDDLEWARE] Access GRANTED to:', pathname);
        const response = NextResponse.next();
        response.headers.set('X-User-Id', String(userId));
        response.headers.set('X-User-Type', userType);
        
        return response;
        
    } catch (error: any) {
        console.log('[MIDDLEWARE] Verification FAILED:', error.message);
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('token');
        return response;
    }
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/producer-portal/:path*'
    ],
};