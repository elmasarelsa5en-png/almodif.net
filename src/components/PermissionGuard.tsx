'use client';

import { useAuth } from '@/contexts/auth-context';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '@/lib/permissions';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: string;
  anyPermissions?: string[];
  allPermissions?: string[];
  fallback?: React.ReactNode;
  redirect?: string;
  hideIfNoPermission?: boolean;
}

/**
 * مكون للتحقق من الصلاحيات
 * يمكن استخدامه لحماية المكونات أو إخفائها
 */
export function PermissionGuard({
  children,
  permission,
  anyPermissions,
  allPermissions,
  fallback,
  redirect,
  hideIfNoPermission = false,
}: PermissionGuardProps) {
  const { user } = useAuth();
  const router = useRouter();

  // التحقق من الصلاحيات
  let hasAccess = true;

  if (permission && user) {
    hasAccess = hasPermission(user.permissions || [], permission);
  }

  if (anyPermissions && user) {
    hasAccess = hasAnyPermission(user.permissions || [], anyPermissions);
  }

  if (allPermissions && user) {
    hasAccess = hasAllPermissions(user.permissions || [], allPermissions);
  }

  // إعادة التوجيه إذا لم يكن لديه صلاحية
  useEffect(() => {
    if (!hasAccess && redirect) {
      router.push(redirect);
    }
  }, [hasAccess, redirect, router]);

  // إخفاء المكون إذا لم يكن لديه صلاحية
  if (!hasAccess) {
    if (hideIfNoPermission) {
      return null;
    }

    if (fallback) {
      return <>{fallback}</>;
    }

    if (redirect) {
      return null;
    }

    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-white/20">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-white mb-2">غير مصرح لك</h2>
            <p className="text-gray-300 mb-6">
              ليس لديك الصلاحية للوصول إلى هذه الصفحة
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 font-medium"
            >
              العودة للوحة التحكم
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * مكون بسيط لإخفاء عناصر واجهة المستخدم
 */
export function HasPermission({
  children,
  permission,
  anyPermissions,
  allPermissions,
}: {
  children: React.ReactNode;
  permission?: string;
  anyPermissions?: string[];
  allPermissions?: string[];
}) {
  return (
    <PermissionGuard
      permission={permission}
      anyPermissions={anyPermissions}
      allPermissions={allPermissions}
      hideIfNoPermission={true}
    >
      {children}
    </PermissionGuard>
  );
}

/**
 * Hook للتحقق من الصلاحيات
 */
export function usePermissions() {
  const { user } = useAuth();
  const userPermissions = user?.permissions || [];

  return {
    hasPermission: (permission: string) => hasPermission(userPermissions, permission),
    hasAnyPermission: (permissions: string[]) => hasAnyPermission(userPermissions, permissions),
    hasAllPermissions: (permissions: string[]) => hasAllPermissions(userPermissions, permissions),
    permissions: userPermissions,
  };
}
