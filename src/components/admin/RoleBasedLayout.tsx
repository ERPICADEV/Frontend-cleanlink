// src/components/admin/RoleBasedLayout.tsx - FIXED
import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminLayout } from './AdminLayout';
import { FieldAdminLayout } from './FieldAdminLayout';
import { CardLoadingState } from './shared/LoadingState'; // Changed from CardLoadingState

interface RoleBasedLayoutProps {
  children: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function RoleBasedLayout({ children, breadcrumbs }: RoleBasedLayoutProps) {
  const { user, isBootstrapping } = useAuth(); // Changed from isBootstrapping

  if (isBootstrapping) {
    return <CardLoadingState />;
  }

  if (!user) {
    return <div>Please log in to access the admin panel.</div>;
  }

  // Super Admin: pages are already wrapped in AdminLayout themselves
  if (user.role === 'super_admin') {
    return <>{children}</>;
  }

  // Field Admin / Normal Admin get the field admin dashboard
  if (user.role === 'field_admin' ){
    return <FieldAdminLayout breadcrumbs={breadcrumbs}>{children}</FieldAdminLayout>;
  }

  // Regular users shouldn't reach here (protected by AdminRoute)
  return <div>Unauthorized access</div>;
}