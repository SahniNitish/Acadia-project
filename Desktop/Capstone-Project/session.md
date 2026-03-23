# Acadia Safe — Session Log

> This file is for Claude (AI assistant) to read at the start of future sessions.
> It tracks what was done, what changed, and where we left off.

---

## Project Structure (current as of 2026-03-18)

There are **2 apps** in the project:

| App | Path | Tech | Who Uses It |
|-----|------|------|-------------|
| **Dashboard** | `Capstone-Project/Dashboard/` | React 19 (web) | Security staff |
| **User-App** | `Capstone-Project/User-App/` | React Native + Expo (TypeScript) | Students (mobile) |

> The User-App backend (FastAPI + MongoDB) has been **removed**. The User-App now talks directly to Firestore (`acadia-campus-hub`), the same project used by the Dashboard.

### Current macOS Paths
| App | Path |
|-----|------|
| Dashboard frontend | `/Users/NitishSahni/Desktop/Acadia-project/Desktop/Capstone-Project/Dashboard/frontend/` |
| User-App (Mobile) | `/Users/NitishSahni/Desktop/Acadia-project/Desktop/Capstone-Project/User-App/frontend/` |
| session.md | `/Users/NitishSahni/Desktop/Acadia-project/Desktop/Capstone-Project/session.md` |
| AGENTS.md | `/Users/NitishSahni/Desktop/Acadia-project/Desktop/Capstone-Project/AGENTS.md` |

---

## Session: 2026-03-18 — Full Firebase Migration + New Features

### Goal
Migrate User-App from FastAPI+MongoDB backend to Firestore-direct (same project as Dashboard). Add multiple new features: shuttle booking, Firebase Storage for photos, SOS sounds, dashboard audio alerts.

### Part 1 — Firebase Migration (all data through Firestore)

#### Files Changed

| File | Action | Notes |
|------|--------|-------|
| `src/firebase/config.ts` | Updated | Switched project `acadia-safety` → `acadia-campus-hub`; changed to `initializeAuth` + `getReactNativePersistence`; added `storage` export |
| `src/services/firestore.ts` | Created | Replaces `api.ts`; all Firestore operations (SOS, incidents, escorts, broadcasts, profile, contacts, shuttles) |
| `src/context/AuthContext.tsx` | Rewritten | Removed dual-auth/backend JWT; Firebase-only; `getUserProfile` as source of truth; camelCase user fields |
| `src/services/api.ts` | Deleted | No longer needed |
| `app/(tabs)/alerts.tsx` | Updated | `getBroadcasts()` from Firestore; field: `type` (not `alert_type`), `createdAt` (not `created_at`) |
| `app/(tabs)/index.tsx` | Updated | Same alert field updates; Friend Walk → Book Shuttle quick action |
| `app/my-reports.tsx` | Updated | `getMyIncidents(uid)` from Firestore; field: `type`, `createdAt` |
| `app/sos.tsx` | Updated | `createSOS`/`cancelSOS` from Firestore; haptic beeps on send; X/close button on sent screen |
| `app/incident-report.tsx` | Updated | `createIncident` from Firestore; passes `photoBase64s` → Firebase Storage |
| `app/escort-request.tsx` | Updated | `createEscort`/`subscribeToEscort` from Firestore; status `in_progress` (not `assigned`) |
| `app/friend-walk.tsx` | Updated | Firestore functions; camelCase fields (`endTime`, `durationMinutes`, `contactIds`) |
| `app/(tabs)/profile.tsx` | Updated | camelCase fields (`fullName`, `profilePhoto`, `emergencyContactName`, `emergencyContactPhone`) |
| `app/(tabs)/map.tsx` | Updated | Removed `locationsAPI` import (no longer exists); uses embedded mock data |
| `package.json` | Updated | Removed `axios` dependency |

#### Firestore Schema (User-App writes)

```
alerts/{id}:    { studentName, studentEmail, studentPhone, latitude, longitude, location, alertType, status: 'new', createdAt, userId }
incidents/{id}: { type, location, latitude, longitude, description, reporterName, reporterEmail, anonymous, wantsContact, contactPhone, photos: [urls], priority: 'medium', status: 'new', createdAt, userId }
escorts/{id}:   { studentName, studentPhone, studentEmail, pickup, pickupLatitude, pickupLongitude, destination, destinationLatitude, destinationLongitude, notes, status: 'pending', createdAt, userId, estimatedWait: 10, assignedTo: null, assignedToName: null }
shuttles/{id}:  { studentName, studentPhone, studentEmail, pickup, pickupLatitude, pickupLongitude, destination, destinationLatitude, destinationLongitude, notes, status: 'pending', createdAt, userId, estimatedWait: 15, assignedTo: null, assignedToName: null }
users/{uid}:    { fullName, email, phone, profilePhoto, emergencyContactName, emergencyContactPhone, createdAt }
users/{uid}/contacts/{id}: { name, phone, relationship, createdAt }
```

