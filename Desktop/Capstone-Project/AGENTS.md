# Acadia Safe - Campus Safety Application

## Project Overview

Acadia Safe is a comprehensive campus safety monitoring system built for Acadia University Security personnel. The project consists of two main applications that work together to provide real-time security monitoring and emergency response capabilities.

**Applications:**
- **Dashboard/** - Admin dashboard for security staff to monitor alerts, manage incidents, and coordinate responses
- **Student App** (`/home/nitish/Documents/campus-safety-hub/`) - The real student-facing mobile app (React Native + Expo). **This is the correct student app.**
- ~~**User-App/**~~ - Redundant web copy of the dashboard. **Ignore — do not work on this.**

> **Note:** The `User-App/` directory inside Capstone-Project is outdated and redundant. The actual student app is the React Native Expo project at `/home/nitish/Documents/campus-safety-hub/`.

## Technology Stack

### Frontend
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
- **Package Manager:** Yarn 1.22.22

### Backend
- **Framework:** FastAPI 0.110.1 (Python)
- **Server:** Uvicorn 0.25.0
- **Database:** MongoDB (via Motor 3.3.1 async driver)
- **Authentication:** Firebase Admin SDK
- **Data Validation:** Pydantic v2
- **CORS:** Starlette CORS middleware

### External Services
- **Authentication:** Firebase Auth (Email/Password)
- **Database:** Firebase Firestore (real-time data synchronization)
- **File Storage:** Firebase Cloud Storage
- **Analytics:** PostHog

## Project Structure

```
Capstone-Project/
├── Dashboard/                          # Admin dashboard application
│   ├── frontend/                       # React frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ui/                # shadcn/ui components (50+ components)
│   │   │   │   ├── layout/            # Layout components (Sidebar, Header, DashboardLayout)
│   │   │   │   └── dashboard/         # Dashboard-specific components (CampusMap)
│   │   │   ├── pages/                 # Page components (9 pages)
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   ├── DashboardPage.jsx
│   │   │   │   ├── AlertsPage.jsx
│   │   │   │   ├── IncidentsPage.jsx
│   │   │   │   ├── EscortsPage.jsx
│   │   │   │   ├── BroadcastPage.jsx
│   │   │   │   ├── AnalyticsPage.jsx
│   │   │   │   ├── UsersPage.jsx
│   │   │   │   └── SettingsPage.jsx
│   │   │   ├── lib/                   # Utilities and configurations
│   │   │   │   ├── firebase.js        # Firebase initialization
│   │   │   │   ├── AuthContext.js     # Authentication context
│   │   │   │   └── utils.js           # Utility functions
│   │   │   ├── hooks/                 # Custom React hooks
│   │   │   ├── App.js                 # Main App component with routing
│   │   │   ├── index.js               # Entry point
│   │   │   └── index.css              # Global styles + Tailwind
│   │   ├── plugins/                   # Custom webpack plugins
│   │   │   ├── visual-edits/          # Visual editing support
│   │   │   └── health-check/          # Health check endpoints
│   │   ├── public/
│   │   │   └── index.html
│   │   ├── package.json
│   │   ├── craco.config.js            # CRA customization
│   │   ├── tailwind.config.js         # Tailwind configuration
│   │   ├── components.json            # shadcn/ui config
│   │   └── jsconfig.json
│   ├── backend/                        # FastAPI backend
│   │   ├── server.py                  # Main FastAPI application
│   │   └── requirements.txt           # Python dependencies
│   ├── tests/                         # Python test directory
│   ├── memory/                        # Project documentation
│   │   └── PRD.md                     # Product Requirements Document
│   ├── test_reports/                  # Test execution reports
│   ├── .emergent/                     # Emergent AI configuration
│   ├── design_guidelines.json         # Design system specification
│   ├── backend_test.py                # Backend API test suite
│   ├── backend_test_results.json      # Latest test results
│   ├── test_result.md                 # Testing protocol and results
│   └── .gitignore
│
└── User-App/                          # Student-facing application
    └── (Identical structure to Dashboard/)
```

## Build and Development Commands

### Frontend (Dashboard or User-App)

```bash
cd Dashboard/frontend  # or User-App/frontend

# Install dependencies
yarn install

# Start development server (runs on http://localhost:3000)
yarn start

# Build for production
yarn build

# Run tests
yarn test
```

### Backend (Dashboard or User-App)

```bash
cd Dashboard/backend  # or User-App/backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn server:app --reload --port 8000

# Run with specific host
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

### Backend Testing

```bash
cd Dashboard  # or User-App

# Run the comprehensive API test suite
python backend_test.py
```

## Environment Configuration

### Frontend Environment Variables

Create `Dashboard/frontend/.env` or `User-App/frontend/.env`:

```bash
# Backend API URL
REACT_APP_BACKEND_URL=http://localhost:8000/api

# Optional: Enable dev features
ENABLE_HEALTH_CHECK=true
```

### Firebase Configuration

Firebase is configured in `Dashboard/frontend/src/lib/firebase.js` and `User-App/frontend/src/lib/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDt5YlJ_ZgO0aswJXTtCqBJelwLDQfbc2A",
  authDomain: "acadia-campus-hub.firebaseapp.com",
  projectId: "acadia-campus-hub",
  storageBucket: "acadia-campus-hub.firebasestorage.app",
  messagingSenderId: "178102066314",
  appId: "1:178102066314:web:bd5fa015f3a0a86ec7a173",
  measurementId: "G-EBRTYXV4N4"
};
```

**Project:** acadia-campus-hub  
**Services:** Authentication, Firestore Database, Analytics

### Backend Environment Variables

**Dashboard backend** (`Dashboard/backend/.env`):
```bash
# MongoDB Connection
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/database_name
DB_NAME=acadia_safe

# CORS Origins (comma-separated for multiple origins)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

**Campus backend** (`Documents/campus-safety-hub/backend/.env`):
```bash
MONGO_URL=mongodb://localhost:27017
DB_NAME=acadia_safe

# Firebase service account — enables SOS→Dashboard bridge and Firestore broadcasts→Student App
# Generate from: Firebase Console → acadia-campus-hub → Project Settings → Service Accounts
# Paste as single-line JSON:
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"acadia-campus-hub",...}
```

> Without `FIREBASE_SERVICE_ACCOUNT_JSON`, the campus backend runs normally (MongoDB only) — the Dashboard bridge is simply disabled.

## Code Style Guidelines

### JavaScript/React Conventions

1. **Component Exports:**
   - Pages MUST use default exports: `export default function PageName() {...}`
   - Components MUST use named exports: `export const ComponentName = ...`

2. **Import Order:**
   - React imports first
   - Third-party libraries second
   - Local components third
   - Relative imports using `@/` alias for src directory

3. **Styling:**
   - Use Tailwind CSS utility classes
   - Custom CSS variables defined in `index.css`
   - Follow design system colors (Navy theme)
   - All interactive elements MUST have a `data-testid` attribute

4. **Naming Conventions:**
   - Components: PascalCase (e.g., `AlertCard.jsx`)
   - Hooks: camelCase with `use` prefix (e.g., `useAuth.js`)
   - Utilities: camelCase (e.g., `utils.js`)

### Python/FastAPI Conventions

1. **Model Definitions:**
   - Use Pydantic v2 BaseModel with `ConfigDict(extra="ignore")`
   - UUID fields use: `default_factory=lambda: str(uuid.uuid4())`
   - Timestamps use ISO format strings

2. **Route Organization:**
   - All routes under `/api` prefix using APIRouter
   - Consistent response models
   - Proper HTTP exception handling

## Testing Strategy

### Backend Testing

- **Test File:** `backend_test.py` - Comprehensive API test suite
- **Test Coverage:** 11 API endpoints tested
  - Health checks
  - CRUD operations for Alerts, Incidents, Escorts
  - User and Staff management
  - Broadcast functionality
  - Demo data seeding
- **Test Results:** Stored in `backend_test_results.json`

### Testing Protocol

The project uses a structured testing protocol documented in `test_result.md`:
- Main agent and testing agent communication format
- Task tracking with implementation status
- Test history and status updates
- Stuck task identification

## Design System

### Color Palette
- **Primary Navy:** `#0d1b2a` (sidebar, primary actions)
- **Navy 800:** `#1b263b` (hover states)
- **Navy 700:** `#415a77` (secondary elements)
- **Background Light:** `#f7fafc` (main content area)
- **Status Colors:**
  - Danger: `#e53e3e` (emergency alerts)
  - Safe: `#38a169` (success states)
  - Warning: `#ecc94b` (caution states)
  - Info: `#3182ce` (information)

### Typography
- **Primary Font:** Inter (weights: 400, 500, 700, 900)
- **Monospace Font:** JetBrains Mono (timestamps, IDs, coordinates)

### UI Patterns
- Tactical UI aesthetic: clean lines, high contrast, information density
- Bento Grid layout for dashboard widgets
- Card-based content organization
- Sidebar navigation (fixed 260px width)

## Backend API Endpoints

All endpoints are prefixed with `/api`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/` | Root message |
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

## Security Considerations

1. **Authentication:** Firebase Auth handles user authentication
2. **Authorization:** Role-based access (officer, supervisor, admin)
3. **CORS:** Configured via environment variables
4. **Data Validation:** Pydantic models validate all inputs
5. **Secrets:** All sensitive data in environment variables, never committed
6. **Firestore Rules:** Should be configured for production

## Development Notes

### Key Dependencies

**Frontend:**
- React 19 with modern features
- Radix UI primitives for accessibility
- dnd-kit for drag-and-drop (Kanban boards)
- date-fns for date formatting
- Axios for HTTP requests

**Backend:**
- Motor for async MongoDB operations
- Firebase Admin for server-side Firebase operations
- Pytest for testing
- Black, Flake8, MyPy for code quality

### Known Limitations

1. ~~Both Dashboard and User-App currently share identical code~~ — User-App is deprecated; real student app is React Native at `Documents/campus-safety-hub/`
2. Real-time push notifications (FCM) not yet implemented in student app
3. Sound alerts for emergencies pending
4. No real map library in student app (react-native-maps not installed)
5. Escort officer assignment is mocked (5-sec fake timer, not real API polling)
6. Dashboard ↔ Student App bridge requires Firebase service account key in campus backend `.env`

## Deployment

The application is configured for deployment on Emergent platform (as indicated by `.emergent/emergent.yml`). For other platforms:

1. **Frontend:** Build produces static files in `build/` directory
2. **Backend:** Can be deployed to any ASGI-compatible server
3. **Database:** Requires MongoDB instance
4. **Firebase:** Requires Firebase project configuration

## Additional Resources

- **PRD:** `Dashboard/memory/PRD.md` - Product Requirements Document
- **Design Guidelines:** `Dashboard/design_guidelines.json` - Complete design specification
- **Test Reports:** `Dashboard/test_reports/` - Historical test execution data
