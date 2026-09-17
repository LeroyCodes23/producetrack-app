// src/auth.config.ts
import type { NextAuthConfig } from 'next-auth';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';

/**
 * Edge-safe Auth.js configuration.
 * Do NOT import Node.js modules (mssql, fs, etc.) in this file.
 * Used by middleware, which runs in the Edge Runtime.
 */
export const authConfig = {
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  trustHost: true,
  callbacks: {
    // Note: JWT and session callbacks are defined in src/auth.ts (Node-only)
    // The edge config only needs authorized() for middleware
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith('/login');
      const isOnApiAuth = nextUrl.pathname.startsWith('/api/auth');
      const isPublic = isOnLogin || isOnApiAuth;

      if (isPublic) {
        // If already logged in and hitting /login, redirect to portal
        if (isLoggedIn && isOnLogin) {
          return Response.redirect(new URL('/producer-portal', nextUrl));
        }
        return true;
      }

      // Not public and not logged in → redirect to login
      if (!isLoggedIn) {
        return false; // Auth.js will redirect to signIn page
      }

      // Role-based check
      const userType = (auth.user as any)?.userType as string | undefined;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');

      if (isOnDashboard && userType !== 'Admin') {
        return Response.redirect(new URL('/producer-portal', nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;