### Part 2 — New Features

#### Shuttle Booking (replaces Friend Walk)
- **New file:** `app/shuttle.tsx`
  - Nominatim/OpenStreetMap address autocomplete (500ms debounce, `countrycodes=ca`)
  - GPS pickup with reverse geocode (`Location.reverseGeocodeAsync`)
  - Three states: `form → waiting → assigned`
  - Real-time `subscribeToShuttle(docId, callback)` via `onSnapshot`
  - Cancel via `cancelShuttle(docId)`
  - Note card: shuttle operates 7am–10pm
- **`app/(tabs)/index.tsx`**: Quick action changed from Friend Walk (`/friend-walk`) to Book Shuttle (`/shuttle`, icon: `bus`)

#### Firebase Storage for Incident Photos
- **`src/firebase/config.ts`**: Added `export const storage = getStorage(app)`
- **`src/services/firestore.ts`**: Added `uploadIncidentPhoto(uid, base64DataUri, index)` → uploads to `incidents/{uid}/{timestamp}_{i}.jpg`, returns download URL
- **`createIncident`**: Accepts `photoBase64s?: string[]`, uploads each to Storage, stores URL array in `incidents.photos[]`
- **`app/incident-report.tsx`**: Passes `photoBase64s: photos.length > 0 ? photos : undefined`
- **Dashboard `IncidentsPage.jsx`**: Shows photo gallery in incident detail modal (clickable thumbnails → new tab)

#### SOS Enhancements
- **Haptic beeps**: 3× `Haptics.notificationAsync(NotificationFeedbackType.Error)` at 0ms / 400ms / 800ms on send
- **X button**: `<TouchableOpacity onPress={() => router.back()}>` on sent screen so user can use other app features while SOS is active

#### Dashboard: SOS Audio + Browser Notifications (`AlertsPage.jsx`)
- **Web Audio API beep**: `AudioContext` generates 3× 880Hz sine wave beeps when new SOS arrives (no audio file needed)
- **Browser Notification API**: `Notification.requestPermission()` on mount; `new Notification('🚨 New SOS Alert', ...)` on new active SOS
- **Guard**: `snapshot.metadata.fromCache` prevents sound on page load; `docChanges()` detects only `type === 'added'`
- **UI banner**: Shows "Enable notifications" button or "denied" warning based on permission state

#### Dashboard: Shuttle Management (`ShuttlesPage.jsx` — new)
- Real-time `onSnapshot` on `shuttles` collection
- Kanban view (Pending / In Progress / Completed columns) + List view with tab filters
- Accept button (pending → in_progress), Complete button (in_progress → completed)
- Stats cards: pending / active / completed counts

#### Dashboard: Navigation Updated
- **`Sidebar.jsx`**: Added `{ path: '/shuttles', icon: Bus, label: 'Shuttles' }` nav item
- **`App.js`**: Added `import ShuttlesPage` + `<Route path="/shuttles" element={<ShuttlesPage />} />`

### Part 3 — UI Improvements (2026-03-18 continued)

#### Campus Map UI Redesign (`app/(tabs)/map.tsx`)
- Dark gradient header (navy) with "Live" badge when GPS is active
- Filter chips: category colour + count badge + solid fill when active
- Map height: 32% of screen height (was fixed 260px)
- Map overlay badge: shows "X shown" count
- Location cards: left colour bar, coloured icon container, distance badge in blue pill, chevron expand, coloured "Get Directions" pill button
- "Clear selection" link in list header
- Empty state for filtered categories

#### Tab Bar Polish (`app/(tabs)/_layout.tsx`)
- Height increased to 76px
- Active icons: 23px (vs 22px inactive)
- Wider active pill: 52px
- Inactive tint: `gray[400]` (more distinct)

### Firestore Security Rules (TODO — must do in Firebase Console)
```
allow read, write: if request.auth != null && request.auth.token.email.matches('.*@acadiau\.ca$');
```
Collections: `alerts`, `incidents`, `escorts`, `shuttles`, `users/{uid}/**`
Storage: `incidents/{uid}/**`

