# ExpenseFlow AI

**Smart Expense Splitting Made Beautiful.**

A production-quality expense-splitting platform inspired by Splitwise, rebuilt as a modern SaaS product — dark-themed, animated, and powered by a custom **Smart Settlement Engine** that collapses tangled group debts into the minimum number of payments required to settle everyone up.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [MongoDB Setup](#mongodb-setup)
- [Running Locally](#running-locally)
- [Deployment](#deployment)
- [API Overview](#api-overview)
- [Known Limitations](#known-limitations)
- [Future Improvements](#future-improvements)

---

## Features

**Authentication** — Register/login/logout, JWT in httpOnly cookies with silent refresh, forgot/reset password via email, role-based access (user/admin).

**Groups** — Create/edit/delete, image upload, invite by email or shareable code, member roles (owner/admin/member), pin favorites, transfer ownership.

**Expenses** — Add/edit/delete with receipt upload, 8 categories, 4 split types (equal/unequal/percentage/shares) with a **live client-side split calculator**, search/filter/sort/pagination, CSV export.

**Smart Settlement Engine** — A greedy min-cash-flow algorithm that computes the fewest possible transactions to settle a group's debts (e.g. a 4-person chain of debts collapses into a single payment). Fully unit-verified for balance conservation.

**Analytics** — Monthly/weekly spending trends, category breakdowns, top contributors, all via MongoDB aggregation pipelines (not client-side computation).

**Smart Insights** — Rule-based (no external AI API) insights: highest spending month, largest expense, most active member, a computed Financial Health Score (weighted debt ratio + settlement promptness + spending consistency), and budget suggestions.

**Notifications & Activity** — Real-time-feeling notification bell with unread counts, full notification center, and a per-group activity timeline.

**Admin Panel** — Platform-wide stats, user suspension, group oversight, global settings toggles.

**Premium UX** — Framer Motion throughout, a command palette (⌘K), confetti on settlement confirmation, skeleton loaders, glassmorphism, animated landing page with a custom SVG visualization of the settlement engine.

---

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router, Axios, TanStack Query, React Hook Form, Framer Motion, Recharts, React Hot Toast, Lucide Icons

**Backend:** Node.js, Express.js, MongoDB, Mongoose

**Security:** JWT + httpOnly cookies, bcryptjs, Helmet, CORS, express-rate-limit, custom NoSQL-injection sanitizer, XSS protection

---

## Project Structure

```
expenseflow-ai/
├── backend/
│   ├── config/          # DB connection
│   ├── constants/        # Enums (roles, categories, statuses)
│   ├── controllers/      # Request handlers (no business logic)
│   ├── middleware/        # Auth, error handling, validation, uploads
│   ├── models/            # 10 Mongoose schemas
│   ├── routes/            # REST endpoints
│   ├── services/          # Business logic (split calc, settlement engine, insights, analytics)
│   ├── validators/         # express-validator chains
│   ├── utils/              # AppError, catchAsync, token service, CSV-safe response shape
│   ├── uploads/            # User-uploaded files (avatars, group images, receipts)
│   ├── app.js
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/    # ui/, layout/, landing/, dashboard/, groups/, expenses/, analytics/
    │   ├── context/        # AuthContext, ThemeContext
    │   ├── layouts/         # AuthLayout, DashboardLayout
    │   ├── pages/            # Route-level pages
    │   ├── routes/            # Route guards (Protected/PublicOnly/Admin)
    │   ├── services/          # Axios instance + endpoint functions
    │   └── utils/              # Split calculator, CSV export, confetti
    └── vite.config.js
```

---

## Prerequisites

- Node.js 18+
- A MongoDB database — either:
  - A free [MongoDB Atlas](https://mongodb.com/atlas) cluster (recommended, no local install), or
  - MongoDB installed locally

---

## Local Setup

```bash
# 1. Clone or unzip the project, then:
cd expenseflow-ai/backend
npm install
cp .env.example .env
# → fill in .env (see Environment Variables below)

cd ../frontend
npm install
cp .env.example .env
# → leave VITE_API_URL blank for local dev (Vite proxies /api automatically)
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `NODE_ENV` | `development` or `production` |
| `PORT` | Backend port (default `5000`) |
| `CLIENT_URL` | Your frontend's URL — used for CORS. Must match exactly (including protocol) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Two **different** long random strings. Generate with:<br>`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JWT_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | Token lifetimes (e.g. `7d`, `30d`) |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | For password-reset and invite emails. Optional in dev — emails just log an error if unset, without crashing the server |
| `RATE_LIMIT_WINDOW_MINUTES` / `RATE_LIMIT_MAX_REQUESTS` | API rate limiting |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Leave blank in local dev. In production, set to your deployed backend's full API URL, e.g. `https://your-backend.onrender.com/api/v1` |

---

## MongoDB Setup

**Option A — MongoDB Atlas (recommended):**
1. Create a free M0 cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Database Access → create a user with a simple alphanumeric password (avoid `@ / # % :`, they break connection strings)
3. Network Access → Add IP Address → Allow Access from Anywhere (`0.0.0.0/0`) for development
4. Connect → Drivers → copy the connection string into `MONGO_URI`, adding your database name before the `?`:
   ```
   MONGO_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/expenseflow-ai?retryWrites=true&w=majority
   ```
   If your network blocks the `mongodb+srv://` DNS lookup, toggle "Legacy URI String" in the Atlas connect dialog for a standard (non-SRV) connection string instead.

**Option B — Local MongoDB:** install MongoDB Community Server; it runs on `mongodb://127.0.0.1:27017` by default, matching `.env.example`.

---

## Running Locally

You need **two terminals running simultaneously**:

```bash
# Terminal 1
cd backend
npm run dev
# → 🚀 ExpenseFlow AI API running on port 5000

# Terminal 2
cd frontend
npm run dev
# → Local: http://localhost:5173
```

Visit `http://localhost:5173`. Verify the backend independently at `http://localhost:5000/api/v1/health`.

---

## Deployment

### Backend → Render (or Railway/Fly.io — same idea)

1. Push the `backend` folder to a GitHub repo
2. Create a new **Web Service** on [render.com](https://render.com), connect the repo
3. Build command: `npm install` · Start command: `npm start`
4. Add all variables from your `.env` in Render's Environment tab — **use your production `CLIENT_URL`** (your deployed frontend's URL, added after step below) and a fresh, different `JWT_SECRET`/`JWT_REFRESH_SECRET` than local dev
5. Set `NODE_ENV=production`
6. Deploy — note the resulting URL, e.g. `https://expenseflow-ai-backend.onrender.com`

### Frontend → Vercel (or Netlify)

1. Push the `frontend` folder to a GitHub repo
2. Import into [vercel.com](https://vercel.com) — it auto-detects Vite
3. Add environment variable `VITE_API_URL` = `https://expenseflow-ai-backend.onrender.com/api/v1` (your Render URL + `/api/v1`)
4. Deploy — note the resulting URL, e.g. `https://expenseflow-ai.vercel.app`

### Final step — close the loop

Go back to your **Render backend's** environment variables and set:
```
CLIENT_URL=https://expenseflow-ai.vercel.app
```
then redeploy the backend. This is required for CORS and secure cookies to work — the backend only accepts credentialed requests from the exact origin listed in `CLIENT_URL`.

### Post-deploy checklist
- [ ] Backend `/api/v1/health` returns `{"success":true,...}`
- [ ] Frontend loads and registration/login works (check browser Network tab for CORS errors if not)
- [ ] Cookies are being set (check Application → Cookies in DevTools after login)
- [ ] MongoDB Atlas Network Access allows Render's IPs (or is set to `0.0.0.0/0`)

---

## API Overview

All endpoints are prefixed `/api/v1`. Auth uses httpOnly cookies — no manual token handling needed from the frontend.

| Resource | Base path |
|---|---|
| Auth | `/auth` — register, login, logout, me, refresh, forgot/reset/update password |
| Users | `/users` — profile, favorites, delete account |
| Groups | `/groups` — CRUD, invites, members, pin |
| Expenses | `/expenses` — CRUD, group listing with search/filter/pagination |
| Settlements | `/settlements` — balances, smart suggestions, record/confirm payments |
| Notifications | `/notifications` — list, mark read, delete |
| Analytics | `/analytics` — monthly/weekly/category/heatmap/top-contributors |
| Insights | `/insights` — smart insight cards, financial health score |
| Activity | `/activity` — per-group activity timeline |
| Admin | `/admin` — platform stats, user/group management, settings *(requires admin role)* |
| Invitations | `/invitations` — accept/decline email invites |

All responses follow a consistent shape:
```json
{ "success": true, "message": "...", "data": {...}, "meta": { "pagination": {...} } }
```

---

## Known Limitations

- **Light mode toggle is currently non-functional.** The design system was built dark-first per spec; the toggle button exists but no light-mode color tokens have been implemented yet. This is planned as a dedicated follow-up.
- Multi-currency conversion is not implemented — each group has one currency; cross-group dashboard totals assume a shared unit.
- Real-time updates (e.g. a teammate adding an expense) require a page refresh or React Query's background refetch — there is no WebSocket layer.

## Future Improvements

- Full light-mode design system
- WebSocket-based live updates for group activity
- PDF report generation and printable statements
- Expense calendar heatmap visualization (backend endpoint already exists, not yet surfaced in the UI)
- Recurring expenses
- Multi-currency conversion with live exchange rates
