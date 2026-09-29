// src/auth.config.ts
import type { NextAuthConfig } from 'next-auth';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';

// ---- Azure AD group IDs (from Azure) ----
const ADMIN_GROUP_ID = process.env.AUTH_ADMIN_GROUP_ID;
const EMPLOYEE_GROUP_ID = process.env.AUTH_EMPLOYEE_GROUP_ID;
const PRODUCER_GROUP_ID = process.env.AUTH_PRODUCER_GROUP_ID;

export type UserType = 'Admin' | 'Employee' | 'Producer';

function determineRole(
  roles: string[] | undefined,
  email: string | undefined
): UserType | null {
  if (ADMIN_GROUP_ID && roles?.includes(ADMIN_GROUP_ID)) return 'Admin';
  if (EMPLOYEE_GROUP_ID && roles?.includes(EMPLOYEE_GROUP_ID)) return 'Employee';
  if (email && /^\d+@/i.test(email)) return 'Producer';
  return null;
}

function extractClientNumber(email: string | undefined): string | null {
  if (!email) return null;
  const match = email.match(/^(\d+)@/i);
  return match ? match[1] : null;
}

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

  // ==================== TEMP DEBUG EVENTS ====================
  events: {
    async signIn({ user, account, profile }) {
      console.error('========== SIGN IN EVENT ==========');
      console.error('user.email:', user?.email);
      console.error('profile.email:', (profile as any)?.email);
      console.error('profile.preferred_username:', (profile as any)?.preferred_username);
      console.error('profile.upn:', (profile as any)?.upn);
      console.error('profile.roles:', JSON.stringify((profile as any)?.roles));
      console.error('====================================');
    },
  },
  // ==================== END TEMP DEBUG ====================

  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        // ==================== TEMP DEBUG ====================
        console.error('========== JWT DEBUG ==========');
        console.error('profile.email:', JSON.stringify((profile as any).email));
        console.error('profile.preferred_username:', (profile as any).preferred_username);
        console.error('profile.upn:', (profile as any).upn);
        console.error('profile.roles:', JSON.stringify((profile as any).roles));
        console.error('ADMIN_GROUP_ID:', ADMIN_GROUP_ID);
        console.error('EMPLOYEE_GROUP_ID:', EMPLOYEE_GROUP_ID);
        console.error('email regex match:', /^\d+@/i.test((profile as any).email || ''));
        console.error('determineRole result:', determineRole((profile as any).roles, (profile as any).email));
        console.error('==============================');
        // ==================== END TEMP DEBUG ====================

        const email = 
          ((profile as any).email as string | undefined) ||
          ((profile as any).preferred_username as string | undefined) ||
          ((profile as any).upn as string | undefined);
        const name = (profile as any).name as string | undefined;
        const roles = (profile as any).roles as string[] | undefined;

        const nameParts = (name || email || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        const username = email ? email.split('@')[0].toLowerCase() : '';

        const userType = determineRole(roles, email);
        const clientNumber = userType === 'Producer' ? extractClientNumber(email) : null;

        token.email = email;
        token.name = name;
        (token as any).userType = userType;
        (token as any).clientNumber = clientNumber;
        (token as any).firstName = firstName;
        (token as any).lastName = lastName;
        (token as any).username = username;
        (token as any).roles = roles;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).userType = (token as any).userType || null;
        (session.user as any).clientNumber = (token as any).clientNumber || null;
        (session.user as any).firstName = (token as any).firstName;
        (session.user as any).lastName = (token as any).lastName;
        (session.user as any).username = (token as any).username;
        (session.user as any).roles = (token as any).roles;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },

    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;
      const userType = (auth?.user as any)?.userType as UserType | null | undefined;

      const isOnLogin = pathname.startsWith('/login');
      const isOnApiAuth = pathname.startsWith('/api/auth');
      const isOnApiHealth = pathname.startsWith('/api/health');
      const isOnNoAccess = pathname.startsWith('/no-access');
      const isPublic = isOnLogin || isOnApiAuth || isOnApiHealth || isOnNoAccess;

      if (isPublic) {
        if (isLoggedIn && userType && isOnLogin) {
          const redirectTo = userType === 'Producer' ? '/producer-portal' : '/dashboard';
          return Response.redirect(new URL(redirectTo, nextUrl));
        }
        return true;
      }

      if (!isLoggedIn) {
        return false;
      }

      if (!userType) {
        return Response.redirect(new URL('/no-access', nextUrl));
      }

      const isOnDashboard = pathname.startsWith('/dashboard');

      if (isOnDashboard && userType === 'Producer') {
        return Response.redirect(new URL('/producer-portal', nextUrl));
      }

      const isOnProducers = pathname.startsWith('/producers');

      if (isOnProducers && userType === 'Producer') {
        return Response.redirect(new URL('/producer-portal', nextUrl));
      }

      const isOnSensus = pathname.startsWith('/sensus');

      if (isOnSensus && userType !== 'Producer') {
        return Response.redirect(new URL('/producers', nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;