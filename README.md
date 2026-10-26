# 🚀 Flowgrid — Modern Full-Stack SaaS Workspace & Task Tracker

[![GitHub Repository](https://img.shields.io/badge/GitHub-rishiraj9701%2FFlowgrid-181717?style=flat&logo=github)](https://github.com/rishiraj9701/Flowgrid)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE.md)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![React 19](https://img.shields.io/badge/React-19.1-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-4169E1?style=flat&logo=postgresql)](https://neon.tech/)

An enterprise-grade, high-performance **Full-Stack Project & Task Management Web Application** built with **React 19**, **Vite**, **Redux Toolkit**, **Tailwind CSS v4**, and backed by **Node.js**, **Express**, **Prisma ORM**, and **PostgreSQL**.

Designed with a modern Linear/Jira-inspired aesthetic, Flowgrid features multi-tenant workspaces, interactive task boards, calendar scheduling, data analytics charts, team collaboration, persistent discussions, role-based authorization, and dual-mode operation (Offline Demo Mode & Authenticated Connected Mode).

---

## ✨ Key Features

- **🏢 Multi-Tenant Workspaces:**
  - Switch seamlessly between distinct organizations and departmental workspaces.
  - Workspace configuration: rename workspaces, update descriptions, and manage roles (`OWNER`, `ADMIN`, `MEMBER`).
  - Strict server-side data isolation ensuring users only access authorized workspaces.

- **📊 Comprehensive Project Management:**
  - Create and manage projects with custom priorities (`LOW`, `MEDIUM`, `HIGH`), statuses (`PLANNING`, `ACTIVE`, `ON_HOLD`, `COMPLETED`, `CANCELLED`), timelines, and progress tracking.
  - Real-time search by title or description and multi-parameter filtering.

- **📋 Interactive Task Board:**
  - Tasks categorized by type: `TASK`, `BUG`, `FEATURE`, `IMPROVEMENT`, `OTHER`.
  - Instant status transitions (`TODO` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `DONE`).
  - Atomic multi-select batch deletion with immediate feedback.
  - Responsive table layout on desktop and adaptive card view on mobile devices.

- **📅 Deadlines & Task Calendar:**
  - Interactive month view with day-of-week grid alignment.
  - Filter tasks by scheduled due dates, with real-time indicators for overdue milestones.
  - Clickable calendar task items routing directly to task details.

- **📈 Visual Analytics & Metrics (Recharts):**
  - Live completion rate radial calculations.
  - Status distribution bar charts and issue-type pie charts with interactive tooltips.
  - Priority breakdown bars with zero-division safety on empty projects.

- **💬 Task Discussions & Comments:**
  - Task detail inspection with assignee details, due dates, and status badges.
  - Interactive discussion comments stream with authenticated user identification.

- **🔍 Global Search (`Ctrl+K` / `Cmd+K`):**
  - Instant live search in Navbar across all projects and tasks in the active workspace.
  - Keyboard navigation, clear buttons, and direct result navigation.

- **🔐 Secure Authentication & Role Authorization:**
  - User registration and login with bcrypt password hashing (work factor 10) and JWT bearer authentication.
  - Role-based authorization (`OWNER`, `ADMIN`, `MEMBER`) enforced on the server.
  - IDOR protection verifying parent-child resource hierarchy (`Workspace` $\rightarrow$ `Project` $\rightarrow$ `Task` $\rightarrow$ `Comment`).

- **🌓 Dark & Light Modes:**
  - Seamless theme toggling with smooth transitions and preference persistence in `localStorage`.

- **💾 Dual-Mode Operation (Demo Mode & Server Mode):**
  - **Offline Demo Mode:** Explore all features instantly without registration or server setup. All changes persist in browser `localStorage` (`pm_workspaces_data`).
  - **Authenticated Server Mode:** Sign in to connect to the live Express and PostgreSQL backend. Database becomes the single source of truth.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19, Vite 7 |
| **State Management** | Redux Toolkit (`@reduxjs/toolkit`), React-Redux |
| **Routing** | React Router DOM v7 (with lazy-loaded route code splitting) |
| **Styling** | Tailwind CSS v4, `@tailwindcss/vite`, Radix UI |
| **Data Visualization** | Recharts v3 |
| **Date Utilities** | date-fns v4 |
| **Backend Runtime** | Node.js (ESM), Express.js |
| **Database & ORM** | PostgreSQL, Prisma ORM (`@prisma/client`, `prisma`) |
| **Authentication & Security** | JWT (`jsonwebtoken`), bcryptjs, Zod schema validation, express-rate-limit |
| **Testing** | Node.js Test Runner (`node:test`), Supertest |

---

## 📁 Project Architecture & Directory Structure

```
Flowgrid/
├── package.json                 # Root scripts for frontend and server
├── vite.config.js               # Vite config with React, Tailwind v4, proxy & chunk splitting
├── index.html                   # HTML template with metadata & OpenGraph tags
├── jsconfig.json                # Path mapping configuration
├── server/                      # Dedicated Express + Prisma backend
│   ├── package.json             # Server dependencies & scripts
│   ├── .env.example             # Backend environment template
│   ├── prisma/
│   │   ├── schema.prisma        # PostgreSQL relational schema
│   │   ├── migrations/          # Version-controlled migrations
│   │   └── seed.js              # Idempotent demo dataset seeder
│   ├── src/
│   │   ├── app.js               # Express application configuration & route mounts
│   │   ├── index.js             # HTTP listener & graceful shutdown
│   │   ├── config/              # Zod env parsing & Prisma client singleton
│   │   ├── middleware/          # JWT auth, role authorization, and error handling
│   │   ├── controllers/         # Auth, workspace, member, project, task, and comment handlers
│   │   ├── routes/              # Express API routers
│   │   └── utils/               # Password hashing, JWT signing, user sanitization
│   └── tests/
│       ├── app.test.js          # Foundation tests
│       ├── auth.test.js         # Authentication & authorization tests
│       └── api.test.js          # Core REST API & IDOR protection tests
└── src/                         # React frontend
    ├── App.jsx                  # Main route switch with lazy loading & auth restore
    ├── main.jsx                 # React root entrypoint
    ├── index.css                # Global Tailwind CSS styles
    ├── services/
    │   └── api.js               # Centralized Fetch API client with bearer token
    ├── features/
    │   ├── authSlice.js         # Authentication state & login/register thunks
    │   ├── workspaceSlice.js    # Smart thunks (Demo + Live API) & LocalStorage fallback
    │   └── themeSlice.js        # Dark/light theme state
    ├── components/
    │   ├── Navbar.jsx           # Top navbar with search, theme switch & AuthDialog trigger
    │   ├── Sidebar.jsx          # Collapsible navigation drawer
    │   ├── AuthDialog.jsx       # Sign In / Create Account modal
    │   ├── WorkspaceDropdown.jsx# Active workspace selector
    │   ├── WorkspaceSettingsDialog.jsx # Settings modal & data reset
    │   ├── DashboardMetrics.jsx # KPI statistics and overview metrics
    │   ├── DashboardReminders.jsx # Deadlines, urgent tasks, and meetings
    │   ├── ProjectsList.jsx     # High-priority active projects list
    │   ├── TeamCollaboration.jsx# Quick team presence and communication
    │   ├── TimeTracker.jsx      # Interactive sprint/work session tracker
    │   ├── ProjectTasks.jsx     # Task management table with instant status updates
    │   └── ui/                  # Accessible Radix UI design primitives
    └── pages/
        ├── Landing.jsx          # High-converting product landing page
        ├── Dashboard.jsx        # Workspace dashboard overview
        ├── Projects.jsx         # Project directory & creation
        ├── ProjectDetails.jsx   # Project view: Tasks, Calendar, Analytics, Settings
        ├── Tasks.jsx            # Cross-project workspace task manager
        ├── TaskDetails.jsx      # Task detail view with live discussion comments
        ├── Calendar.jsx         # Full-page workspace calendar view
        ├── Analytics.jsx        # Dedicated analytics and metrics dashboard
        ├── Team.jsx             # Team member directory and invitations
        ├── Settings.jsx         # Workspace and profile configurations
        └── Help.jsx             # Documentation, FAQs, and support center
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher recommended, tested on Node v24)
- npm (v10+ or higher)
- PostgreSQL database (Optional for demo mode; required for live server mode)

### 1. Installation

Install frontend dependencies:
```bash
npm install
```

Install backend dependencies:
```bash
cd server && npm install && cd ..
```

---

## ⚙️ Environment Configuration

1. In the `server/` directory, copy `.env.example` to `.env`:
   ```bash
   cp server/.env.example server/.env
   ```

2. Configure environment variables in `server/.env`:
   ```env
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/project_management?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"
   NODE_ENV=development
   ```

*(Note: For offline demo mode, no database configuration is required; the frontend will seamlessly use browser LocalStorage).*

---

## 🗄️ Database Setup & Seeding (When PostgreSQL is Available)

1. **Generate Prisma Client:**
   ```bash
   npm run prisma:generate
   ```

2. **Run Migrations:**
   ```bash
   cd server && npm run prisma:migrate && cd ..
   ```

3. **Seed Demo Data (Idempotent):**
   ```bash
   cd server && npm run prisma:seed && cd ..
   ```
   *Seeded demo users:*
   - `alexsmith@example.com` (Password: `Password123!`)
   - `johnwarrel@example.com` (Password: `Password123!`)
   - `oliverwatts@example.com` (Password: `Password123!`)

---

## 🏃 Running the Application

### Option A: Run Full-Stack (Frontend + Backend)

Start the backend server:
```bash
npm run dev:server
```
*(Runs on `http://localhost:5000` with health check at `/api/health`)*

In a second terminal, start the frontend:
```bash
npm run dev
```
*(Runs on `http://localhost:5173` with automatic API proxying)*

### Option B: Run Frontend in Offline Demo Mode

```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173). The application will automatically operate in **Offline Demo Mode** with pre-populated workspaces, tasks, and analytics.

---

## 📜 Available Scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `npm run dev` | Boots local Vite development server with HMR |
| `dev:server` | `npm run dev:server` | Boots Express API server with file watching |
| `build` | `npm run build` | Compiles optimized production bundle with chunk splitting |
| `lint` | `npm run lint` | Runs ESLint across frontend and backend code |
| `test:server` | `npm run test:server` | Runs backend test suite (38 automated tests) |
| `prisma:validate` | `npm run prisma:validate` | Validates Prisma schema syntax |
| `prisma:generate` | `npm run prisma:generate` | Generates `@prisma/client` bindings |

---

## 🧪 Testing & Verification

Run the automated backend test suite covering authentication, authorization, role permissions, and REST APIs:
```bash
npm run test:server
```
*Result: 38 passing tests across Foundation, Authentication, and Core REST API suites.*

Run the linter:
```bash
npm run lint
```
*Result: 0 errors, 0 warnings.*

Run production build check:
```bash
npm run build
```
*Result: Successfully built with zero chunk size warnings.*

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE.md).
