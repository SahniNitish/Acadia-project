# Acadia Safe — Campus Safety App

A comprehensive campus safety system built for Acadia University. Real-time SOS alerts, safe-walk escorts, incident reporting, and security broadcasts — connecting students with campus security staff instantly.

---

## Overview

| App | Users | Tech | Port |
|-----|-------|------|------|
| **Dashboard** | Security staff | React 19, Firestore | 3000 |
| **Student App** | Students (mobile) | React Native + Expo | 8081 |
| **Campus Backend** | API for Student App | FastAPI + MongoDB | 8001 |
| **Dashboard Backend** | API for Dashboard | FastAPI + MongoDB | 8000 |

---

## Features

### Student App
- **SOS Alert** — one-tap emergency alert with live GPS location sent to security staff in real-time
- **Incident Report** — report suspicious activity, theft, harassment with photos
- **Safe-Walk Escort** — request a security escort from pickup to destination
- **Friend Walk** — share live location with trusted contacts during a walk
- **Campus Alerts** — receive emergency broadcasts from security staff
- **Campus Map** — find emergency phones, AEDs, safe buildings, security office

### Security Dashboard
- **Live Alerts** — real-time SOS feed via Firestore `onSnapshot` (no refresh needed)
- **Incident Management** — view, filter, and update incident reports
- **Escort Coordination** — assign officers to escort requests
- **Broadcast System** — send emergency, advisory, or information alerts to all students
- **Analytics** — incident trends, response times, campus activity overview
- **User Management** — manage security staff accounts

---

## Architecture

```
[Student App]
     │ POST /api/sos
     ▼
[Campus Backend :8001]
     ├─ MongoDB (persistent storage)
     └─ Firestore alerts/{id} ──────────► [Dashboard :3000] (real-time)

[Dashboard :3000]
     │ writes to Firestore broadcasts
     ▼
[Campus Backend :8001] GET /api/alerts reads Firestore broadcasts
     │
     ▼
[Student App] — broadcasts visible on pull-to-refresh
```

---

## Project Structure

```
Acadia-project/
├── Dashboard/
│   ├── frontend/               # React 19 web app (security staff)
│   │   └── src/
│   │       ├── pages/          # AlertsPage, BroadcastPage, IncidentsPage, etc.
│   │       ├── lib/            # Firebase, AuthContext
│   │       └── components/     # shadcn/ui, layout, dashboard
│   └── backend/                # FastAPI (port 8000)
│       └── server.py
│
├── campus-safety-hub/
│   ├── frontend/               # React Native + Expo (students)
│   │   ├── app/                # Expo Router screens
│   │   │   ├── sos.tsx
│   │   │   ├── incident-report.tsx
│   │   │   ├── escort-request.tsx
│   │   │   ├── friend-walk.tsx
│   │   │   └── (tabs)/         # Home, Alerts, Map, Profile
│   │   └── src/
│   │       ├── context/        # AuthContext (Firebase + campus backend JWT)
│   │       ├── services/       # api.ts (axios, all endpoints)
│   │       ├── firebase/       # Firebase config
│   │       └── constants/      # Theme, colors, campus coordinates
│   └── backend/                # FastAPI (port 8001) — Firebase bridge included
│       └── server.py
│
├── session.md                  # Dev session log (AI context)
├── AGENTS.md                   # Project guide & architecture reference
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- Python 3.11+
- MongoDB (local or Atlas)
- Expo Go app (for mobile testing)

### 1. Dashboard (Security Staff Web App)

```bash
cd Dashboard/frontend
npm install --legacy-peer-deps
npm start
# Opens at http://localhost:3000
```

```bash
cd Dashboard/backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8000
```

Create `Dashboard/backend/.env`:
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=acadia_safe
```

### 2. Student App (React Native + Expo)

```bash
cd campus-safety-hub/frontend
npm install
npx expo start
# Web: http://localhost:8081
# Mobile: scan QR code with Expo Go
```

```bash
cd campus-safety-hub/backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8001
```

Create `campus-safety-hub/backend/.env`:
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=acadia_safe

# Optional: enables real-time Dashboard bridge
# Get from Firebase Console → acadia-campus-hub → Service Accounts
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

---

## Environment Notes

- Student App uses **Firebase `acadia-safety`** for auth (email/password)
- Dashboard uses **Firebase `acadia-campus-hub`** for auth + Firestore
- The campus backend uses its own JWT auth — students must register through the app
- Without `FIREBASE_SERVICE_ACCOUNT_JSON`, the backend runs normally (MongoDB only); the Dashboard bridge is simply disabled

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Dashboard Frontend | React 19, Tailwind CSS, shadcn/ui, Recharts, Leaflet |
| Student App | React Native 0.81, Expo 54, Expo Router 6, TypeScript |
| Backend | FastAPI, Uvicorn, Motor (async MongoDB), Pydantic v2 |
| Auth | Firebase Auth (Email/Password) |
| Real-time | Firestore `onSnapshot` |
| Database | MongoDB + Firebase Firestore |
| Maps | Leaflet (Dashboard), react-native-maps (Student App — pending) |

---

## API Endpoints (Campus Backend — port 8001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register student |
| POST | `/api/auth/login` | Login student |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/sos` | Send SOS alert |
| PUT | `/api/sos/{id}/cancel` | Cancel SOS |
| GET | `/api/sos/active` | Get active SOS |
| POST | `/api/incidents` | Report incident |
| POST | `/api/escorts` | Request escort |
| PUT | `/api/escorts/{id}/cancel` | Cancel escort |
| POST | `/api/friend-walk` | Start friend walk |
| GET | `/api/alerts` | Get campus alerts (from Firestore broadcasts) |
| GET | `/api/locations` | Get campus safety locations |

---

## Authors

**Nitish Sahni** — Acadia University Capstone Project
