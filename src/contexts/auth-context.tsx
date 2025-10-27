'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  username: string;
  role: string;
  name: string;
  loginTime: string;
  isEmployee?: boolean;
  employeeId?: string;
  department?: string;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  goBack: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// الصفحات التي لا تحتاج مصادقة
const PUBLIC_ROUTES = ['/', '/login', '/employee-login'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // التحقق من وجود مستخدم مسجل دخوله
    if (typeof window !== 'undefined') {
      // Check admin user
      const storedUser = localStorage.getItem('hotel_user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (error) {
          localStorage.removeItem('hotel_user');
        }
      } else {
        // Check employee session
        const employeeSession = localStorage.getItem('employee_session');
        if (employeeSession) {
          try {
            const employeeData = JSON.parse(employeeSession);
            setUser({
              ...employeeData,
              isEmployee: true
            });
          } catch (error) {
            localStorage.removeItem('employee_session');
          }
        }
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // التحقق من المصادقة عند تغيير المسار
    if (!isLoading) {
      const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
      const isAuthenticated = !!user;

      if (!isAuthenticated && !isPublicRoute) {
        router.push('/login');
      }
    }
  }, [user, pathname, isLoading, router]);

  const login = (userData: User) => {
    setUser(userData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hotel_user', JSON.stringify(userData));
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hotel_user');
      localStorage.removeItem('employee_session');
    }
    router.push('/');
  };

  const goBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    goBack
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