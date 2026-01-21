import { Suspense, lazy } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminRoute from "./components/AdminRoute";
import { AdminRoutes } from "./components/admin/AdminRoutes";
import { FieldAdminRoutes } from "./components/admin/FieldAdminRoutes";

// Route-level code splitting (React.lazy)
const Landing = lazy(() => import("./pages/Landing"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Login = lazy(() => import("./pages/Login"));
const Home = lazy(() => import("./pages/Home"));
const Profile = lazy(() => import("./pages/Profile"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const CreatePost = lazy(() => import("./pages/CreatePost"));
const PopularProblems = lazy(() => import("./pages/PopularProblems"));
const PostDetail = lazy(() => import("./pages/PostDetail"));
const LocationSettings = lazy(() => import("./pages/LocationSettings"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Settings = lazy(() => import("./pages/Settings"));
const Rewards = lazy(() => import("./pages/Rewards"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const ReportsManagement = lazy(() => import("./pages/admin/ReportsManagement"));
const AuditLogsPage = lazy(() => import("./pages/admin/AuditLogs"));
const AdminAnalytics = lazy(() => import("./pages/admin/Analytics"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));

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

const PageFallback = (
  <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
    Loading…
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <Toaster />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Suspense fallback={PageFallback}>
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
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
