# Product Requirements Document (PRD)
## CleanLink - Civic Reporting Platform

**Version:** 1.0  
**Last Updated:** 2024  
**Status:** Active Development

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Overview](#product-overview)
3. [User Personas](#user-personas)
4. [Core Features](#core-features)
5. [AI Analysis System](#ai-analysis-system)
6. [Points & Rewards System](#points--rewards-system)
7. [Admin System](#admin-system)
8. [Technical Architecture](#technical-architecture)
9. [User Flows](#user-flows)
10. [Success Metrics](#success-metrics)

---

## Executive Summary

**CleanLink** is a civic reporting platform that empowers citizens to report local issues (primarily garbage and waste management problems) in their communities. The platform uses AI-powered analysis to validate reports, gamifies civic engagement through a points system, and provides administrative tools for government officials to manage and resolve issues efficiently.

### Key Value Propositions

- **For Citizens**: Easy-to-use platform to report issues, earn rewards, and make their communities cleaner
- **For Government**: Streamlined workflow to receive, validate, prioritize, and resolve civic issues
- **For Communities**: Transparent, gamified system that encourages civic participation

---

## Product Overview

### Vision Statement
To create a seamless connection between citizens and local government, making civic issue reporting accessible, rewarding, and effective.

### Mission
Enable citizens to report civic issues effortlessly while providing government administrators with intelligent tools to prioritize and resolve problems efficiently.

### Target Market
- **Primary**: Citizens in Indian cities who want to report garbage and waste management issues
- **Secondary**: Municipal Corporation Departments (MCD) and local government administrators
- **Tertiary**: Community organizations and environmental groups

---

## User Personas

### 1. Citizen Reporter (Primary User)
- **Age**: 25-45
- **Tech Savviness**: Moderate to High
- **Motivation**: Wants to improve their neighborhood, earn rewards
- **Pain Points**: 
  - Difficulty finding the right channel to report issues
  - Lack of feedback on reported issues
  - No incentive to report problems

### 2. Field Admin (Government Official)
- **Role**: Municipal Corporation field worker
- **Responsibilities**: Review assigned reports, update progress, submit for approval
- **Pain Points**: 
  - Too many reports to manually review
  - Difficulty prioritizing urgent issues
  - Need to track work completion

### 3. Super Admin (Government Manager)
- **Role**: Municipal Corporation supervisor/manager
- **Responsibilities**: Oversee all reports, assign work, approve completed tasks, manage users
- **Pain Points**: 
  - Need visibility into all civic issues
  - Must ensure quality of work
  - Need analytics to make data-driven decisions

---

## Core Features

### 1. Report Creation & Management

#### Report Submission
- **Title**: Brief description of the issue
- **Description**: Detailed information about the problem
- **Category**: Classification (garbage, waste, etc.)
- **Location**: GPS coordinates and address
- **Images**: Multiple photo uploads to document the issue
- **Status Tracking**: Real-time status updates (pending → community_verified → in_progress → resolved)

#### Report Discovery
- **Feed View**: Chronological list of all reports
- **Map View**: Geographic visualization of issues
- **Filtering**: By category, status, location, date
- **Search**: Text-based search across titles and descriptions

### 2. Community Engagement

#### Voting System
- Users can upvote reports to show support
- Upvotes contribute to community engagement score
- Helps prioritize popular issues

#### Comments
- Users can comment on reports
- Enables discussion and additional context
- Comments contribute to engagement metrics

#### Report Details
- Full report information with images
- AI analysis results (legitimacy, severity)
- Community engagement metrics
- Resolution status and updates

### 3. User Profile & Authentication

#### User Accounts
- Sign up / Login functionality
- Profile management
- Civic Points balance
- Report history
- Achievement tracking

#### Guest Mode
- Browse reports without account
- Cannot create reports or earn points

### 4. Onboarding
- First-time user tutorial
- Region selection
- Feature introduction

---

## AI Analysis System

### Overview
CleanLink uses an AI-powered analysis system to automatically evaluate civic reports for legitimacy, severity, and potential duplicates. This system helps prioritize genuine issues and filter out spam or low-quality reports.

### AI Service Provider
- **Service**: OpenRouter API
- **Model**: `allenai/molmo-2-8b:free` (Free tier model)
- **Endpoint**: `https://openrouter.ai/api/v1/chat/completions`

### AI Analysis Criteria

The AI analyzes each report and returns a JSON response with the following metrics:

#### 1. Legitimacy Score (`legit`)
- **Range**: 0.0 to 1.0 (probability)
- **Definition**: Probability that the report is a genuine civic issue
- **Evaluation Factors**:
  - Description authenticity (does it sound genuine?)
  - Common issue patterns (is this a typical civic problem?)
  - Red flags for fake reports (spam indicators, suspicious patterns)
  - Image relevance (if provided)
  - Location validity

**Scoring Guidelines**:
- **0.0 - 0.3**: Likely fake/spam → Report status: `flagged`
- **0.3 - 0.7**: Uncertain → Report status: `pending`
- **0.7 - 1.0**: Likely genuine → Report status: `community_verified`

#### 2. Severity Score (`severity`)
- **Range**: 0.0 to 1.0
- **Definition**: How serious and urgent the issue is
- **Evaluation Factors**:
  - Health and safety implications
  - Environmental impact
  - Scale of the problem (individual vs. community-wide)
  - Urgency indicators in description
  - Category-based severity (some categories are inherently more urgent)

**Severity Levels**:
- **0.0 - 0.3**: Low severity (minor inconvenience)
- **0.3 - 0.6**: Medium severity (moderate issue)
- **0.6 - 0.8**: High severity (significant problem)
- **0.8 - 1.0**: Critical severity (urgent health/safety issue)

#### 3. Duplicate Probability (`duplicate_prob`)
- **Range**: 0.0 to 1.0
- **Definition**: Probability that this report duplicates an existing report
- **Evaluation Factors**:
  - Location proximity to existing reports
  - Similarity in description
  - Time proximity to similar reports
  - Category matching

**Duplicate Detection**:
- If `duplicate_prob > 0.7`, the system may flag the report as a potential duplicate
- Includes `duplicate_of` field if a duplicate is identified

#### 4. Insights Array (`insights`)
- **Type**: Array of strings
- **Definition**: Key insights and tags about the report
- **Examples**:
  - `"genuine_report"`
  - `"medium_urgency"`
  - `"high_severity"`
  - `"community_impact"`
  - `"health_hazard"`
  - `"environmental_concern"`
  - `"duplicate_detected"`
  - `"ai_service_unavailable"` (fallback)

### AI Analysis Prompt

The system sends the following prompt to the AI:

```
Analyze this civic report and provide a JSON response with:

1. legit: probability this is a real garbage report (0-1)
2. severity: how serious the issue is (0-1)  
3. duplicate_prob: probability this is duplicate (0-1)
4. insights: array of key insights

Report Details:
- Title: [report title]
- Description: [report description]
- Category: [report category]
- Images: [number] images provided
- Location: [location data]

Consider:
- Does the description sound genuine?
- Is this a common issue in civic reporting?
- Are there red flags for fake reports?
- How urgent does this seem?

Respond ONLY with valid JSON, no other text.
Example: {"legit": 0.8, "severity": 0.7, "duplicate_prob": 0.1, "insights": ["genuine_report", "medium_urgency"]}
```

### AI Processing Workflow

1. **Report Submission**: User creates a report
2. **Queue Processing**: Report is added to AI processing queue
3. **AI Analysis**: 
   - System prepares report data (title, description, category, images, location)
   - Sends request to OpenRouter API
   - Receives JSON response with analysis
4. **Result Processing**:
   - Parses AI response
   - Validates JSON structure
   - Handles errors gracefully
5. **Status Assignment**:
   - Based on `legit` score:
     - `legit > 0.7` → `community_verified`
     - `legit < 0.3` → `flagged`
     - Otherwise → `pending`
6. **Database Update**: AI scores stored in `ai_score` JSON field

### Error Handling & Fallbacks

#### API Failures
- **401 Unauthorized**: Invalid API key → Returns fallback with `success: false`
- **429 Rate Limit**: Too many requests → Logs error, retries later
- **Network Errors**: No response → Returns fallback, doesn't save fake data
- **Parse Errors**: Invalid JSON response → Returns fallback with default values

#### Fallback Behavior
When AI analysis fails, the system:
- Returns default values: `legit: 0.5`, `severity: 0.5`, `duplicate_prob: 0`
- Sets `insights: ['ai_service_unavailable']`
- Sets `success: false` flag
- **Does NOT save fake data to database** (prevents corruption)
- Logs error for debugging

### AI Worker System

- **Background Processing**: AI analysis runs asynchronously via worker
- **Retry Logic**: Database queries retry up to 3 times with 1-second delays
- **Queue Management**: Reports processed in order of submission
- **Status Tracking**: Processing status visible in admin dashboard

---

## Points & Rewards System

### Civic Points Overview

Users earn **Civic Points** for contributing to the platform. Points are calculated based on multiple factors and can be redeemed for eco-friendly rewards.

### Points Calculation Formula

Total Points = Base Points + AI Bonus + Severity Bonus + Engagement Bonus + Resolution Bonus

#### 1. Base Points
- **Amount**: 30 points (fixed)
- **Earned**: Automatically when a report is created
- **Purpose**: Incentivize report creation

#### 2. AI Confidence Bonus
- **Range**: 0-20 points
- **Formula**: `Math.floor(aiScore.legit * 20)`
- **Calculation**: 
  - If `legit = 1.0` → 20 points
  - If `legit = 0.5` → 10 points
  - If `legit = 0.0` → 0 points
- **Purpose**: Reward high-quality, legitimate reports

#### 3. Severity Bonus
- **Range**: 0-15 points
- **Formula**: `Math.floor(aiScore.severity * 15)`
- **Calculation**:
  - If `severity = 1.0` → 15 points
  - If `severity = 0.5` → 7 points
  - If `severity = 0.0` → 0 points
- **Purpose**: Reward reporting of serious issues

#### 4. Community Engagement Bonus
- **Range**: 0-25 points (capped at 25)
- **Formula**: `Math.min((upvotes * 2) + comments, 25)`
- **Calculation**:
  - Each upvote = 2 points
  - Each comment = 1 point
  - Maximum 25 points total
  - Examples:
    - 10 upvotes + 5 comments = 25 points (capped)
    - 5 upvotes + 3 comments = 13 points
- **Purpose**: Encourage community interaction and validation

#### 5. Resolution Bonus
- **Amount**: 30 points (fixed)
- **Earned**: When MCD (Municipal Corporation Department) takes action on the report
- **Purpose**: Reward reports that lead to actual resolution

### Points Breakdown Example

**Scenario**: User creates a report that:
- Has AI legitimacy score of 0.85
- Has severity score of 0.70
- Receives 8 upvotes and 3 comments
- Gets resolved by MCD

**Calculation**:
- Base Points: 30
- AI Bonus: `floor(0.85 * 20)` = 17 points
- Severity Bonus: `floor(0.70 * 15)` = 10 points
- Engagement: `min((8 * 2) + 3, 25)` = `min(19, 25)` = 19 points
- Resolution: 30 points
- **Total**: 30 + 17 + 10 + 19 + 30 = **106 Civic Points**

### Points Display

Users can view:
- Total Civic Points balance
- Points breakdown per report
- Points history
- Leaderboard (future feature)

### Rewards System (Future)

- Points can be redeemed for eco-friendly rewards
- Reward categories: Tree planting, community cleanup events, merchandise
- Admin can manage rewards catalog

---

## Admin System

### Role-Based Access Control

The platform supports three admin roles with different permissions:

#### 1. Super Admin (`superadmin`)
**Full System Access**
- View all reports and analytics
- Manage admin users (create, edit, delete)
- Approve/reject completed work from field admins
- Assign reports to field admins
- Access full dashboard with system-wide statistics
- View audit logs
- Manage rewards catalog

**Routes**:
- `/admin` - Dashboard
- `/admin/reports` - All reports
- `/admin/pending-approvals` - Pending approvals
- `/admin/users` - User management
- `/admin/analytics` - Analytics

#### 2. Field Admin (`admin`)
**Limited Access - Assigned Reports Only**
- View only reports assigned to them ("My Reports")
- Update progress on assigned reports
- Submit completed work for approval
- Limited dashboard with personal statistics
- Cannot view other admins' reports

**Routes**:
- `/admin` - Personal dashboard
- `/admin/my-reports` - Assigned reports only

#### 3. Viewer (`viewer`)
**Read-Only Access**
- View all reports and analytics
- Cannot modify anything
- Cannot assign or approve reports
- View-only dashboard

**Routes**:
- `/admin` - View-only dashboard
- `/admin/reports` - View reports (read-only)

### Admin Features

#### Report Management
- **Filtering**: By status, category, date, location, assigned admin
- **Search**: Text search across reports
- **Bulk Operations**: Assign multiple reports (super admin)
- **Status Updates**: Change report status manually
- **AI Score Display**: View AI analysis results

#### Assignment Workflow
1. Super admin reviews reports
2. Assigns reports to field admins
3. Field admin receives notification
4. Field admin updates progress
5. Field admin submits for approval
6. Super admin reviews and approves/rejects

#### Analytics Dashboard
- Total reports by status
- Reports by category
- AI legitimacy distribution
- Severity distribution
- Resolution rate
- Average resolution time
- Top reporters
- Geographic heatmap

#### Audit Logging
- Track all admin actions
- User assignment history
- Status change history
- Approval/rejection history
- Timestamp and user information

---

## Technical Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn-ui components
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (primary), SQLite (fallback)
- **Authentication**: JWT tokens
- **File Storage**: Local filesystem (images)
- **Queue System**: Redis (for AI processing)

### AI Integration
- **Service**: OpenRouter API
- **Model**: `allenai/molmo-2-8b:free`
- **Processing**: Background worker with queue
- **Error Handling**: Graceful fallbacks, no fake data storage

### Key Services

#### AIService (`aiService.ts`)
- Handles communication with OpenRouter API
- Creates analysis prompts
- Parses AI responses
- Manages error handling

#### Points Calculator (`pointsCalculator.ts`)
- Calculates Civic Points based on multiple factors
- Returns detailed breakdown
- Handles edge cases (missing data)

#### AI Worker (`aiWorker.ts`)
- Background processing of reports
- Retry logic for database operations
- Status updates
- Error logging

### Database Schema

#### Reports Table
- `id`: UUID
- `title`: String
- `description`: Text
- `category`: String
- `location`: JSON (coordinates, address)
- `images`: JSON array (image URLs)
- `status`: Enum (pending, community_verified, flagged, in_progress, resolved)
- `ai_score`: JSON (legit, severity, duplicate_prob, insights)
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `user_id`: Foreign key

#### Users Table
- `id`: UUID
- `username`: String
- `email`: String
- `civic_points`: Integer
- `role`: Enum (user, admin, superadmin, viewer)
- `region`: String

#### Comments Table
- `id`: UUID
- `report_id`: Foreign key
- `user_id`: Foreign key
- `content`: Text
- `created_at`: Timestamp

#### Votes Table
- `id`: UUID
- `report_id`: Foreign key
- `user_id`: Foreign key
- `vote_type`: Enum (upvote, downvote)
- `created_at`: Timestamp

---

## User Flows

### Flow 1: Citizen Reports an Issue

1. User logs in (or continues as guest)
2. Navigates to "Create Report"
3. Fills in report form:
   - Title
   - Description
   - Category selection
   - Location (GPS or manual)
   - Upload images
4. Submits report
5. System creates report with status `pending`
6. Report added to AI processing queue
7. AI analyzes report (background)
8. AI results update report:
   - Status changes based on `legit` score
   - AI scores stored
9. User receives notification (if enabled)
10. User can view report in their profile
11. Points calculated when report is created
12. Additional points added as:
    - AI analysis completes
    - Community engages (upvotes/comments)
    - Report gets resolved

### Flow 2: AI Analysis Process

1. Report created with status `pending`
2. AI worker picks up report from queue
3. Worker fetches report data from database
4. Prepares data for AI analysis
5. Calls AIService.analyzeReport()
6. AIService sends request to OpenRouter API
7. Receives JSON response
8. Parses response
9. Updates report:
   - Sets `ai_score` JSON field
   - Updates status based on `legit`:
     - `> 0.7` → `community_verified`
     - `< 0.3` → `flagged`
     - Otherwise → `pending`
10. Logs success or error

### Flow 3: Admin Workflow (Super Admin)

1. Super admin logs into admin dashboard
2. Views dashboard with system statistics
3. Navigates to "All Reports"
4. Filters/searches reports
5. Reviews AI scores and legitimacy
6. Assigns reports to field admins
7. Field admins receive notifications
8. Monitors progress in "Pending Approvals"
9. Reviews completed work
10. Approves or rejects submissions
11. Updates report status to `resolved` if approved

### Flow 4: Admin Workflow (Field Admin)

1. Field admin logs into admin dashboard
2. Views "My Reports" (assigned reports only)
3. Reviews assigned reports
4. Updates progress status
5. Adds notes/photos
6. Submits work for approval
7. Super admin reviews
8. Receives approval/rejection notification

### Flow 5: Community Engagement

1. User browses reports feed
2. Views report details
3. Reads description and views images
4. Upvotes report (if logged in)
5. Adds comment with additional context
6. Engagement metrics update:
   - Upvote count increases
   - Comment count increases
7. Reporter's engagement bonus points recalculated
8. Report visibility may increase (popular reports)

---

## Success Metrics

### User Engagement Metrics
- **Daily Active Users (DAU)**
- **Monthly Active Users (MAU)**
- **Reports Created per Day**
- **Average Reports per User**
- **Community Engagement Rate** (upvotes + comments per report)

### AI System Metrics
- **AI Analysis Success Rate** (successful vs. failed analyses)
- **Average AI Processing Time**
- **Legitimacy Score Distribution**
- **False Positive Rate** (flagged legitimate reports)
- **False Negative Rate** (missed fake reports)

### Points System Metrics
- **Average Points per Report**
- **Points Distribution** (by component: base, AI, severity, engagement, resolution)
- **User Retention** (users who continue reporting after first report)
- **Reward Redemption Rate** (when implemented)

### Resolution Metrics
- **Report Resolution Rate** (resolved / total reports)
- **Average Resolution Time**
- **Resolution by Category**
- **MCD Action Rate** (reports that receive MCD attention)

### Platform Health Metrics
- **API Response Times**
- **Error Rates**
- **Database Query Performance**
- **Image Upload Success Rate**
- **Authentication Success Rate**

---

## Future Enhancements

### Phase 2 Features
- Push notifications for report updates
- In-app messaging between users and admins
- Advanced analytics dashboard
- Report editing by users
- Comment editing/deletion
- Public user profiles
- Leaderboards

### Phase 3 Features
- Mobile apps (iOS/Android)
- Offline mode for report creation
- Multi-language support
- Integration with government systems
- Automated MCD notifications
- Reward redemption system
- Community challenges/events

### Phase 4 Features
- Machine learning model training on historical data
- Predictive analytics for issue hotspots
- Automated duplicate detection improvements
- Image recognition for automatic categorization
- Voice report submission
- AR features for location tagging

---

## Appendix: AI Scoring Examples

### Example 1: High-Quality Report

**Report Data**:
- Title: "Large garbage pile blocking road near school"
- Description: "There's a massive pile of garbage that has been accumulating for 2 weeks. It's blocking half the road near ABC School, causing traffic issues and health concerns. Smell is very strong."
- Category: "Garbage"
- Images: 3 photos showing the pile
- Location: Valid coordinates near school

**AI Analysis**:
```json
{
  "legit": 0.92,
  "severity": 0.85,
  "duplicate_prob": 0.05,
  "insights": ["genuine_report", "high_severity", "health_hazard", "traffic_impact"]
}
```

**Status**: `community_verified` (legit > 0.7)

**Points Calculation**:
- Base: 30
- AI Bonus: `floor(0.92 * 20)` = 18
- Severity: `floor(0.85 * 15)` = 12
- Engagement: (assume 15 upvotes, 5 comments) = `min(35, 25)` = 25
- Resolution: 30
- **Total**: 115 points

### Example 2: Low-Quality/Spam Report

**Report Data**:
- Title: "test"
- Description: "asdfghjkl"
- Category: "Garbage"
- Images: 0
- Location: Invalid/random coordinates

**AI Analysis**:
```json
{
  "legit": 0.15,
  "severity": 0.20,
  "duplicate_prob": 0.10,
  "insights": ["suspicious_content", "low_quality", "test_report"]
}
```

**Status**: `flagged` (legit < 0.3)

**Points Calculation**:
- Base: 30
- AI Bonus: `floor(0.15 * 20)` = 3
- Severity: `floor(0.20 * 15)` = 3
- Engagement: 0 (no engagement)
- Resolution: 0 (not resolved)
- **Total**: 36 points (but report is flagged, may not be eligible)

### Example 3: Medium-Quality Report

**Report Data**:
- Title: "Some trash on the street"
- Description: "There's some garbage near my house"
- Category: "Garbage"
- Images: 1 photo
- Location: Valid coordinates

**AI Analysis**:
```json
{
  "legit": 0.65,
  "severity": 0.45,
  "duplicate_prob": 0.20,
  "insights": ["genuine_report", "medium_urgency", "minor_issue"]
}
```

**Status**: `pending` (0.3 < legit < 0.7)

**Points Calculation**:
- Base: 30
- AI Bonus: `floor(0.65 * 20)` = 13
- Severity: `floor(0.45 * 15)` = 6
- Engagement: (assume 3 upvotes, 1 comment) = `min(7, 25)` = 7
- Resolution: 0 (not resolved yet)
- **Total**: 56 points

---

## Conclusion

This PRD outlines the comprehensive system for CleanLink, a civic reporting platform that combines community engagement, AI-powered validation, gamification through points, and administrative tools to create an effective solution for civic issue reporting and resolution.

The AI workaround system provides intelligent analysis of reports while gracefully handling failures, ensuring data integrity and system reliability. The points system incentivizes quality reporting and community engagement, creating a sustainable model for civic participation.

---

**Document Owner**: Product Team  
**Review Cycle**: Quarterly  
**Next Review Date**: [To be scheduled]
