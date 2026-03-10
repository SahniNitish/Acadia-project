# Acadia Safe — Session Log

> This file is for Claude (AI assistant) to read at the start of future sessions.
> It tracks what was done, what changed, and where we left off.

---

## Project Structure (Cleaned Up 2026-03-09)

There are **2 apps** in the project:

| App | Path | Tech | Who Uses It |
|-----|------|------|-------------|
| **Dashboard** | `Capstone-Project/Dashboard/` | React 19 (web) | Security staff |
| **User-App** | `Capstone-Project/User-App/` | React Native + Expo (TypeScript) | Students (mobile) |

> The old redundant web-copy `User-App/` was deleted. The React Native app (formerly `campus-safety-hub/`) was renamed to `User-App/`.

---

## User-App — Full Exploration (`User-App/frontend/`)

### Structure
```
campus-safety-hub/frontend/
├── app/                        # Expo Router screens
│   ├── index.tsx               # Splash / auth redirect
│   ├── login.tsx               # Login screen
│   ├── signup.tsx              # Sign up screen
│   ├── sos.tsx                 # SOS emergency screen
│   ├── incident-report.tsx     # Report an incident
│   ├── escort-request.tsx      # Request safe-walk escort
│   ├── friend-walk.tsx         # Friend walk feature
│   ├── emergency-contacts.tsx  # Emergency contacts
│   ├── _layout.tsx             # Root layout (AuthProvider, stack nav, modals)
│   └── (tabs)/                 # Bottom tab navigator
│       ├── index.tsx           # Home tab
│       ├── alerts.tsx          # View alerts tab
│       ├── map.tsx             # Campus map tab
│       ├── profile.tsx         # Profile tab
│       └── _layout.tsx         # Tab layout
├── src/
│   ├── components/             # Button, Input, Card, LoadingSpinner
│   ├── constants/theme.ts      # Colors, spacing, campus coords, emergency numbers
│   ├── context/AuthContext.tsx # Firebase auth + AsyncStorage token
│   ├── firebase/config.ts      # Firebase init (acadia-safety project)
│   └── services/api.ts         # Axios client for backend (port 8001)
├── app.json
└── package.json
└── tsconfig.json
```

---

## Dashboard Structure (`Capstone-Project/Dashboard/frontend/`)

```
Dashboard/frontend/src/
├── pages/          # 9 pages (LoginPage, DashboardPage, AlertsPage, etc.)
├── components/
│   ├── ui/         # shadcn/ui components
│   ├── layout/     # Sidebar, Header, DashboardLayout
│   └── dashboard/  # CampusMap, etc.
├── lib/
│   ├── firebase.js     # Firebase init
│   ├── AuthContext.js  # Auth (staff → officer role)
│   └── utils.js
└── App.js
```

---

## Session: 2026-03-01 (2) — Dashboard ↔ Student App Bridge

### Goal
Connect the Student App campus backend to Firestore so:
- Student SOS → appears on Dashboard in real-time (no refresh)
- Dashboard broadcast → received by Student App on pull-to-refresh

### Files Changed
| File | What Changed |
|------|-------------|
| `Documents/campus-safety-hub/backend/server.py` | Added Firebase Admin SDK + updated 3 endpoints |
| `Documents/campus-safety-hub/backend/requirements.txt` | Added `firebase-admin==7.2.0` |
| `Documents/campus-safety-hub/backend/.env` | Added `FIREBASE_SERVICE_ACCOUNT_JSON=` placeholder |

### What Was Implemented
1. **`get_firestore_client()`** — lazy-init helper after `load_dotenv()`. Reads `FIREBASE_SERVICE_ACCOUNT_JSON` from env. Returns `None` gracefully if not set (bridge disabled, no crash).
2. **`POST /api/sos`** — after MongoDB save, mirrors alert to `Firestore alerts/{sos_id}` with Dashboard field schema (`studentName`, `studentEmail`, `studentPhone`, `location`, `latitude`, `longitude`, `status: "new"`, `createdAt`, `alertType`, `campusSosId`). Non-blocking — student gets success even if Firestore write fails.
3. **`PUT /api/sos/{id}/cancel`** — after MongoDB update, sets `status: "resolved"` + `resolvedByCampusApp: true` on the Firestore doc.
4. **`GET /api/alerts`** — reads from Firestore `broadcasts` collection first (Dashboard writes here). Maps `type` → `alert_type` (`information`/`all_clear` → `"info"`, `emergency` → `"emergency"`, `advisory` → `"advisory"`). Falls back to MongoDB `campus_alerts` if Firebase not configured or fails.

