# Acadia Safe Dashboard - PRD

## Project Overview
**Name:** Acadia Safe Dashboard  
**Type:** Security Monitoring Admin Dashboard  
**Date:** February 28, 2026  

## Original Problem Statement
Build a web-based admin dashboard called "Acadia Safe Dashboard" for Acadia University Security personnel. Professional security monitoring dashboard with real-time data displays, smooth animations, and excellent data visualization.

## User Personas
1. **Security Officers** - Monitor and respond to alerts, handle escorts
2. **Security Supervisors** - All officer permissions + broadcast alerts, manage officers
3. **Campus Administrators** - Full access including user management and settings

## Core Requirements
- Monitor live SOS emergency alerts in real-time
- Manage and respond to incidents
- Handle safety escort requests
- Broadcast emergency alerts to all app users
- View analytics and reports
- Manage registered users

## Technology Stack
- **Frontend:** React.js with Tailwind CSS, Shadcn UI
- **Backend:** FastAPI with MongoDB
- **Authentication:** Firebase Auth (email/password)
- **Database:** Firebase Firestore (real-time data)
- **Maps:** Leaflet with OpenStreetMap
- **Charts:** Recharts
- **Styling:** Custom design system (Navy theme)

## What's Been Implemented ✅

### Phase 1 - Core Infrastructure (Feb 28, 2026)
- [x] Firebase Authentication setup
- [x] Firebase Firestore integration
- [x] Protected routes
- [x] Custom design system (Navy theme)
- [x] Responsive layout with sidebar/header

### Phase 2 - Pages & Features (Feb 28, 2026)
- [x] **Login Page** - Split-screen design, registration support
- [x] **Dashboard** - Stats cards, live alerts, campus map, quick actions
- [x] **Alerts Page** - Card/list views, filtering, status management
- [x] **Incidents Page** - Table view, search, CRUD operations
- [x] **Escorts Page** - Kanban board, list view, status management
- [x] **Broadcast Page** - Templates, compose form, history
- [x] **Analytics Page** - Line, pie, bar, area charts with Recharts
- [x] **Users Page** - App users and staff management
- [x] **Settings Page** - General, notifications, security, integrations, appearance

### Phase 3 - Backend API (Feb 28, 2026)
- [x] FastAPI backend with CRUD endpoints
- [x] MongoDB collections setup
- [x] Demo data seeding endpoint
- [x] CORS configuration

## P0 Features (MVP - Completed)
- ✅ User authentication (login/register)
- ✅ Dashboard with real-time stats
- ✅ Alert management (view, respond, resolve)
- ✅ Incident reporting
- ✅ Escort request management
- ✅ Campus map integration

## P1 Features (Next Phase)
- [ ] Real-time push notifications (FCM)
- [ ] Sound alerts for emergencies
- [ ] Bulk operations on alerts/incidents
- [ ] Export reports to PDF/CSV
- [ ] Officer location tracking on map
- [ ] Audit logging for all actions

## P2 Features (Future)
- [ ] Mobile-responsive improvements
- [ ] Dark mode theme
- [ ] SMS/Email notifications
- [ ] Scheduled broadcasts
- [ ] Advanced analytics with heatmaps
- [ ] Integration with campus systems

## Backend API Endpoints
- `GET /api/` - Health check
- `GET /api/health` - API status
- `GET/POST /api/alerts` - Alert management
- `GET/POST /api/incidents` - Incident management
- `GET/POST /api/escorts` - Escort management
- `GET /api/users` - User list
- `GET /api/staff` - Staff list
- `GET/POST /api/broadcasts` - Broadcast management
- `POST /api/seed-demo-data` - Demo data seeding

## Firebase Collections
- `users` - App users (students)
- `staff` - Security personnel
- `alerts` - SOS alerts
- `incidents` - Incident reports
- `escorts` - SafeWalk requests
- `broadcasts` - Sent alerts
- `settings` - Dashboard config (future)
- `auditLog` - Action tracking (future)

## Design System
- **Primary:** Navy (#0d1b2a, #1b263b)
- **Background:** Light (#f7fafc)
- **Surface:** White (#ffffff)
- **Status Colors:**
  - Danger: #e53e3e
  - Safe: #38a169
  - Warning: #ecc94b
  - Info: #3182ce
- **Typography:** Inter (UI), JetBrains Mono (data)

## Testing Status
- ✅ All 11 backend API endpoints working
- ✅ Login/registration flow verified
- ✅ All 9 pages render correctly
- ✅ Navigation and routing functional
- ✅ Firebase integration working

## Next Tasks
1. Implement FCM push notifications for real-time alerts
2. Add sound notifications for emergency alerts
3. Implement export functionality (PDF/CSV)
4. Add audit logging for all user actions
5. Implement role-based permissions UI
