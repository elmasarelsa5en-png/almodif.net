'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  username: string;
  role: string;
  name: string;
  email?: string;
  id?: string;
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
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  goBack: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// الصفحات التي لا تحتاج مصادقة
const PUBLIC_ROUTES = [
  '/', 
  '/login', 
  '/employee-login',
  '/public/landing',
  '/public/faq',
  '/guest-app',
  '/guest-app/login',
  '/guest-app/booking',
  '/guest-app/booking-confirmation',
  '/guest-app/contract',
  '/guest-app/contact',
  '/guest-app/my-bookings',
  '/guest-app/my-orders',
  '/guest-app/review'
];

// دالة للتحقق من الصفحات العامة (تدعم dynamic routes)
const isPublicRoute = (path: string): boolean => {
  // تحقق من المسارات الثابتة
  if (PUBLIC_ROUTES.includes(path)) return true;
  
  // تحقق من المسارات الديناميكية
  if (path.startsWith('/track/')) return true; // صفحة تتبع الحجز
  if (path.startsWith('/guest-app/menu/')) return true; // قوائم الطعام
  if (path.startsWith('/pay/')) return true; // صفحات الدفع
  if (path.startsWith('/public-site/')) return true; // مواقع الفنادق العامة
  
  return false;
};

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
      const isPublic = isPublicRoute(pathname);
      const isAuthenticated = !!user;

      if (!isAuthenticated && !isPublic) {
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

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('hotel_user', JSON.stringify(updatedUser));
      }
    }
  };

  const refreshUser = async () => {
    if (user && user.employeeId) {
      try {
        const { getEmployees } = await import('@/lib/firebase-data');
        const employees = await getEmployees();
        const currentEmployee = employees.find(emp => emp.id === user.employeeId);
        
        if (currentEmployee) {
          const updatedUser = {
            ...user,
            permissions: currentEmployee.permissions || [],
            role: currentEmployee.role,
            department: currentEmployee.department,
          };
          setUser(updatedUser);
          if (typeof window !== 'undefined') {
            localStorage.setItem('hotel_user', JSON.stringify(updatedUser));
          }
          console.log('✅ تم تحديث الصلاحيات:', currentEmployee.permissions?.length);
        }
      } catch (error) {
        console.error('Error refreshing user:', error);
      }
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
    updateUser,
    refreshUser,
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