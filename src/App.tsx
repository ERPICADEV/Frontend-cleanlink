    import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import CreatePost from "./pages/CreatePost";
import PopularProblems from "./pages/PopularProblems";
import PostDetail from "./pages/PostDetail";
import LocationSettings from "./pages/LocationSettings";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Rewards from "./pages/Rewards";
import NotFound from "./pages/NotFound";
import PublicProfile from "./pages/PublicProfile";
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/admin/Dashboard";
import ReportsManagement from "./pages/admin/ReportsManagement";
import AuditLogsPage from "./pages/admin/AuditLogs";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminSettings from "./pages/admin/Settings";
import { AdminRoutes } from "./components/admin/AdminRoutes";
import { FieldAdminRoutes } from "./components/admin/FieldAdminRoutes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 401 (Unauthorized) or 403 (Forbidden) - these are auth issues
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        // Don't retry on 503 (Service Unavailable) - server is down
        if (error?.status === 503) {
          return false;
        }
        // Retry other errors up to 2 times
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Suppress error logging for expected 401s (when user is not logged in)
      onError: (error: any) => {
        // Only log non-401 errors to console
        if (error?.status !== 401) {
          // Let React Query handle the error normally
          return;
        }
        // Silently handle 401 errors - they're expected when user is not logged in
      },
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry auth errors
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        // Don't retry server errors
        if (error?.status >= 500) {
          return false;
        }
        return failureCount < 1;
      },
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/landing" element={<Landing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/user/:userId" element={<PublicProfile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/popular" element={<PopularProblems />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/location" element={<LocationSettings />} />
          
          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute allowedRoles={['super_admin']}>
                <AdminRoutes />
              </AdminRoute>
            }
          />
          
          <Route
            path="/field-admin/*"
            element={
              <AdminRoute allowedRoles={['field_admin']}>
                <FieldAdminRoutes />
              </AdminRoute>
            }
          />
          
          <Route path="/404" element={<NotFound />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
