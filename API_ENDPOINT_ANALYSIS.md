# Backend-Frontend API Endpoint Analysis

## Summary

This document analyzes which backend endpoints are being used by the frontend, which ones are missing, and provides recommendations for implementation.

**Last Updated**: After Admin Dashboard Phase 4 Implementation

---

## ✅ **Backend Endpoints Currently Used by Frontend**

### Authentication (`/api/v1/auth`)
- ✅ `POST /api/v1/auth/login` - Used in `AuthContext.tsx`
- ✅ `POST /api/v1/auth/signup` - Used in `AuthContext.tsx`
- ❌ `POST /api/v1/auth/refresh` - **NOT USED** (refresh token not implemented in frontend)

### Users (`/api/v1/users`)
- ✅ `GET /api/v1/users/me` - Used in `AuthContext.tsx` to fetch user profile (includes admin metadata)
- ❌ `PATCH /api/v1/users/me` - **NOT USED** (EditProfile page doesn't call API)
- ❌ `GET /api/v1/users/:id/public` - **NOT USED**
- ❌ `GET /api/v1/users/regions` - **NOT USED** (RegionSelector uses hardcoded data)
- ❌ `PATCH /api/v1/users/me/region` - **NOT USED** (LocationSettings doesn't call API)

### Reports (`/api/v1/reports`)
- ✅ `GET /api/v1/reports` - Used extensively (Home, Profile, PopularProblems, TrendingSidebar, useReports hook)
- ✅ `GET /api/v1/reports/:id` - Used in `PostDetail.tsx`
- ✅ `POST /api/v1/reports` - Used in `CreatePost.tsx`
- ❌ `PATCH /api/v1/reports/:id` - **NOT USED** (EditReportModal exists but doesn't call API)

### Comments (`/api/v1/reports`)
- ✅ `POST /api/v1/reports/:id/comments` - Used in `PostDetail.tsx`
- ✅ `GET /api/v1/reports/:id/comments` - Used via `fetchReportDetail` (comments included in report detail)
- ❌ `PATCH /api/v1/reports/comments/:id` - **NOT USED** (no edit comment functionality)
- ❌ `DELETE /api/v1/reports/comments/:id` - **NOT USED** (no delete comment functionality)

### Votes (`/api/v1/reports`)
- ✅ `POST /api/v1/reports/:id/vote` - Used in `PostRow.tsx`, `IssueCard.tsx`, `PostDetail.tsx`

### Map (`/api/v1/map`)
- ✅ `GET /api/v1/map/reports` - Used in `MapExplorer.tsx`
- ❌ `GET /api/v1/map/clusters` - **NOT USED**
- ❌ `GET /api/v1/map/stats` - **NOT USED**

### Admin (`/api/v1/admin`)
- ✅ `GET /api/v1/admin/reports` - **NOW USED** in `useAdminReports.ts` hook
- ✅ `PATCH /api/v1/admin/reports/:id/assign` - **NOW USED** in `AssignReportModal.tsx`
- ✅ `PATCH /api/v1/admin/reports/:id/resolve` - **NOW USED** in `ResolveReportModal.tsx`
- ✅ `GET /api/v1/admin/audit/reports/:id` - **NOW USED** in `useAuditLogs.ts` hook

---

## ❌ **Backend Endpoints NOT Used by Frontend**

### Authentication
- `POST /api/v1/auth/refresh` - Refresh token endpoint exists but frontend doesn't use it

### Users
- `PATCH /api/v1/users/me` - Update user profile (EditProfile page exists but doesn't call API)
- `GET /api/v1/users/:id/public` - Get public user profile
- `GET /api/v1/users/regions` - Get available regions (RegionSelector uses hardcoded data)
- `PATCH /api/v1/users/me/region` - Update user region (LocationSettings page exists but doesn't call API)

### Reports
- `PATCH /api/v1/reports/:id` - Update/edit report (EditReportModal exists but doesn't call API)

### Comments
- `PATCH /api/v1/reports/comments/:id` - Update comment (no edit comment UI)
- `DELETE /api/v1/reports/comments/:id` - Delete comment (no delete comment UI)

### Map
- `GET /api/v1/map/clusters` - Get map clusters
- `GET /api/v1/map/stats` - Get map statistics

### Notifications (`/api/v1/notifications`)
- ❌ `GET /api/v1/notifications` - **NOT USED** (Notifications page uses dummy data)
- ❌ `GET /api/v1/notifications/unread-count` - **NOT USED** (no unread count badge in UI)

### Rewards (`/api/v1/rewards`)
- ❌ `GET /api/v1/rewards` - **NOT USED** (Rewards page uses dummy data)
- ❌ `POST /api/v1/rewards/:id/redeem` - **NOT USED** (Rewards page has "Claim Now" button but doesn't call API)
- Admin endpoints (create, update, delete rewards) - Not used (no admin UI)

### AI (Internal)
- `POST /internal/ai/reports/:id/result` - Internal endpoint (not for frontend)
- `GET /internal/ai/reports/pending` - Internal endpoint (not for frontend)

### Debug/Health
- `GET /health` - Health check (not used by frontend)
- `GET /sqlite-reports` - Debug endpoint
- `GET /sqlite-reports/:id` - Debug endpoint
- `GET /debug/queue-status` - Debug endpoint
- `POST /debug/trigger-ai/:reportId` - Debug endpoint
- `POST /debug/add-to-queue/:reportId` - Debug endpoint

---

## 🔴 **Missing Backend Endpoints (Frontend Expects but Backend Doesn't Have)**

### Admin Endpoints

1. **`GET /api/v1/admin/users`** ❌ **MISSING**
   - **Used in**: `adminService.ts` → `fetchAdminUsers()` function
   - **Purpose**: Fetch list of admin users for the assign report modal dropdown
   - **Current Workaround**: Falls back to empty array, uses mock data or user context
   - **Priority**: **HIGH** - Needed for assign report functionality
   - **Expected Response**:
     ```json
     [
       {
         "id": "user-id",
         "name": "Admin Name",
         "email": "admin@example.com",
         "region": "Delhi",
         "role": "admin"
       }
     ]
     ```

2. **`GET /api/v1/admin/stats`** or **`GET /api/v1/admin/dashboard`** ❌ **MISSING**
   - **Used in**: `Dashboard.tsx` (currently uses mock data)
   - **Purpose**: Fetch dashboard statistics (pending reports, assigned to you, resolved this month, avg resolution time)
   - **Current Workaround**: Uses hardcoded mock data
   - **Priority**: **MEDIUM** - Dashboard would be more useful with real data
   - **Expected Response**:
     ```json
     {
       "pendingReports": 24,
       "assignedToYou": 8,
       "resolvedThisMonth": 156,
       "avgResolutionTime": "2.4 days",
       "recentActivity": [...],
       "reportsByCategory": {...}
     }
     ```

3. **`GET /api/v1/admin/analytics`** ❌ **MISSING**
   - **Used in**: `Analytics.tsx` (currently uses mock data)
   - **Purpose**: Fetch analytics data (reports over time, resolution rate, top reporters, reports by region)
   - **Current Workaround**: Uses hardcoded mock data
   - **Priority**: **LOW** - Analytics page is marked as "coming soon"
   - **Expected Response**:
     ```json
     {
       "reportsOverTime": [...],
       "resolutionRate": 87,
       "topReporters": [...],
       "reportsByRegion": [...]
     }
     ```

### Other Missing Endpoints

4. **Image Upload Endpoint** ❌ **MISSING**
   - **Used in**: `CreatePost.tsx`, `ResolveReportModal.tsx`
   - **Purpose**: Upload images and get URLs (currently frontend sends base64)
   - **Current Workaround**: Frontend sends base64 encoded images in request body
   - **Priority**: **MEDIUM** - Would improve performance and reduce payload size
   - **Expected**: `POST /api/v1/upload/image` or similar

---

## 📋 **Recommendations**

### High Priority - Missing Admin Endpoints

1. **Implement `GET /api/v1/admin/users`**
   - Query the `admins` table joined with `users` table
   - Return list of all admin users with their details
   - Filter by region if needed (for region-specific admins)
   - **File to create/modify**: `Backend-cleanlink/src/controllers/adminController-sqlite.ts`
   - **Route to add**: `Backend-cleanlink/src/routes/adminRoutes.ts`

2. **Implement `GET /api/v1/admin/stats` or `/api/v1/admin/dashboard`**
   - Aggregate statistics from reports table
   - Count pending reports, assigned reports (for current admin), resolved reports this month
   - Calculate average resolution time
   - Include recent activity and reports by category
   - **File to create/modify**: `Backend-cleanlink/src/controllers/adminController-sqlite.ts`
   - **Route to add**: `Backend-cleanlink/src/routes/adminRoutes.ts`

### Medium Priority - Connect Existing Endpoints

3. **Notifications Integration**
   - Connect `GET /api/v1/notifications` to `Notifications.tsx`
   - Connect `GET /api/v1/notifications/unread-count` to show badge in Header
   - Replace dummy data with real API calls

4. **Rewards Integration**
   - Connect `GET /api/v1/rewards` to `Rewards.tsx`
   - Connect `POST /api/v1/rewards/:id/redeem` to "Claim Now" button
   - Replace dummy data with real API calls

5. **User Profile Updates**
   - Connect `PATCH /api/v1/users/me` in `EditProfile.tsx`
   - Connect `PATCH /api/v1/users/me/region` in `LocationSettings.tsx`
   - Connect `GET /api/v1/users/regions` to populate region selector

6. **Report Editing**
   - Connect `PATCH /api/v1/reports/:id` in `EditReportModal.tsx`

### Low Priority - Nice to Have

7. **Analytics Endpoint**
   - Implement `GET /api/v1/admin/analytics` when ready to build analytics features
   - Currently marked as "coming soon" in UI

8. **Comment Management**
   - Add UI for editing comments (use `PATCH /api/v1/reports/comments/:id`)
   - Add UI for deleting comments (use `DELETE /api/v1/reports/comments/:id`)

9. **Public Profiles**
   - Add public profile page (use `GET /api/v1/users/:id/public`)

10. **Map Enhancements**
    - Use `GET /api/v1/map/clusters` for better map visualization
    - Use `GET /api/v1/map/stats` for map statistics display

11. **Token Refresh**
    - Implement automatic token refresh using `POST /api/v1/auth/refresh` when access token expires

12. **Image Upload**
    - Create dedicated image upload endpoint to reduce payload size

---

## 📊 **Statistics**

- **Total Backend Endpoints**: ~35 endpoints
- **Endpoints Used by Frontend**: 12 endpoints (up from 8)
- **Endpoints NOT Used**: 23 endpoints
- **Missing Endpoints**: 3 admin endpoints + 1 image upload
- **Usage Rate**: ~34% of backend endpoints are actively used by the frontend (up from 27%)

---

## 🔍 **Detailed Endpoint List**

### Backend Endpoints (All)

#### Auth Routes
- `POST /api/v1/auth/signup` ✅`
- `POST /api/v1/auth/login` ✅`
- `POST /api/v1/auth/refresh` ❌`

#### User Routes
- `GET /api/v1/users/me` ✅ (includes admin metadata)
- `PATCH /api/v1/users/me` ❌
- `GET /api/v1/users/:id/public` ❌
- `GET /api/v1/users/regions` ❌
- `PATCH /api/v1/users/me/region` ❌
- `GET /api/v1/users/me/comments` ❌

#### Report Routes
- `GET /api/v1/reports` ✅
- `POST /api/v1/reports` ✅
- `GET /api/v1/reports/:id` ✅
- `PATCH /api/v1/reports/:id` ❌

#### Comment Routes
- `POST /api/v1/reports/:id/comments` ✅
- `GET /api/v1/reports/:id/comments` ✅
- `PATCH /api/v1/reports/comments/:id` ❌
- `DELETE /api/v1/reports/comments/:id` ❌

#### Vote Routes
- `POST /api/v1/reports/:id/vote` ✅

#### Map Routes
- `GET /api/v1/map/reports` ✅
- `GET /api/v1/map/clusters` ❌
- `GET /api/v1/map/stats` ❌

#### Notification Routes
- `GET /api/v1/notifications` ❌
- `GET /api/v1/notifications/unread-count` ❌

#### Reward Routes
- `GET /api/v1/rewards` ❌
- `POST /api/v1/rewards/:id/redeem` ❌
- `POST /api/v1/rewards` (admin) ❌
- `PATCH /api/v1/rewards/:id` (admin) ❌
- `DELETE /api/v1/rewards/:id` (admin) ❌

#### Admin Routes
- `GET /api/v1/admin/reports` ✅ **NOW USED**
- `PATCH /api/v1/admin/reports/:id/assign` ✅ **NOW USED**
- `PATCH /api/v1/admin/reports/:id/resolve` ✅ **NOW USED**
- `GET /api/v1/admin/audit/reports/:id` ✅ **NOW USED**
- `GET /api/v1/admin/users` ❌ **MISSING - NEEDED**
- `GET /api/v1/admin/stats` ❌ **MISSING - NEEDED**
- `GET /api/v1/admin/analytics` ❌ **MISSING - OPTIONAL**

#### AI Routes (Internal)
- `POST /internal/ai/reports/:id/result` (internal)
- `GET /internal/ai/reports/pending` (internal)

#### Health/Debug
- `GET /health` (health check)
- `GET /sqlite-reports` (debug)
- `GET /sqlite-reports/:id` (debug)
- `GET /debug/queue-status` (debug)
- `POST /debug/trigger-ai/:reportId` (debug)
- `POST /debug/add-to-queue/:reportId` (debug)

---

## 🎯 **Action Items**

### Immediate (Week 1) - Critical Missing Endpoints
1. ✅ **Implement `GET /api/v1/admin/users`** - Required for assign report functionality
2. ✅ **Implement `GET /api/v1/admin/stats`** - Required for dashboard to show real data

### Short-term (Week 2-3) - Connect Existing Endpoints
3. ✅ Connect Notifications API to frontend
4. ✅ Connect Rewards API to frontend
5. ✅ Connect user profile update endpoints
6. ✅ Connect report editing endpoint

### Medium-term (Week 4+) - Enhancements
7. ✅ Add comment edit/delete functionality
8. ✅ Implement token refresh logic
9. ✅ Add public profile pages
10. ✅ Enhance map with clusters and stats

### Long-term (Month 2+)
11. ✅ Implement analytics endpoint (when ready)
12. ✅ Create image upload endpoint

---

## 📝 **Notes**

- Admin dashboard is now functional with 4 out of 7 needed endpoints implemented
- Frontend gracefully handles missing endpoints with fallbacks (empty arrays, mock data)
- All critical admin report management features are working
- Dashboard and Analytics pages currently use mock data but are ready for real endpoints