### Architecture
```
[Student App]
  POST /api/sos → Campus Backend :8001
                    ├─ MongoDB sos_alerts (existing)
                    └─ Firestore alerts/{id} (NEW) → Dashboard onSnapshot fires ✅

[Dashboard] writes to Firestore broadcasts →
  Campus Backend GET /api/alerts reads broadcasts → Student App ✅
```

### To Activate (friend must do this)
1. Firebase Console → `acadia-campus-hub` → Project Settings → Service Accounts → "Generate new private key"
2. Download JSON, flatten to single line: `cat key.json | tr -d '\n'`
3. Paste into `campus-safety-hub/backend/.env`: `FIREBASE_SERVICE_ACCOUNT_JSON={...}`
4. Restart backend — log shows `"Firebase Admin SDK initialized for Dashboard bridge"`

### Package Installed
`firebase-admin==7.2.0` installed to `/home/nitish/.local/share/mise/installs/python/3.13.2/`

---

## Session: 2026-03-01 — What Was Done

### 1. `User-App/frontend/src/lib/AuthContext.js` *(low priority — User-App is redundant)*

Changed Firestore collection `staff` → `users`, role `officer` → `student`. Not critical since User-App is being superseded by the React Native app.

### 2. `User-App/frontend/src/pages/LoginPage.jsx` *(low priority — User-App is redundant)*

Updated branding, copy, placeholders from security staff → student-facing. Same caveat as above.

### 3. `Dashboard/frontend/src/index.js` + `User-App/frontend/src/index.js`

**Problem 1 — AbortError red screen:**
Firebase Firestore WebChannel leaks `AbortError`s as unhandled promise rejections → CRA dev overlay shows red screen.

**Fix attempt 1 (failed):** `unhandledrejection` handler in `index.js` — too late, CRA's overlay listener registers first.

**Fix attempt 2 (✅):** Moved suppressor to `public/index.html` inline `<script>` — runs before bundle so our listener registers first. Uses `stopImmediatePropagation()` to block CRA's listener entirely.

```html
<script>
  window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && event.reason.name === 'AbortError') {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  });
</script>
```

**Problem 2 — `FIRESTORE INTERNAL ASSERTION FAILED: Unexpected state (ID: ca9) {"ve":-1}`:**
`React.StrictMode` double-invokes `useEffect` → Firebase `onSnapshot` registers twice → internal crash. Known Firebase SDK 12.x + React StrictMode incompatibility.

**Fix:** Removed `<React.StrictMode>` and unused `import React` from both `index.js` files.

### 4. Firebase Console (friend has login — project: `acadia-campus-hub`)

- **Security Rules** updated to `allow read, write: if request.auth != null`
- **Composite indexes** created:
  - `alerts`: `status` ASC + `createdAt` DESC ✅
  - `escorts`: `status` ASC + `createdAt` DESC ✅

---

## Current State

**Dashboard** (`localhost:3000`) — fully working, security staff web app
- Firebase Auth + Firestore connected
- All pages load with real-time data
- Firestore collection: `staff`, role: `officer`

**Student App** (`localhost:8081` via Expo) — React Native mobile app
- Started with `npx expo start` from `Documents/campus-safety-hub/frontend/`
- Has login, signup, SOS, incident report, escort request, friend walk, alerts, map, profile screens
- Needs exploration to understand current state and what still needs work

