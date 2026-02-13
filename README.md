# Wellness Intelligence Platform

An AI-powered wellness platform that turns wearable data (heart rate, sleep, activity, HRV) into **wellness scores** and **actionable insights**. Non-medical, for research and prototyping.

## What it does

- **Ingest** wearable data (demo or future device integrations).
- **Analyze** with **Mistral** (LLM) to produce scores (overall, stress, sleep, energy) and insights.
- **Show** results in a simple web app: Dashboard, Insights, Profile.

**Stack:** Backend (Node.js, Express, Prisma, PostgreSQL, Mistral), Frontend (Vite, React, TypeScript).

---

## Quick start

**Run the app locally (backend + frontend):**

1. **Database:** from project root, `docker compose up db -d`
2. **Backend:** `cd backend && npx prisma migrate dev && npm run dev` (leave running)
3. **Frontend:** in a second terminal, `cd frontend && npm install && npm run dev`
4. Open **http://localhost:3000** — register or use a demo user, add demo data, run wellness analysis.

**Terminal-only demo (no browser):** `cd backend && npm run demo`

Full step-by-step: **[backend/DEMO.md](backend/DEMO.md)**.

---

## Documentation

| Doc | Description |
|-----|-------------|
| [backend/DEMO.md](backend/DEMO.md) | How to run the demo (terminal-only or full app, two terminals) |
| [frontend/README.md](frontend/README.md) | Frontend setup and run |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Production deployment overview |
| [docs/RAILWAY.md](docs/RAILWAY.md) | Deploy backend on Railway |
| [docs/VERCEL.md](docs/VERCEL.md) | Deploy frontend on Vercel |

---

## Project layout

```
├── backend/          # Express API, Prisma, Mistral AI
│   ├── prisma/       # Schema, migrations, seed (2 demo users)
│   ├── scripts/      # demo-wellness.ts (terminal demo)
│   └── src/          # Routes, services (aiProcessor), middleware
├── frontend/         # Vite + React SPA (Dashboard, Insights, Profile)
├── docs/             # Deployment guides
├── docker-compose.yml
└── README.md
```

## Configuration

- **Backend:** `backend/.env` — `DATABASE_URL`, `JWT_SECRET`, `MISTRAL_API_KEY`, `MISTRAL_MODEL`. See `backend/DEMO.md`.
- **Frontend:** optional `frontend/.env` — `VITE_API_URL` (defaults to proxy to backend in dev).

## API (main)

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `POST /api/wearables/data` — ingest wearable data
- `POST /api/wellness/scores/process` — run AI analysis (Mistral)
- `GET /api/wellness/scores/latest`, `GET /api/wellness/insights`

---

## License

MIT.
