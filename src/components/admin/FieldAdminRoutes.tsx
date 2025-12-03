// src/components/admin/FieldAdminRoutes.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import RoleBasedLayout from '../../components/admin/RoleBasedLayout';
import FieldAdminDashboard from '@/pages/admin/FieldAdminDashboard';
import FieldAdminReports from '@/pages/admin/FieldAdminReports';
import FieldAdminApprovals from '@/pages/admin/FieldAdminApprovals';

export function FieldAdminRoutes() {
  return (
    <RoleBasedLayout>
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<FieldAdminDashboard />} />
        <Route path="reports" element={<FieldAdminReports />} />
        <Route path="approvals" element={<FieldAdminApprovals />} />
      </Routes>
    </RoleBasedLayout>
  );
}