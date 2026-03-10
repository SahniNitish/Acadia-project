# Acadia Safe - Campus Safety Application

## Project Overview

Acadia Safe is a comprehensive campus safety monitoring system built for Acadia University. The project consists of two applications:

**Applications:**
- **Dashboard/** - Admin web dashboard for security staff to monitor alerts, manage incidents, and coordinate responses (React 19)
- **User-App/** - Student-facing mobile app for reporting incidents, requesting escorts, and receiving alerts (React Native + Expo)

## Technology Stack

### Dashboard Frontend
- **Framework:** React 19 (Create React App)
- **Build Tool:** CRACO (Create React App Configuration Override)
- **Styling:** Tailwind CSS 3.4 with custom design system
- **UI Components:** shadcn/ui (Radix UI primitives)
- **State Management:** React Context API
- **Routing:** React Router DOM v7
- **Icons:** Lucide React
- **Forms:** React Hook Form with Zod validation
- **Charts:** Recharts
- **Maps:** Leaflet via react-leaflet
- **Notifications:** Sonner (toast notifications)

### User-App (Mobile)
- **Framework:** React Native 0.81.5 + Expo 54
- **Language:** TypeScript
- **Navigation:** Expo Router v6 (Stack + Tabs + Modals)
- **Auth:** Firebase Auth (Email/Password) + Campus Backend JWT (dual auth)
- **Maps:** react-native-maps (Apple Maps on iOS, web-safe fallback)
- **Location:** expo-location (foreground permissions, watchPositionAsync)
- **API Client:** Axios
- **Storage:** AsyncStorage

### Dashboard Backend
- **Framework:** FastAPI 0.110.1 (Python)
- **Server:** Uvicorn 0.25.0
- **Database:** MongoDB (via Motor 3.3.1 async driver)
- **Authentication:** Firebase Admin SDK
- **Data Validation:** Pydantic v2
- **CORS:** Starlette CORS middleware

### User-App Backend
- **Framework:** FastAPI (Python)
- **Server:** Uvicorn
- **Database:** MongoDB
- **Firebase Bridge:** Firebase Admin SDK (mirrors SOS to Firestore for Dashboard real-time updates)

### External Services
- **Authentication:** Firebase Auth (Email/Password)
- **Database:** Firebase Firestore (real-time data synchronization)
- **File Storage:** Firebase Cloud Storage
- **Analytics:** PostHog

## Project Structure

```
Capstone-Project/
├── Dashboard/                          # Admin web dashboard
│   ├── frontend/                       # React frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ui/                # shadcn/ui components (50+ components)
│   │   │   │   ├── layout/            # Layout components (Sidebar, Header, DashboardLayout)
│   │   │   │   └── dashboard/         # Dashboard-specific components (CampusMap)
│   │   │   ├── pages/                 # Page components (9 pages)
│   │   │   ├── lib/                   # Utilities and configurations
│   │   │   ├── hooks/                 # Custom React hooks
│   │   │   ├── App.js                 # Main App component with routing
│   │   │   └── index.js               # Entry point
│   │   ├── package.json
│   │   ├── craco.config.js
│   │   └── tailwind.config.js
│   ├── backend/                        # FastAPI backend
│   │   ├── server.py                  # Main FastAPI application
│   │   └── requirements.txt
│   └── tests/
│
└── User-App/                           # Student mobile app (React Native + Expo)
    ├── frontend/
    │   ├── app/                        # Expo Router screens
    │   │   ├── index.tsx               # Splash / auth redirect
    │   │   ├── login.tsx               # Login screen
    │   │   ├── signup.tsx              # Sign up screen
    │   │   ├── sos.tsx                 # SOS emergency screen
    │   │   ├── incident-report.tsx     # Report an incident
    │   │   ├── escort-request.tsx      # Request safe-walk escort (map destination picker + polling)
    │   │   ├── friend-walk.tsx         # Friend walk (live map + continuous location tracking)
    │   │   ├── emergency-contacts.tsx  # Emergency contacts
    │   │   ├── my-reports.tsx          # User's incident report history
    │   │   ├── safety-tips.tsx         # Campus safety tips
    │   │   ├── about.tsx              # App info screen
    │   │   ├── _layout.tsx             # Root layout
    │   │   └── (tabs)/                 # Bottom tab navigator
    │   │       ├── index.tsx           # Home tab
    │   │       ├── alerts.tsx          # View alerts tab
    │   │       ├── map.tsx             # Campus map tab (real Apple Maps)
    │   │       └── profile.tsx         # Profile tab (backend persistence)
    │   ├── src/
    │   │   ├── components/             # Button, Input, Card, LoadingSpinner, CampusMap
    │   │   ├── constants/theme.ts      # Colors, spacing, campus coords
    │   │   ├── context/AuthContext.tsx  # Firebase + backend dual auth
    │   │   ├── firebase/config.ts      # Firebase init
    │   │   └── services/api.ts         # Axios client for backend
    │   ├── app.json
    │   └── package.json
    ├── backend/
    │   ├── server.py                   # Campus backend (port 8001)
    │   └── requirements.txt
    └── tests/
```

## Build and Development Commands

### Dashboard Frontend

```bash
cd Dashboard/frontend

# Install dependencies
npm install --legacy-peer-deps

# Start development server (http://localhost:3000)
npm start

# Build for production
npm run build
```

### Dashboard Backend

```bash
cd Dashboard/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run development server (http://localhost:8000)
uvicorn server:app --reload --port 8000
```

### User-App (Mobile)

```bash
cd User-App/frontend

# Install dependencies
npm install

# Start Expo dev server (http://localhost:8081)
npx expo start
```

### User-App Backend

```bash
cd User-App/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run development server (http://localhost:8001)
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

## Environment Configuration

### Dashboard Frontend `.env`

```bash
REACT_APP_BACKEND_URL=http://localhost:8000/api
```

### Dashboard Backend `.env`

```bash
MONGO_URL=mongodb://localhost:27017
DB_NAME=acadia_safe
CORS_ORIGINS=http://localhost:3000
```

### User-App Backend `.env`

```bash
MONGO_URL=mongodb://localhost:27017
DB_NAME=acadia_safe
# Firebase service account — enables SOS→Dashboard bridge
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"acadia-campus-hub",...}
```

## Firebase Projects

| App | Project ID | Auth Domain |
|-----|-----------|-------------|
| Dashboard | `acadia-campus-hub` | `acadia-campus-hub.firebaseapp.com` |
| User-App | `acadia-safety` | `acadia-safety.firebaseapp.com` |

## Dashboard API Endpoints

All endpoints prefixed with `/api`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/alerts` | List all alerts |
| POST | `/api/alerts` | Create new alert |
| PUT | `/api/alerts/{id}` | Update alert status |
| GET | `/api/incidents` | List all incidents |
| POST | `/api/incidents` | Create new incident |
| GET | `/api/escorts` | List all escorts |
| POST | `/api/escorts` | Create new escort |
| PUT | `/api/escorts/{id}` | Update escort status |
| GET | `/api/users` | List all users |
| GET | `/api/staff` | List all staff |
| GET | `/api/broadcasts` | List all broadcasts |
| POST | `/api/broadcasts` | Create new broadcast |
| POST | `/api/seed-demo-data` | Seed demo data |

## Code Style Guidelines

### JavaScript/React Conventions

1. **Component Exports:**
   - Pages MUST use default exports: `export default function PageName() {...}`
   - Components MUST use named exports: `export const ComponentName = ...`

2. **Styling:**
   - Use Tailwind CSS utility classes
   - All interactive elements MUST have a `data-testid` attribute

3. **Naming Conventions:**
   - Components: PascalCase (e.g., `AlertCard.jsx`)
   - Hooks: camelCase with `use` prefix (e.g., `useAuth.js`)

### Python/FastAPI Conventions

1. **Model Definitions:**
   - Use Pydantic v2 BaseModel with `ConfigDict(extra="ignore")`
   - UUID fields use: `default_factory=lambda: str(uuid.uuid4())`

2. **Route Organization:**
   - All routes under `/api` prefix using APIRouter

## Design System

### Color Palette
- **Primary Navy:** `#0d1b2a` (sidebar, primary actions)
- **Status Colors:** Danger `#e53e3e`, Safe `#38a169`, Warning `#ecc94b`, Info `#3182ce`

### Typography
- **Primary Font:** Inter (weights: 400, 500, 700, 900)
- **Monospace Font:** JetBrains Mono (timestamps, IDs)

## All Dev Services

| Service | URL | Command |
|---------|-----|---------|
| Dashboard frontend | http://localhost:3000 | `cd Dashboard/frontend && npm start` |
| Dashboard backend | http://localhost:8000 | `cd Dashboard/backend && uvicorn server:app --reload --port 8000` |
| User-App (Expo) | http://localhost:8081 | `cd User-App/frontend && npx expo start` |
| User-App backend | http://localhost:8001 | `cd User-App/backend && uvicorn server:app --reload --host 0.0.0.0 --port 8001` |
