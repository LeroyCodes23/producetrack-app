// src/auth.config.ts
import type { NextAuthConfig } from 'next-auth';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';

// ---- Azure AD group IDs (from Azure) ----
const ADMIN_GROUP_ID = process.env.AUTH_ADMIN_GROUP_ID;

/**
 * Determine role from the Azure AD roles claim.
 * Edge-safe — no Node modules needed.
 */
function determineRole(roles: string[] | undefined): 'Admin' | 'Producer' {
  if (!roles || !Array.isArray(roles)) {
    return 'Producer';
  }
  if (ADMIN_GROUP_ID && roles.includes(ADMIN_GROUP_ID)) {
    return 'Admin';
  }
  return 'Producer';
}

/**
 * Edge-safe Auth.js configuration.
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
    // ---- JWT callback (edge-safe) ----
    async jwt({ token, account, profile }) {
      // On first login, populate token from Microsoft profile
      if (account && profile) {
        const email = (profile as any).email as string | undefined;
        const name = (profile as any).name as string | undefined;
        const roles = (profile as any).roles as string[] | undefined;

        const nameParts = (name || email || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        const username = email ? email.split('@')[0].toLowerCase() : '';
        const userType = determineRole(roles);

        token.email = email;
        token.name = name;
        (token as any).userType = userType;
        (token as any).firstName = firstName;
        (token as any).lastName = lastName;
        (token as any).username = username;
        (token as any).roles = roles;
      }
      return token;
    },

    // ---- Session callback (edge-safe) ----
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).userType = (token as any).userType || 'Producer';
        (session.user as any).firstName = (token as any).firstName;
        (session.user as any).lastName = (token as any).lastName;
        (session.user as any).username = (token as any).username;
        (session.user as any).roles = (token as any).roles;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },

    // ---- Authorized callback for middleware ----
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;
      const isOnLogin = pathname.startsWith('/login');
      const isOnApiAuth = pathname.startsWith('/api/auth');
      const isPublic = isOnLogin || isOnApiAuth;

      if (isPublic) {
        // If already logged in and hitting /login, redirect to their home
        if (isLoggedIn && isOnLogin) {
          const userType = (auth?.user as any)?.userType as string | undefined;
          const redirectTo = userType === 'Admin' ? '/dashboard' : '/producer-portal';
          return Response.redirect(new URL(redirectTo, nextUrl));
        }
        return true;
      }

      // Not public and not logged in → redirect to login
      if (!isLoggedIn) {
        return false;
      }

      // Role-based checks
      const userType = (auth?.user as any)?.userType as string | undefined;
      const isOnDashboard = pathname.startsWith('/dashboard');
      const isOnProducerPortal = pathname.startsWith('/producer-portal');

      // Admin-only: /dashboard
      if (isOnDashboard && userType !== 'Admin') {
        return Response.redirect(new URL('/producer-portal', nextUrl));
      }

      // Producer-only: /producer-portal (Admins can also access if needed, allow both)
      if (isOnProducerPortal && !userType) {
        return Response.redirect(new URL('/login', nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;