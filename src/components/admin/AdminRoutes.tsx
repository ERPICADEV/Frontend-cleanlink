import { Routes, Route, Navigate } from 'react-router-dom';
import RoleBasedLayout from './RoleBasedLayout';
import AdminDashboard from '@/pages/admin/Dashboard';
import ReportsManagement from '@/pages/admin/ReportsManagement';
import AdminAnalytics from '@/pages/admin/Analytics';
import AdminSettings from '@/pages/admin/Settings';
import FieldAdminApprovals from '@/pages/admin/FieldAdminApprovals';
import RewardsManagement from '@/pages/admin/RewardsManagement';
import AuditLogsPage from '@/pages/admin/AuditLogs';

export function AdminRoutes() {
  return (
    <RoleBasedLayout>
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="reports" element={<ReportsManagement />} />
        <Route path="rewards" element={<RewardsManagement />} />
        <Route path="approvals" element={<FieldAdminApprovals />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="audit/:reportId" element={<AuditLogsPage />} />
      </Routes>
    </RoleBasedLayout>
  );
}