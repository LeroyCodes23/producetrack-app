'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';

export type UserRole = 'admin' | 'producer';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  userType: 'Admin' | 'Producer';
}

interface AuthContextType {
  user: AuthUser | null;
  userRole: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const user: AuthUser | null = session?.user
    ? {
        id: (session.user as any).id,
        email: session.user.email || '',
        name: session.user.name || '',
        firstName: (session.user as any).firstName,
        lastName: (session.user as any).lastName,
        username: (session.user as any).username,
        userType: (session.user as any).userType || 'Producer',
      }
    : null;

  const userRole: UserRole | null = user
    ? user.userType === 'Admin'
      ? 'admin'
      : 'producer'
    : null;

  const logout = () => {
    nextAuthSignOut({ redirectTo: '/login' });
  };

  const value = {
    user,
    userRole,
    isAuthenticated: !!user,
    isLoading: status === 'loading',
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}