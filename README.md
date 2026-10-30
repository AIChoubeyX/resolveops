# ResolveOps

ResolveOps is an AI-assisted support and technical incident management platform designed for small software engineering and operations teams. It bridges customer support workflows with technical incident operations by triaging incoming tickets, correlating known issues with technical runbooks, and preparing automated AI-suggested responses.

> **Project Phase:** Authentication and PostgreSQL (Phase 2).  
> The dashboard remains demo-data-only, while Firebase Authentication, protected API routes, PostgreSQL profiles/workspaces, and initial migrations are now available.

---

## Technologies Used

- **Frontend:**
  - [React 18](https://react.dev/) with [Vite](https://vitejs.dev/)
  - [React Router v6](https://reactrouter.com/) for single-page application routing
  - [Tailwind CSS v3](https://tailwindcss.com/) for a restrained, professional B2B SaaS interface
  - Plain reusable React components (no bloated UI component libraries)
- **Backend:**
  - [Node.js](https://nodejs.org/) (ES Modules)
  - [Express](https://expressjs.com/) for the REST API
  - `cors` and `express.json()` middleware
  - `dotenv` for configuration and environment variables
  - `firebase-admin` for ID-token verification
  - `pg` for PostgreSQL access
  - Node.js native test runner (`node:test`)
- **AI Worker (Placeholder):**
  - [Python 3](https://www.python.org/) with [FastAPI](https://fastapi.tiangolo.com/) and [Uvicorn](https://www.uvicorn.org/)
- **Monorepo / Orchestration:**
  - npm scripts with `concurrently` for running frontend and backend simultaneously on Windows

---

## Repository Structure

```text
resolveops/
├── frontend/                   # React + Vite frontend application
│   ├── src/
│   │   ├── assets/             # Static graphics, logos, and icons
│   │   ├── components/         # Reusable UI & layout elements
│   │   │   ├── layout/         # AppLayout, Sidebar, Navbar
│   │   │   └── ui/             # Badge, Button, Card, StatCard, DemoNotice
│   │   ├── pages/              # View components (Dashboard, Tickets, Detail, Knowledge, Settings)
│   │   ├── routes/             # AppRoutes (React Router definition)
│   │   ├── services/           # HTTP API client for backend health check
│   │   ├── hooks/              # Custom React hooks (e.g., useApiHealth)
│   │   ├── utils/              # Formatters and realistic mock datasets
│   │   ├── App.jsx             # Top-level BrowserRouter wrapper
│   │   ├── main.jsx            # React 18 DOM mount entry point
│   │   └── index.css           # Tailwind base styles and accessible focus states
│   ├── index.html              # HTML entry point with Inter font & SEO meta tags
│   ├── package.json            # Frontend scripts and dependencies
│   ├── vite.config.js          # Vite build config with /api reverse proxy
│   ├── tailwind.config.js      # Tailwind design system configuration
│   └── postcss.config.js       # PostCSS plugins for Tailwind
│
├── backend/                    # Express REST API backend
│   ├── src/
│   │   ├── config/             # Environment validation and configuration loader
│   │   ├── controllers/        # Request handlers (e.g., health.controller.js)
│   │   ├── middleware/         # 404 notFoundHandler and centralized errorHandler
│   │   ├── routes/             # API routing (e.g., health.routes.js)
│   │   ├── services/           # Business logic isolation (e.g., health.service.js)
│   │   ├── utils/              # Standardized API response formatters
│   │   ├── app.js              # Express app setup, middleware, and route mounting
│   │   └── server.js           # HTTP listener startup and graceful termination hooks
│   ├── tests/                  # Automated tests (Node native test runner)
│   ├── package.json            # Backend scripts and dependencies
│   ├── migrations/              # Versioned PostgreSQL schema migrations
│   ├── .env.example             # Environment variable template
│   └── .env                    # Local environment values (gitignored)
│
├── ai-worker/                  # Python background AI worker (Phase 1 placeholder)
│   ├── app/
│   │   ├── __init__.py         # Python package marker
│   │   └── main.py             # Minimal FastAPI application with GET /health
│   ├── requirements.txt        # Minimal Python dependencies (fastapi, uvicorn)
│   └── README.md               # Guide to setting up and running the AI worker
│
├── docs/                       # Architecture diagrams and specifications
│   └── architecture.md         # System design, data flow, and roadmap
│
├── .gitignore                  # Git exclusions for Node, Python, and environments
├── package.json                # Root package for running services concurrently
└── README.md                   # This project guide
```

---

## Current Status: Foundation vs. Placeholders

To maintain transparency during code reviews and interviews:

| Capability | Current Status | Notes |
|---|---|---|
| **Layout & Navigation** | Complete | Responsive sidebar, top navbar, active links, mobile drawer. |
| **Dashboard Metrics** | Demo Only | Labeled mock KPIs (14 Open, 3 Urgent, 28 Resolved, 5 AI jobs). |
| **Ticket Inbox** | Demo Only | Interactive client-side search & filtering over 6 realistic mock incident tickets. |
| **Ticket Creation** | Placeholder | Button opens an informational dialog describing the Phase 2 roadmap. |
| **Ticket Detail View** | Placeholder | Reads `:ticketId` dynamically and previews future AI suggested actions and comment threads. |
| **Knowledge Base** | Placeholder | Visual blueprint of runbook hierarchy and upcoming RAG vector search. |
| **Settings** | Placeholder | Mock configuration tabs (team, AI parameters, integrations). |
| **Express Server** | Complete | Decoupled app/server, environment loading, 404 handler, centralized error handler. |
| **GET /api/health** | Complete | Returns `{ status: "ok", service: "resolveops-api", timestamp, uptimeSeconds }`. |
| **AI Worker** | Foundation | Minimal FastAPI app with `GET /health` (no models or queues yet). |
| **Firebase Authentication** | Phase 2 | Email/password and Google sign-in with protected routes. |
| **PostgreSQL profiles/workspaces** | Phase 2 | Transactional first-login user and organization synchronization. |
| **Database & Auth** | Phase 2 | Tickets remain demo-only until the next phase. |

---

## Prerequisites

Ensure you have the following installed on your machine (Windows supported):
- **Node.js**: v18.0.0 or later (tested on v22.23.3)
- **npm**: v9.0.0 or later (tested on v10.9.9)
- **Python**: 3.10+ (tested on Python 3.14.2, needed only if running the AI worker)

---

## Installation & Setup Instructions

### 1. Install All Dependencies

From the project root (`c:\Desktop\resolveops`), run:

```powershell
npm run install:all
```

Alternatively, install each sub-project manually:

```powershell
# Root dependencies (concurrently)
npm install

# Backend dependencies (express, cors, dotenv)
npm --prefix backend install

# Frontend dependencies (react, react-router-dom, tailwindcss, vite)
npm --prefix frontend install
```

### 2. Configure Environment Variables

The backend uses a `.env` file for configuration. A template is provided at `backend/.env.example`.

Copy the example file:
```powershell
cp backend\.env.example backend\.env
```

Set these variables in `backend/.env`:
```ini
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://user:password@localhost:5432/resolveops
FIREBASE_SERVICE_ACCOUNT_PATH=C:\path\outside\repository\firebase-service-account.json
```

Copy `frontend/.env.example` to `frontend/.env.local` and fill in the web app configuration from Firebase Console. Firebase web configuration values are intended for the browser, but do not put service-account private keys in the frontend.

### Firebase project setup

1. Create or select a Firebase project and register a Web app.
2. In **Authentication > Sign-in method**, enable **Email/Password** and **Google**.
3. Copy the Web app values into `frontend/.env.local` (`VITE_FIREBASE_*`).
4. Create a Firebase service-account JSON in **Project settings > Service accounts**. Store it outside this repository and set `FIREBASE_SERVICE_ACCOUNT_PATH` to its absolute Windows path.

### PostgreSQL setup and migrations

Create an empty PostgreSQL database named `resolveops`, set `DATABASE_URL`, then apply the initial migration from PowerShell:

```powershell
npm --prefix backend run db:migrate
```

The migration command loads `DATABASE_URL` from `backend\.env` automatically. If you prefer `psql`, set the variable in the current PowerShell session first:

```powershell
$env:DATABASE_URL = 'postgresql://user:password@localhost:5432/resolveops'
psql $env:DATABASE_URL -f .\backend\migrations\001_initial_schema.sql
```

The migration creates users, organizations, memberships, tickets, comments, and ticket activity with foreign keys, indexes, and value constraints. Re-running it is safe. The Express backend uses the server-side PostgreSQL connection; the frontend never connects directly to Supabase.

### Ticket API

Authenticated ticket endpoints include:

- `GET /api/organizations`
- `GET /api/organizations/:organizationId/tickets`
- `POST /api/organizations/:organizationId/tickets`
- `GET /api/tickets/:ticketId`
- `PATCH /api/tickets/:ticketId`
- `GET|POST /api/tickets/:ticketId/comments`
- `GET /api/tickets/:ticketId/activity`
- `GET /api/organizations/:organizationId/metrics`

The backend verifies Firebase tokens, resolves them to `users.firebase_uid`, checks organization membership and role, and then performs parameterized PostgreSQL queries. The connected database role is `postgres` with RLS enabled on the inspected tables; no policies were returned by PostgreSQL, so authorization is currently enforced in Express and direct client access is not configured.

---

## Running the Application

### Option A: Run Frontend and Backend Together (Recommended)

From the project root:

```powershell
npm run dev
```

This starts:
- **Backend API:** `http://localhost:5000`
- **Frontend App:** `http://localhost:5173`

Both services stream color-coded logs to your terminal.

For separate terminals:

```powershell
Set-Location C:\Desktop\resolveops\backend
npm run dev
```

```powershell
Set-Location C:\Desktop\resolveops\frontend
npm run dev
```

### Authentication verification checklist

- Open `http://localhost:5173`; unauthenticated users are sent to `/login`.
- Test email/password signup, Google sign-in, logout, and a refresh with an active session.
- Confirm the first signup creates one user, one organization, and one `admin` membership.
- Confirm repeated refreshes/logins do not create another organization.
- Call the protected endpoint with a Firebase token only:

```powershell
$token = '<token from the signed-in Firebase user>'
Invoke-RestMethod http://localhost:5000/api/auth/me -Headers @{ Authorization = "Bearer $token" }
```

The dashboard sidebar reports Express API reachability separately from the genuine PostgreSQL query result.

---

### Option B: Run Services Independently

You can also run each service in separate terminal windows:

#### 1. Backend API:
```powershell
npm run dev:backend
# or
cd backend
npm run dev
```
Health check endpoint: `http://localhost:5000/api/health`

#### 2. Frontend React Client:
```powershell
npm run dev:frontend
# or
cd frontend
npm run dev
```
Open your browser to: `http://localhost:5173`

#### 3. AI Worker (Optional FastAPI Placeholder):
```powershell
cd ai-worker
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Health check endpoint: `http://localhost:8000/health`  
Interactive Swagger docs: `http://localhost:8000/docs`

---

## Testing & Quality Verification

Run backend unit tests:

```powershell
npm run test:backend
# or
cd backend
npm test
```

This runs `backend/tests/health.test.js` using Node.js's native test runner to verify:
- `GET /api/health` returns `200 OK` with valid status, service name, and timestamp.
- Unmapped routes return `404 Not Found` with standardized error JSON.

Build frontend for production:

```powershell
npm run build:frontend
# or
cd frontend
npm run build
```

---

## Architecture Overview

See [`docs/architecture.md`](docs/architecture.md) for the complete architecture diagram, data flow explanation, and future implementation roadmap.
