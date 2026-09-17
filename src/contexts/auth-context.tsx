'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export type UserRole = 'admin' | 'producer';

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  userType: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: AuthUser | null;
  userRole: UserRole | null;
  isAuthenticated: boolean;
  login: (role: UserRole, user?: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedRole = localStorage.getItem('userRole') as UserRole | null;
      const storedUser = localStorage.getItem('user');
      
      if (storedRole) {
        setUserRole(storedRole);
        setIsAuthenticated(true);
      }
      
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('[AUTH] Failed to parse stored user:', e);
        }
      }
      
      if (!storedRole) {
        // Allow unauthenticated access to login and auth pages
        const allowed = ['/login', '/login/register', '/login/forgot-password', '/login/reset-password'];
        if (!allowed.includes(pathname)) {
          router.push('/login');
        }
      }
    } catch (error) {
      // localStorage is not available on the server
      if (pathname !== '/login') {
        // do nothing, let the client-side redirect
      }
    }
  }, [pathname, router]);

  const login = (role: UserRole, userData?: AuthUser) => {
    setUserRole(role);
    setIsAuthenticated(true);
    localStorage.setItem('userRole', role);
    
    if (userData) {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const logout = () => {
    setUser(null);
    setUserRole(null);
    setIsAuthenticated(false);
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/login');
  };

  const value = { user, userRole, isAuthenticated, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}