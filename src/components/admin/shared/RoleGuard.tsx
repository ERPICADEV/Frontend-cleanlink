import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// These roles should match what's defined in your backend
type AdminRole = 'super_admin' | 'admin' | 'user';

interface RoleGuardProps {
  allowedRoles: AdminRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const { user } = useAuth();
  const userRole = user?.role as AdminRole | undefined;

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Helper hooks for common role checks
export const useUserRole = () => {
  const { user } = useAuth();
  return {
    isSuperAdmin: user?.role === 'super_admin',
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user',
    userRole: user?.role as AdminRole | undefined,
  };
};

// Component variants for common role-based rendering
export const SuperAdminOnly = ({ children, fallback }: Omit<RoleGuardProps, 'allowedRoles'>) => (
  <RoleGuard allowedRoles={['super_admin']} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const AdminOnly = ({ children, fallback }: Omit<RoleGuardProps, 'allowedRoles'>) => (
  <RoleGuard allowedRoles={['admin']} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const AdminOrSuperAdmin = ({ children, fallback }: Omit<RoleGuardProps, 'allowedRoles'>) => (
  <RoleGuard allowedRoles={['super_admin', 'admin']} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const UserOnly = ({ children, fallback }: Omit<RoleGuardProps, 'allowedRoles'>) => (
  <RoleGuard allowedRoles={['user']} fallback={fallback}>
    {children}
  </RoleGuard>
);