---

## Current Screen Status (as of 2026-03-18)

| Screen | File | Status | Notes |
|--------|------|--------|-------|
| Splash | `app/index.tsx` | Done | Auth redirect |
| Login | `app/login.tsx` | Done | Firebase auth, @acadiau.ca domain |
| Signup | `app/signup.tsx` | Done | Creates Firestore profile on signup |
| SOS | `app/sos.tsx` | Done | Haptic beeps, X button, Firestore |
| Incident Report | `app/incident-report.tsx` | Done | Firebase Storage photos, Firestore |
| Emergency Contacts | `app/emergency-contacts.tsx` | Done | Hardcoded list, tap to call |
| Home tab | `app/(tabs)/index.tsx` | Done | Quick actions: Escort, Report, Shuttle, Map |
| Alerts tab | `app/(tabs)/alerts.tsx` | Done | Reads `broadcasts` from Firestore |
| Map tab | `app/(tabs)/map.tsx` | Done | Redesigned UI, real map, filters, distances |
| Escort Request | `app/escort-request.tsx` | Done | Firestore, real-time onSnapshot |
| Shuttle | `app/shuttle.tsx` | Done | Nominatim autocomplete, real-time status |
| Profile tab | `app/(tabs)/profile.tsx` | Done | camelCase fields, Firestore persistence |
| My Reports | `app/my-reports.tsx` | Done | Reads incidents from Firestore |
| Safety Tips | `app/safety-tips.tsx` | Done | Static tips |
| About | `app/about.tsx` | Done | App info |

## Current Dashboard Status (as of 2026-03-18)

| Page | Status | Notes |
|------|--------|-------|
| Login | Done | Firebase auth |
| Dashboard | Done | Stats, recent activity |
| Alerts | Done | SOS audio + browser notifications |
| Incidents | Done | Photo gallery in detail modal |
| Escorts | Done | Accept/assign/complete flow |
| **Shuttles** | **Done (new)** | Kanban + list, accept/complete |
| Broadcast | Done | Send alerts to students |
| Analytics | Done | Charts |
| Users | Done | User list |
| Settings | Done | Config |

---

## Session: 2026-03-23 — Email Verification Gate Fix

### Problem
After signup with an `@acadiau.ca` email the app was navigating directly to the dashboard (tabs) without requiring the user to verify their email first.

### Root Cause
`app/(tabs)/_layout.tsx` had **no auth guard**. If anything routed the user to `/(tabs)` — including a race condition or a re-navigation — there was nothing to block unverified users. Additionally, `verify-email` was not registered in the root `_layout.tsx` Stack.

### Fix
| File | Change |
|------|--------|
| `app/_layout.tsx` | Added `<Stack.Screen name="verify-email" />` so the screen is properly registered |
| `app/(tabs)/_layout.tsx` | Added auth guard using `<Redirect>` from `expo-router`: unverified users → `/verify-email`; unauthenticated → `/login` |

### Flow After Fix
1. **Signup** → verification email sent to Outlook → user lands on `verify-email` screen
2. **User clicks link in email** → Firebase marks email verified
3. **User taps "I've Verified My Email"** → `reloadAndCheckVerified()` confirms → navigates to `/(tabs)`
4. **Any attempt to reach `/(tabs)` while unverified** → `<Redirect href="/verify-email" />` immediately redirects

---

## Remaining Known Issues

| Priority | Issue |
|----------|-------|
| High | Firestore Security Rules not updated in Firebase Console yet (currently `allow read, write: if request.auth != null`) |
| High | Firebase Storage rules need `incidents/{uid}/**` write access |
| Medium | Push notifications not implemented (Expo Notifications not installed) |
| Medium | Firebase config hardcoded in `src/firebase/config.ts` (not in `.env`) |
| Low | `zustand` in `package.json` but never used |
| Low | Dashboard "Forgot Password" button has no onClick |

## Dev Commands

```bash
# Dashboard (React web — port 3000)
cd /Users/NitishSahni/Desktop/Acadia-project/Desktop/Capstone-Project/Dashboard/frontend
npm start

# User-App (React Native / Expo — port 8081)
cd /Users/NitishSahni/Desktop/Acadia-project/Desktop/Capstone-Project/User-App/frontend
npx expo start
# View on phone: scan QR code in Expo Go
```

> No backends to start. Both apps talk directly to Firebase/Firestore.

---

*Last updated: 2026-03-18*
