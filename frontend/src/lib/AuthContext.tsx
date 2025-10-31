'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '~/lib/auth';
import { getCurrentUser, logout as authLogout } from '~/lib/auth';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      // Public pages that don't require authentication
      const publicPages = ['/login', '/register', '/'];
      
      // Protected pages that authenticated users can access
      const protectedPages = ['/dashboard', '/appointments', '/records', '/patients', '/settings'];
      
      if (!currentUser && !publicPages.includes(pathname)) {
        // Not authenticated and trying to access protected page → redirect to login
        router.push('/login');
      } else if (currentUser && publicPages.includes(pathname)) {
        // Authenticated user on public page → redirect to dashboard
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [pathname]);

  const logout = () => {
    authLogout();
    setUser(null);
  };

  const refreshUser = async () => {
    await loadUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
