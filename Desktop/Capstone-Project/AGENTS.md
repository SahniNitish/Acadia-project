# Acadia Safe - Campus Safety Application

## Project Overview

Acadia Safe is a comprehensive campus safety monitoring system built for Acadia University. The project consists of two applications:

**Applications:**
- **Dashboard/** - Admin web dashboard for security staff to monitor alerts, manage incidents, and coordinate responses (React 19)
- **User-App/** - Student-facing mobile app for reporting incidents, requesting escorts, shuttle booking, and receiving alerts (React Native + Expo)

> **Note:** The User-App backend (FastAPI + MongoDB) has been removed. Both apps now read/write directly to Firebase Firestore (`acadia-campus-hub`). No backends to start.

---

## Technology Stack

### Dashboard Frontend
- **Framework:** React 19 (Create React App)
- **Build Tool:** CRACO
- **Styling:** Tailwind CSS 3.4
- **UI Components:** shadcn/ui (Radix UI primitives)
- **State Management:** React Context API
- **Routing:** React Router DOM v7
- **Icons:** Lucide React
- **Charts:** Recharts
- **Notifications:** Sonner (toast)
- **Database:** Firebase Firestore (direct — no backend)
- **Auth:** Firebase Auth

### User-App (Mobile)
- **Framework:** React Native 0.81.5 + Expo 54
- **Language:** TypeScript
- **Navigation:** Expo Router v6 (Stack + Tabs + Modals)
- **Auth:** Firebase Auth only (no backend JWT)
- **Database:** Firebase Firestore (direct)
- **Storage:** Firebase Storage (incident photos)
- **Maps:** react-native-maps (Apple Maps on iOS, web-safe fallback)
- **Location:** expo-location
- **Haptics:** expo-haptics (SOS beep feedback)
- **Address search:** Nominatim/OpenStreetMap (free, no API key)

---

## Firebase Project

Both apps use the **same** Firebase project: `acadia-campus-hub`

```
apiKey: "AIzaSyDt5YlJ_ZgO0aswJXTtCqBJelwLDQfbc2A"
authDomain: "acadia-campus-hub.firebaseapp.com"
projectId: "acadia-campus-hub"
storageBucket: "acadia-campus-hub.firebasestorage.app"
messagingSenderId: "178102066314"
appId: "1:178102066314:web:bd5fa015f3a0a86ec7a173"
```

---

## Project Structure

```
Capstone-Project/
├── session.md                          # AI session log (read this first!)
├── AGENTS.md                           # This file — architecture reference
│
├── Dashboard/                          # Admin web dashboard
│   └── frontend/
│       └── src/
│           ├── pages/                  # 10 pages
│           │   ├── LoginPage.jsx
│           │   ├── DashboardPage.jsx
│           │   ├── AlertsPage.jsx      # SOS alerts + Web Audio beep + browser notifications
│           │   ├── IncidentsPage.jsx   # Incident reports + photo gallery
│           │   ├── EscortsPage.jsx     # Safety escort management
│           │   ├── ShuttlesPage.jsx    # Shuttle booking management (new)
│           │   ├── BroadcastPage.jsx   # Send campus alerts
│           │   ├── AnalyticsPage.jsx
│           │   ├── UsersPage.jsx
│           │   └── SettingsPage.jsx
│           ├── components/
│           │   ├── ui/                 # shadcn/ui components
│           │   └── layout/             # Sidebar, Header, DashboardLayout
│           ├── lib/
│           │   ├── firebase.js         # Firebase init (acadia-campus-hub)
│           │   └── AuthContext.js      # Staff auth
│           └── App.js                  # Routes (10 pages)
│
└── User-App/
    └── frontend/
        ├── app/                        # Expo Router screens
        │   ├── index.tsx               # Splash / auth redirect
        │   ├── login.tsx
        │   ├── signup.tsx
        │   ├── sos.tsx                 # SOS + haptic beeps + X button
        │   ├── incident-report.tsx     # Photos → Firebase Storage
        │   ├── escort-request.tsx      # Firestore + real-time onSnapshot
        │   ├── shuttle.tsx             # NEW: shuttle booking (Nominatim autocomplete)
        │   ├── emergency-contacts.tsx
        │   ├── my-reports.tsx          # Reads incidents from Firestore
        │   ├── safety-tips.tsx
        │   ├── about.tsx
        │   └── (tabs)/
        │       ├── index.tsx           # Home: SOS + quick actions (Escort, Report, Shuttle, Map)
        │       ├── alerts.tsx          # Reads broadcasts from Firestore
        │       ├── map.tsx             # Campus map (redesigned UI)
        │       ├── profile.tsx         # Firestore profile persistence
        │       └── _layout.tsx         # Tab bar (4 tabs)
        └── src/
            ├── components/
            │   ├── CampusMap.tsx       # Reusable map (web-safe, Apple Maps on iOS)
            │   ├── Button.tsx
            │   ├── Input.tsx
            │   ├── Card.tsx
            │   └── LoadingSpinner.tsx
            ├── constants/theme.ts      # COLORS, SPACING, FONT_SIZE, SHADOWS, etc.
            ├── context/AuthContext.tsx # Firebase-only auth; user fields in camelCase
            ├── firebase/config.ts      # exports: auth, db, storage, app
            └── services/firestore.ts  # All Firestore/Storage operations
```

---

## Firestore Collections

All collections are in the `acadia-campus-hub` project.

| Collection | Writer | Reader | Key Fields |
|------------|--------|--------|------------|
| `alerts` | User-App | Dashboard | `studentName`, `studentEmail`, `studentPhone`, `latitude`, `longitude`, `location`, `alertType`, `status: 'new'|'resolved'`, `createdAt`, `userId` |
| `incidents` | User-App | Dashboard | `type`, `location`, `latitude`, `longitude`, `description`, `reporterName`, `reporterEmail`, `anonymous`, `photos: [urls]`, `status: 'new'`, `createdAt`, `userId` |
| `escorts` | User-App | Dashboard | `studentName`, `studentEmail`, `pickup`, `destination`, `status: 'pending'→'in_progress'→'completed'`, `assignedToName`, `estimatedWait`, `createdAt`, `userId` |
| `shuttles` | User-App | Dashboard | `studentName`, `studentEmail`, `pickup`, `destination`, `status: 'pending'→'in_progress'→'completed'`, `assignedToName`, `estimatedWait: 15`, `createdAt`, `userId` |
| `broadcasts` | Dashboard | User-App | `type` (NOT `alert_type`), `title`, `message`, `targetAudience`, `status`, `createdAt` |
| `users/{uid}` | User-App | User-App | `fullName`, `email`, `phone`, `profilePhoto` (base64), `emergencyContactName`, `emergencyContactPhone`, `createdAt` |
| `users/{uid}/contacts/{id}` | User-App | User-App | `name`, `phone`, `relationship`, `createdAt` |

### Firebase Storage
- Incident photos: `incidents/{uid}/{timestamp}_{index}.jpg` → download URL stored in `incidents.photos[]`

---

## Key Implementation Notes

### User-App Auth Flow
1. `onAuthStateChanged` → `getUserProfile(uid)` → `setUser` (camelCase)
2. Signup: `createUserWithEmailAndPassword` → `updateProfile` → `createUserProfile` in Firestore
3. Login: `signInWithEmailAndPassword` → `getUserProfile` → `setUser`
4. No backend JWT, no AsyncStorage token — pure Firebase

### Field Name Conventions
- User profile: **camelCase** (`fullName`, `profilePhoto`, `emergencyContactName`, `emergencyContactPhone`)
- `broadcasts.type`: `'information'`, `'all_clear'`, `'emergency'`, `'advisory'` — map `information`/`all_clear` → `'info'` for `ALERT_TYPES` theme key
- Escort/Shuttle assigned state: `status === 'in_progress'` (NOT `'assigned'`)

### Dashboard Alerts (SOS sound)
- `AudioContext` generates 3× 880Hz beeps via Web Audio API (no sound file)
- `Notification` API for OS-level browser notifications
- Guard: `snapshot.metadata.fromCache` prevents sound on page load

### Nominatim Address Search (Shuttle screen)
- URL: `https://nominatim.openstreetmap.org/search?q=...&format=json&limit=5&countrycodes=ca`
- 500ms debounce, min 3 chars
- Required header: `User-Agent: AcadiaSafe/1.0 (campus safety app)`

---

## Dev Commands

```bash
# Dashboard
cd Dashboard/frontend && npm start           # http://localhost:3000

# User-App
cd User-App/frontend && npx expo start       # http://localhost:8081 or scan QR in Expo Go
```

---

## Design System (User-App)

From `src/constants/theme.ts`:
- **Primary:** `#1a365d` (navy)
- **Accent:** `#e53e3e` (red — SOS)
- **Secondary:** `#38a169` (green — safe/success)
- **Background:** `#f7fafc`
- **Campus center:** `45.0875, -64.3665` (Acadia University, Wolfville NS)

---

## TODO / Known Issues

| Priority | Item |
|----------|------|
| High | Update Firestore Security Rules in Firebase Console (currently `allow read, write: if request.auth != null`) |
| High | Update Firebase Storage rules: `allow write: if request.auth != null` for `incidents/{uid}/**` |
| Medium | Push notifications (Expo Notifications not installed) |
| Medium | Move Firebase config keys to `.env` / `app.json` extra |
| Low | `zustand` in package.json but never used |
| Low | Dashboard "Forgot Password" button has no onClick |