### Architecture
- **Firebase** — Auth only (`acadia-safety` project — ⚠️ DIFFERENT from Dashboard's `acadia-campus-hub`)
- **Backend API** — `localhost:8001` (not 8000) for all data (incidents, escorts, alerts, SOS, friend-walk)
- **Language** — TypeScript throughout
- **Navigation** — Expo Router v6 (Stack + Tabs + Modals)
- **State** — React Context for auth; Zustand installed but unused

### Key Dependencies
- React Native 0.81.5, Expo 54, Expo Router 6
- Firebase 12.9.0 (Auth only)
- Axios 1.13.5 (API calls)
- AsyncStorage (token persistence)
- expo-location, expo-image-picker
- date-fns (date formatting)
- ⚠️ No map library installed (react-native-maps / Mapbox missing)
- ⚠️ Expo Notifications not installed (push notifications not possible yet)

### Screen Status

| Screen | File | Status | Notes |
|--------|------|--------|-------|
| Splash | `app/index.tsx` | ✅ Done | Checks auth, seeds data, redirects |
| Login | `app/login.tsx` | ✅ Done | Firebase auth, domain validation, error handling |
| Signup | `app/signup.tsx` | ✅ Done | Full validation, @acadiau.ca enforced |
| SOS | `app/sos.tsx` | ✅ Done | Best screen — type select, countdown animation, location, API |
| Incident Report | `app/incident-report.tsx` | ✅ Done | Type, location, description, 3 photos, anonymous toggle |
| Emergency Contacts | `app/emergency-contacts.tsx` | ✅ Done | Hardcoded list, tap to call |
| Home tab | `app/(tabs)/index.tsx` | ✅ Done | SOS button, quick actions, latest alert, pull-to-refresh |
| Alerts tab | `app/(tabs)/alerts.tsx` | ✅ Done | List + detail modal, color-coded, pull-to-refresh |
| Escort Request | `app/escort-request.tsx` | ⚠️ Partial | Destination coords hardcoded; officer assignment faked (5-sec timer); call button non-functional |
| Friend Walk | `app/friend-walk.tsx` | ⚠️ Partial | Timer works; location NOT continuously updated; map is grey placeholder |
| Map tab | `app/(tabs)/map.tsx` | ⚠️ Partial | Filter chips + location list work; actual map is placeholder |
| Profile tab | `app/(tabs)/profile.tsx` | ⚠️ Partial | Edit name/phone works; settings toggles UI-only; My Reports / Safety Tips / About are stubs |

### Components (all fully implemented & styled)
- `Button.tsx` — variants: primary, secondary, danger, outline, text; loading state
- `Input.tsx` — label, error message, min 48px height
- `Card.tsx` — shadow wrapper
- `LoadingSpinner.tsx` — full-screen and inline variants

### Constants (`src/constants/theme.ts`)
- Colors: Primary `#1a365d`, Accent `#E53E3E`, Secondary `#38A169`
- Campus center: `45.0875, -64.3665` (Acadia University, Wolfville NS)
- Hardcoded emergency numbers: Security 902-585-1103, 911, Campus Health 902-585-1234, etc.
- Incident types: Suspicious Activity, Theft, Harassment, Property Damage, Safety Hazard, Other

### API Service (`src/services/api.ts`)
All endpoints on `localhost:8001/api`:
- Auth: signup, login, me, profile
- SOS: create, cancel, active
- Incidents: report, my-reports, detail
- Escorts: request, active, cancel, assign
- Friend Walk: start, active, update-location, extend, complete
- Alerts: list, detail
- Locations: list
- Seed: seed test data

---

## Known Issues & Bugs

### Critical
| Issue | File | Fix Needed |
|-------|------|------------|
| Firebase config hardcoded (not in .env) | `src/firebase/config.ts` | Move to `.env` / `app.json` extra |
| Uses different Firebase project (`acadia-safety`) than Dashboard (`acadia-campus-hub`) | `src/firebase/config.ts` | Decide: unify or keep separate |
| No real map library installed | `app/(tabs)/map.tsx` | Install `react-native-maps` or `expo-maps` |

### High Priority
| Issue | File |
|-------|------|
| Escort destination coords hardcoded to `(45.0880, -64.3670)` | `app/escort-request.tsx` |
| Officer assignment is mocked (fake 5-sec timer, not real API) | `app/escort-request.tsx` |
| Profile updates (phone, emergency contact) not persisted to backend | `app/(tabs)/profile.tsx` |
| Dual auth tokens: Firebase token + separate AsyncStorage `token` — inconsistent | `src/services/api.ts`, `src/context/AuthContext.tsx` |
| Location not continuously updated in Friend Walk | `app/friend-walk.tsx` |

### Medium Priority
| Issue | File |
|-------|------|
| Settings toggles (push notifications, location) are UI-only | `app/(tabs)/profile.tsx` |
| Push notifications not possible (Expo Notifications not installed) | — |
| My Reports / Safety Tips / About menu items are empty stubs | `app/(tabs)/profile.tsx` |
| Get Directions button non-functional | `app/(tabs)/map.tsx` |
| `zustand` installed but never used | `package.json` |

---

## What Still Needs to Be Done

### Student App (main focus)
1. **Real map** — install `react-native-maps` or `expo-maps`, replace placeholder in Map tab and Friend Walk
2. **Escort assignment** — connect to real backend polling instead of 5-sec mock timer
3. **Escort destination** — make destination dynamic (user types it, geocode it)
4. **Friend Walk location tracking** — call `updateLocation` API on interval
5. **Profile persistence** — save phone + emergency contact to backend on update
6. **Push notifications** — install `expo-notifications`, implement FCM
7. **Profile stubs** — implement My Reports, Safety Tips, About screens
8. **Settings toggles** — wire up notification + location toggles to actual permissions
9. **Firebase config** — move API keys to `.env`
10. **Unified auth** — resolve Firebase token vs. AsyncStorage token inconsistency
11. ✅ **Dashboard bridge** — DONE (SOS mirrors to Firestore; alerts read from Firestore broadcasts)

### Dashboard
1. **"Forgot Password"** — `LoginPage.jsx` button has no `onClick`
2. **Role-based route guards** — no access control by role yet

---

## Dev Commands

```bash
# Dashboard (React web — port 3000)
cd /home/nitish/Desktop/Capstone-Project/Dashboard/frontend
source ~/.nvm/nvm.sh && npm start

# Student App (React Native / Expo — port 8081)
cd /home/nitish/Documents/campus-safety-hub/frontend
source ~/.nvm/nvm.sh && npx expo start
# View in browser: http://localhost:8081
# View on phone: install Expo Go app, scan QR code from terminal

# Student App backend (FastAPI — port 8001)
cd /home/nitish/Documents/campus-safety-hub/backend
uvicorn server:app --reload --port 8001

# Dashboard backend (FastAPI — port 8000)
cd /home/nitish/Desktop/Capstone-Project/Dashboard/backend
uvicorn server:app --reload --port 8000
```

> Note: `yarn` only installed under Node v14 (too old for React 19). Use `npm`/`npx` via nvm (defaults to Node v20).

## Firebase Projects

| App | Project ID | Auth Domain |
|-----|-----------|-------------|
| Dashboard | `acadia-campus-hub` | `acadia-campus-hub.firebaseapp.com` |
| Student App | `acadia-safety` | `acadia-safety.firebaseapp.com` |

Console access: friend has login credentials for both.

---

## How to Resume Next Session

1. Read this file first
2. **Student app is the main focus** — start with the highest priority issues above
3. Most impactful first steps:
   - Friend must add Firebase service account key to `campus-safety-hub/backend/.env` to activate the bridge
   - Install a real map library (blocks Map tab + Friend Walk map)
   - Fix escort assignment (currently completely mocked)
   - Fix profile persistence (phone/emergency contact lost on reload)

---

---

## Session: 2026-03-03 (2) — Fixed SOS 403 Auth Bug

### Root Cause
`api.ts` interceptor was reading `AsyncStorage.getItem('token')` but `AuthContext` only stored `'firebaseToken'` (a Firebase ID token). Campus backend can't verify Firebase tokens — it only accepts its own JWT. So every protected API call returned `403 Forbidden`.

### Fix — `campus-safety-hub/frontend/src/context/AuthContext.tsx`
Added dual auth: on login/signup, call campus backend too and store its JWT as `'token'`.

| Event | Before | After |
|-------|--------|-------|
| Login | Firebase only → stored `'firebaseToken'` | Firebase + campus backend → also stores `'token'` |
| Signup | Firebase only → stored `'firebaseToken'` | Firebase + campus backend → also stores `'token'` |
| Logout | Cleared `'firebaseToken'` | Clears both `'firebaseToken'` and `'token'` |

### How It Works Now
1. Student logs in → Firebase auth (for identity) + `POST /api/auth/login` (for campus API token)
2. Campus backend JWT stored as `'token'` in AsyncStorage
3. `api.ts` interceptor picks up `'token'` → all API calls get proper `Authorization: Bearer` header
4. SOS, escorts, incidents, friend-walk all work ✅

### Note
Users must **log out and log back in** once after this fix for the backend token to be stored.

---

## Session: 2026-03-03 — Firebase Bridge Activated & Tested

### What Was Done
1. Added Firebase service account key to `campus-safety-hub/backend/.env`
   - Project: `acadia-campus-hub`
   - Service account: `firebase-adminsdk-fbsvc@acadia-campus-hub.iam.gserviceaccount.com`
2. Restarted campus backend — confirmed log: `Firebase Admin SDK initialized for Dashboard bridge`
3. Sent test SOS via curl — confirmed log: `SOS mirrored to Firestore`
4. Full bridge confirmed working end-to-end ✅

### Test Results
| Test | Result |
|------|--------|
| Backend health check | ✅ |
| Student signup (`test@acadiau.ca`) | ✅ |
| SOS POST → MongoDB save | ✅ |
| SOS POST → Firestore mirror | ✅ (real-time on Dashboard) |
| Firebase Admin SDK init | ✅ |

### MongoDB Fix
- MongoDB was running as a replica set but uninitialized → ran `rs.initiate()` in mongosh to fix

### Current State
- Campus backend fully operational with Firestore bridge enabled
- Dashboard receives SOS alerts in real-time via Firestore `onSnapshot`
- Student App receives Dashboard broadcasts via `GET /api/alerts` → Firestore `broadcasts`

---

## Session: 2026-03-03 (3) — Environment Setup on macOS

### What Was Done
1. **Installed dependencies** for both apps on macOS (Node v22.22.0, npm 10.9.4)
   - Dashboard: `npm install --legacy-peer-deps` (peer dep conflict with `react-day-picker` + `date-fns@4`)
   - Student App: `npm install` (clean install, 1033 packages)
2. **Started both dev servers** successfully:
   - Dashboard (React web): **http://localhost:3000** — compiled successfully
   - Student App (Expo web): **http://localhost:8081** — bundled successfully (1686 modules)

### Current macOS Paths
| App | Path |
|-----|------|
| Dashboard | `/Users/NitishSahni/Desktop/Acadia-project/Desktop/Capstone-Project/Dashboard/frontend/` |
| User-App (Mobile) | `/Users/NitishSahni/Desktop/Acadia-project/Desktop/Capstone-Project/User-App/frontend/` |
| session.md | `/Users/NitishSahni/Desktop/Acadia-project/Desktop/Capstone-Project/session.md` |
| AGENTS.md | `/Users/NitishSahni/Desktop/Acadia-project/Desktop/Capstone-Project/AGENTS.md` |

### Firebase Projects (unchanged)
| App | Project ID | Config File |
|-----|-----------|-------------|
| Dashboard | `acadia-campus-hub` | `Dashboard/frontend/src/lib/firebase.js` |
| Student App | `acadia-safety` | `campus-safety-hub/frontend/src/firebase/config.ts` |

3. **Started MongoDB** via `brew services start mongodb-community`
4. **Created `.env` files** for both backends (local MongoDB):
   - `Dashboard/backend/.env`: `MONGO_URL=mongodb://localhost:27017`, `DB_NAME=acadia_safe`
   - `campus-safety-hub/backend/.env`: same + empty `FIREBASE_SERVICE_ACCOUNT_JSON=` (bridge disabled)
5. **Created Python venvs** and installed dependencies:
   - Used Python 3.14.3, pinned `pymongo==4.5.0` (motor 3.3.1 incompatible with pymongo 4.16)
   - Skipped `emergentintegrations` (Emergent platform only, not on PyPI)
6. **Started both backends** — both healthy:
   - Dashboard backend: **http://localhost:8000** (port 8000)
   - Campus backend: **http://localhost:8001** (port 8001)

### All 4 Services Running
| Service | URL | Status |
|---------|-----|--------|
| Dashboard frontend | http://localhost:3000 | Running |
| Dashboard backend | http://localhost:8000 | Healthy |
| Student App (Expo) | http://localhost:8081 | Running |
| Campus backend | http://localhost:8001 | Healthy |

### Notes
- The Firebase config the user pasted matches the Dashboard's existing `acadia-campus-hub` config — no changes needed
- Firebase bridge is now **ACTIVE** — service account key added to campus backend `.env`
- MongoDB running locally via Homebrew (`mongodb-community`)
- Campus backend listens on `0.0.0.0:8001` (accessible from phone via LAN IP)

### Auth Fix Applied — `campus-safety-hub/frontend/src/context/AuthContext.tsx`
**Problem:** SOS and all protected API calls returned 403. The `api.ts` interceptor reads `AsyncStorage.getItem('token')` (campus backend JWT), but on page reload `onAuthStateChanged` only restored the Firebase token — never the backend JWT.

**Fixes applied:**
1. `onAuthStateChanged` now checks for stored backend token and validates via `/auth/me`. If missing/expired, forces re-login.
2. New `getBackendToken()` helper — tries campus backend login first, auto-registers if user doesn't exist in MongoDB. No more silent failures.
3. Both `login()` and `signup()` use `getBackendToken()` for resilient backend auth.

**Status:** Users must sign up through the app (creates account in both Firebase `acadia-safety` + campus backend MongoDB). Login then works for both.

### Files Changed This Session
| File | Change |
|------|--------|
| `campus-safety-hub/frontend/src/context/AuthContext.tsx` | Fixed auth: backend token persistence, auto-signup fallback, forced re-login on missing token |
| `campus-safety-hub/frontend/src/services/api.ts` | Changed backend URL to LAN IP (`10.30.14.182:8001`) for phone access |
| `campus-safety-hub/backend/.env` | Added Firebase service account key (bridge active) |
| `Dashboard/backend/.env` | Created with local MongoDB config |

### Known Issue — Still Investigating
- SOS still returns 403 after signup — the `onAuthStateChanged` callback may fire and force sign-out before `signup()` finishes storing the backend token (race condition). Needs fix: either defer `onAuthStateChanged` logic during active login/signup, or restructure to avoid the conflict.

---

## Session: 2026-03-10 — User-App Major Feature Fix (7 Steps)

### Goal
Fix all partially-implemented User-App frontend features. Backend API endpoints already existed — issues were purely frontend.

### What Was Implemented

#### Step 1: Install react-native-maps
- `npx expo install react-native-maps` — Apple Maps works out of the box on iOS (no API key needed)

#### Step 2: Reusable CampusMap Component
- **New file:** `src/components/CampusMap.tsx`
- Wraps `<MapView>` centered on Acadia campus (45.0875, -64.3665)
- Props: `locations` (markers), `showUserLocation`, `onMapPress`, `selectedLocation`, `userTrackingLocation`
- Web-safe: uses `Platform.OS` conditional `require()` — shows Google Maps fallback on web

#### Step 3: Fix Map Tab
- **Modified:** `app/(tabs)/map.tsx`
- Replaced grey placeholder + "Open in Google Maps" button with real `<CampusMap>` showing colored markers
- Kept existing filter chips, location list, distance calculation, and "Get Directions" button
- Removed unused placeholder styles

#### Step 4: Fix Friend Walk — Map + Continuous Location Tracking
- **Modified:** `app/friend-walk.tsx`
- Replaced grey placeholder with `<CampusMap>` showing user's live location
- Added `useEffect` with `Location.watchPositionAsync()` when walk is active:
  - Updates every 15 seconds or 10 meters
  - Calls `friendWalkAPI.updateLocation(walkId, { location_lat, location_lng })` (endpoint existed in api.ts but was never called)
  - Cleans up subscription on walk end/unmount

#### Step 5: Fix Escort Request — Real Destination + Polling
- **Modified:** `app/escort-request.tsx`
- Added `<CampusMap onMapPress={...}>` for tap-to-pick destination selection
- Uses tapped coordinates instead of hardcoded `(45.0880, -64.3670)`
- Replaced fake 5-sec `setTimeout` + `escortAPI.assign()` with real polling:
  - Polls `escortAPI.getActive()` every 5 seconds while waiting
  - When `status === 'assigned'`, reads officer data from response
  - Frontend no longer calls assign — that's the dashboard's job

#### Step 6: Fix Profile — Backend Persistence
- **Modified:** `src/context/AuthContext.tsx`
- `updateUser()`: Now calls `authAPI.updateProfile()` (backend) alongside Firebase `updateProfile()`
- `refreshUser()`: Pulls profile from `authAPI.getMe()` as source of truth, falls back to Firebase

#### Step 7: Fix Profile — Wire Toggles + Stub Screens
- **Modified:** `app/(tabs)/profile.tsx`
  - Location toggle: calls `Location.requestForegroundPermissionsAsync()` on enable
  - Notification toggle: shows alert explaining status
  - Menu items wired to new screens
- **New file:** `app/my-reports.tsx` — Fetches `incidentAPI.getMy()`, displays list of user's incident reports
- **New file:** `app/safety-tips.tsx` — Static screen with 8 campus safety tips
- **New file:** `app/about.tsx` — App info, version, features list, contact

### Files Changed Summary

| File | Action |
|------|--------|
| `src/components/CampusMap.tsx` | New — reusable map component (web-safe) |
| `app/(tabs)/map.tsx` | Modified — real map with markers |
| `app/friend-walk.tsx` | Modified — live map + location tracking |
| `app/escort-request.tsx` | Modified — map destination picker + polling |
| `src/context/AuthContext.tsx` | Modified — backend profile persistence |
| `app/(tabs)/profile.tsx` | Modified — wired toggles + navigation |
| `app/my-reports.tsx` | New — incident history screen |
| `app/safety-tips.tsx` | New — static tips screen |
| `app/about.tsx` | New — app info screen |

### Packages Installed
- `react-native-maps` (via `npx expo install`)

---

## Updated Screen Status

| Screen | File | Status | Notes |
|--------|------|--------|-------|
| Splash | `app/index.tsx` | Done | Checks auth, seeds data, redirects |
| Login | `app/login.tsx` | Done | Firebase auth, domain validation |
| Signup | `app/signup.tsx` | Done | Full validation, @acadiau.ca enforced |
| SOS | `app/sos.tsx` | Done | Type select, countdown, location, API |
| Incident Report | `app/incident-report.tsx` | Done | Type, location, description, photos, anonymous |
| Emergency Contacts | `app/emergency-contacts.tsx` | Done | Hardcoded list, tap to call |
| Home tab | `app/(tabs)/index.tsx` | Done | SOS button, quick actions, latest alert |
| Alerts tab | `app/(tabs)/alerts.tsx` | Done | List + detail modal, pull-to-refresh |
| **Map tab** | `app/(tabs)/map.tsx` | **Done** | Real map with markers, filters, directions |
| **Escort Request** | `app/escort-request.tsx` | **Done** | Map destination picker + polling |
| **Friend Walk** | `app/friend-walk.tsx` | **Done** | Live map + continuous location tracking |
| **Profile tab** | `app/(tabs)/profile.tsx` | **Done** | Backend persistence, wired toggles |
| **My Reports** | `app/my-reports.tsx` | **Done** | Fetches incident history |
| **Safety Tips** | `app/safety-tips.tsx` | **Done** | 8 campus safety tips |
| **About** | `app/about.tsx` | **Done** | App info screen |

## Remaining Issues

| Priority | Issue |
|----------|-------|
| Medium | Push notifications not possible (Expo Notifications not installed) |
| Medium | Firebase config hardcoded (not in .env) |
| Low | `zustand` installed but never used |
| Low | Dashboard "Forgot Password" button has no onClick |

---

*Last updated: 2026-03-10*
