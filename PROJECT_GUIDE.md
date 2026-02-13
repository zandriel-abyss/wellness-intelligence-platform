# Wellness Intelligence Platform — Project Guide 

This document explains **what this project is**, **why it’s built this way**, and **what each part does**, in plain language.

---

## Part 1: What Is This Project?

### The idea

You have a **wearable** (watch, ring, band) that measures heart rate, sleep, steps, stress, and so on. The numbers alone are hard to interpret. This project is an **app** that:

1. **Accepts** that raw data (for now via a “demo” button that creates fake points).
2. **Summarizes** it (averages, trends over a few days).
3. **Sends** that summary to an **AI** (Mistral, a language model).
4. **Gets back** simple **scores** (e.g. overall 72/100, stress 65/100) and **short advice** (e.g. “Try more sleep” or “Consider mindfulness”).
5. **Shows** those scores and advice in a **web page** so a normal user can understand “how am I doing?” without reading spreadsheets.

So in one sentence: **the project turns wearable numbers into readable wellness scores and tips using an AI.**

It is **not** a medical device: it does not diagnose or treat. It’s for awareness and reflection.

---

## Part 2: The Big Picture — How the Pieces Fit

The project has three main “layers”:

1. **Database** — Stores users, their wearable data, the scores the AI produced, and the advice (insights). We use **PostgreSQL** (a standard database). The app never stores your data in the AI company’s systems beyond the one request we send.
2. **Backend (API)** — A **server** (Node.js + Express) that:
   - Handles **sign up / log in**.
   - **Saves** and **retrieves** wearable data and results.
   - When you click “Run wellness analysis,” it **calls the AI** (Mistral), then **saves** the scores and insights and **sends** them back to the browser.
3. **Frontend (website)** — A **single web app** (React, opened in the browser) where you log in, add demo data, click “Run wellness analysis,” and see scores and insights. It talks to the backend over HTTP (API calls).

There are also **docs** and **helper scripts** for running the app and deploying it. Below we go through every section and the important files.

---

## Part 3: Root Folder (Project Root)

This is the top folder of the project. Everything else lives inside it.

### Why these files exist

| File / folder | What it is | Why it’s needed |
|---------------|------------|------------------|
| **README.md** | Short project description and “Quick start” instructions. | First thing people see. Tells you how to run the app and where to find more detail (e.g. demo steps, deployment). |
| **DEPLOYMENT.md** | A short note that says “deployment guides are in the `docs/` folder.” | So anyone looking for “deployment” at the root is sent to the right place without duplicating long guides. |
| **.gitignore** | A list of file/folder names that Git should **not** track (e.g. `node_modules`, `.env`). | Keeps secrets (like API keys in `.env`) and heavy auto-generated folders out of the repository. |
| **package.json** (root) | Describes the **whole project** and has scripts like “run backend and frontend together.” | Lets you run both backend and frontend with one command from the root; also used by some tooling. |
| **package-lock.json** (root) | Lockfile for dependencies installed at the root. | Makes installs reproducible. |
| **docker-compose.yml** | A recipe that says: “Run a Postgres database, optionally Redis, the backend, and the frontend in containers.” | So you can start the **database** (and optionally everything else) with one command (`docker compose up db -d`) without installing Postgres on your machine. |
| **deploy-demo.sh** | A **script** that walks you through deploying the app (e.g. to Railway + Vercel). | Automates checks and steps so deployment is less error‑prone for someone doing it the first time. |
| **setup-production.sh** | A **script** that sets up production env files (e.g. `.env.production`) and reminds you to fill in database URL and Mistral key. | So production config is in one place and you don’t forget important variables. |
| **push-to-github.sh** | A **script** that helps you add the GitHub remote and push, and prints “next steps” (e.g. set Mistral key on Railway). | One-time helper for getting the code onto GitHub and knowing what to configure after. |
| **backend/** | The API server and everything it needs (database schema, AI logic, routes). | All “server-side” logic lives here so it’s one clear place. |
| **frontend/** | The website (pages, buttons, API calls to the backend). | All “user-facing” UI and browser logic lives here. |
| **docs/** | Extra documentation (deployment, Railway, Vercel). | Keeps long deployment guides out of the root and in one folder. |

---

## Part 4: Backend (The API Server)

The backend is the **brain** that talks to the database and to the AI. Every time the website needs to log you in, save data, or run the analysis, it sends a request to the backend; the backend does the work and answers.

### 4.1 Entry point and config

| File | What it does | Why it’s needed |
|------|----------------|-----------------|
| **src/server.ts** | **Starts the HTTP server** (listens on a port, e.g. 3001). Loads environment variables from `backend/.env`, then wires up security (CORS, rate limiting), logging, and all the **routes** (URLs like `/api/auth/login`, `/api/wellness/scores/process`). | Without this, there is no server. It’s the single place that “plugs in” all the pieces of the API. |
| **package.json** | Lists **dependencies** (e.g. Express, Prisma, Mistral SDK) and **scripts** (e.g. `npm run dev` to run the server, `npm run demo` to run the terminal demo). | So you can install and run the backend with standard commands. |
| **tsconfig.json** | Tells TypeScript how to compile the project (strict checks, output folder, etc.). | So the backend is written in TypeScript but still runs as JavaScript. |
| **.env** (you create this; not in Git) | Holds **secrets and config**: database URL, JWT secret, **MISTRAL_API_KEY**, etc. The server reads this at startup. | So we never put real keys or passwords in the code. |

### 4.2 Database: Prisma

The backend uses **Prisma** to talk to PostgreSQL. Prisma needs a **schema** (a description of tables) and **migrations** (the actual SQL that creates/updates those tables).

| File / folder | What it does | Why it’s needed |
|---------------|----------------|-----------------|
| **prisma/schema.prisma** | Defines **all tables**: User, WearableData, WellnessScore, Insight, Practitioner, Practice, Session, etc. It describes what columns each table has and how they link (e.g. “each WearableData belongs to one User”). | This is the single source of truth for “what does the database look like?” Prisma uses it to generate the client code and to create migrations. |
| **prisma/migrations/** | Contains **migration files** (SQL). Each migration applies a change (e.g. “create table users”, “add column X”). | So the database structure can evolve over time in a repeatable way on every environment (your machine, production). |
| **prisma/seed.ts** | A **script** that runs once to insert **demo users** and sample wearable data (e.g. “Active Andy” and “Restless Sam” with different fake metrics). | So someone can try the app without creating an account or adding data by hand; they just log in as a demo user. |
| **prisma.config.ts** | Tells Prisma where to find the schema file when running from the project root. | So commands like `npx prisma migrate` work from both the backend folder and the root. |

### 4.3 Routes (What URLs Do)

Each **route file** handles a group of URLs. For example, everything under `/api/auth` is in `auth.ts`.

| File | URLs it handles | What it does in plain words |
|------|------------------|-----------------------------|
| **routes/auth.ts** | Register, login, “who am I?”, logout. | Creates accounts, checks passwords, issues **tokens** (so the frontend can prove “I’m user X” on later requests). |
| **routes/users.ts** | Get/update the current user’s profile. | Lets the app show and edit name, email, goals, etc. |
| **routes/wearables.ts** | Connect a device, list connections, **ingest data** (e.g. heart rate, sleep), update/delete a connection. | Where **wearable data** is sent and stored. The “Add demo wearable data” button in the frontend calls the ingest endpoint. |
| **routes/wellness.ts** | Get scores, get latest scores, **run the AI analysis** (process), get insights, dashboard. | The most important for “wellness”: **process** loads the user’s recent wearable data, calls the AI, saves scores and insights, and returns them. The rest just read what’s already saved. |
| **routes/practitioners.ts** | List and get details of practitioners (e.g. yoga teachers). | For a future “find a practitioner” feature; the app is prepared for it. |
| **routes/practices.ts** | List and get wellness practices (e.g. meditation, breathing). | For recommending practices linked to insights; the app is prepared for it. |

### 4.4 The AI: aiProcessor

| File | What it does | Why it’s needed |
|------|----------------|-----------------|
| **services/aiProcessor.ts** | 1) Takes the user’s **wearable data**. 2) **Summarizes** it (e.g. average heart rate, sleep, steps, HRV, trend up/down). 3) Sends that summary to **Mistral** with a fixed **prompt** (“You are a wellness analyst; return JSON with scores and insights”). 4) Parses the AI’s **JSON** (scores 0–100, short explanations, 2 insights). 5) If the AI response is invalid, it **falls back** to a built‑in mock so the app still works. 6) **Saves** scores and insights to the database and returns them. | This is the only place the app uses “AI.” It’s where raw data becomes human‑readable scores and advice. The prompt and parsing are tuned so we get a stable structure (scores + insights) that the rest of the app can rely on. |

### 4.5 Middleware (Shared behavior)

| File | What it does | Why it’s needed |
|------|----------------|-----------------|
| **middleware/auth.ts** | For routes that require login: reads the **JWT** from the request (e.g. `Authorization: Bearer …`), checks it, and attaches the **user** to the request. If there’s no valid token, it returns “Not authorized.” | So only logged‑in users can add data, run analysis, or see their scores and insights. |
| **middleware/errorHandler.ts** | Catches errors thrown in any route and sends a **consistent JSON error** response (and can log or hide details in production). | So the frontend always gets a predictable error format and the API doesn’t leak stack traces. |
| **middleware/logger.ts** | Logs each request (method, URL, status, time). | So you can see in the terminal what the server is doing when you develop or debug. |

### 4.6 Scripts and docs (backend)

| File | What it does | Why it’s needed |
|------|----------------|-----------------|
| **scripts/demo-wellness.ts** | **Standalone demo**: creates a demo user and sample wearable data in the database, then calls the same **processWellnessData** function the API uses, and **prints** the scores and insights in the terminal. No browser needed. | So you can test “does the AI and database part work?” with one command (`npm run demo`) without starting the frontend. |
| **DEMO.md** | Step‑by‑step: how to run the **database**, the **backend**, and (optionally) the **frontend** in two terminals, plus the **terminal‑only** demo. | Single place for “how do I run this?” for both developers and non‑technical users. |
| **Dockerfile** | Instructions to build a **Docker image** for the backend (used by `docker-compose` if you run the full stack in containers). | So the backend can be run in a container when using Docker Compose. |

---

## Part 5: Frontend (The Website)

The frontend is the **only part** the end user sees. It’s a **single-page app**: one HTML page that loads JavaScript; that JavaScript then shows different “screens” (login, dashboard, insights, profile) without loading new pages from the server.

### 5.1 Build and config

| File | What it does | Why it’s needed |
|------|----------------|-----------------|
| **package.json** | Lists dependencies (React, etc.) and scripts: `npm run dev` (start dev server), `npm run build` (build for production). | So you can install and run the frontend like any Node project. |
| **vite.config.ts** | Configures **Vite** (the build tool): e.g. “forward `/api` to the backend at port 3001” so the frontend can call the API without CORS issues in development. | So in dev you open the site at one origin and all API calls still go to the backend. |
| **tsconfig.json** / **tsconfig.node.json** | TypeScript config for the app and for the Vite config file. | So the frontend is written in TypeScript and type‑checked. |
| **index.html** | The **single HTML file** that loads the app. It has a `<div id="root">` where React mounts. | Every frontend app needs one entry HTML; Vite uses this. |
| **.env.example** | Example env vars (e.g. optional `VITE_API_URL`). Real `.env` is not committed. | Documents what the frontend can configure (e.g. API URL in production). |

### 5.2 Source code (src/)

| File | What it does | Why it’s needed |
|------|----------------|-----------------|
| **main.tsx** | **Entry point**: renders the React app into the `#root` div in `index.html`. | So the browser loads one script and the app starts. |
| **App.tsx** | The **main component**: shows either the **login/register** screen or the **logged‑in** app. When logged in, it has a small **nav** (Dashboard, Insights, Profile) and shows the right “page” for each. On **Dashboard** you can “Add demo wearable data” and “Run wellness analysis,” and see the **result** (scores + insights). On **Insights** it loads and shows saved scores and insights from the API. On **Profile** it shows your email/name and a logout button. | This is the only “page” logic; everything the user can do in the UI is driven from here. |
| **api.ts** | **All calls to the backend**: login, register, logout, add demo wearable data, run wellness analysis, get profile, get insights, get latest scores. It reads the **token** from `localStorage` and sends it in the `Authorization` header for protected routes. | So the frontend doesn’t repeat fetch logic everywhere; one place knows the API base URL, token, and request shape. |
| **index.css** | **Global styles**: layout, cards, buttons, score cards, insights, nav, forms. | So the app looks consistent and readable without adding a big UI library. |
| **vite-env.d.ts** | Tells TypeScript about Vite’s special globals (e.g. `import.meta.env.VITE_*`). | So TypeScript doesn’t complain about env variables. |

### 5.3 Frontend README

| File | What it does | Why it’s needed |
|------|----------------|-----------------|
| **README.md** | Short instructions: how to run the backend, optionally seed demo users, then run the frontend and open the app. | Quick reference for anyone opening the frontend folder. |

---

## Part 6: Docs Folder

| File | What it does | Why it’s needed |
|------|----------------|-----------------|
| **docs/DEPLOYMENT.md** | **Overview** of production deployment: what env vars the backend and frontend need (database, Mistral, API URL), and links to the Railway and Vercel guides. | One place to see “what do I need to deploy?” before going to platform‑specific steps. |
| **docs/RAILWAY.md** | **Step‑by‑step**: deploy the **backend** on Railway (GitHub, root directory `backend`, build/start commands, env vars including **MISTRAL_API_KEY** and database). | So the API can run on a hosted server without you managing a machine. |
| **docs/VERCEL.md** | **Step‑by‑step**: deploy the **frontend** on Vercel (GitHub, root directory `frontend`, build command, **output directory `dist`**, env var **VITE_API_URL**). | So the website is hosted on a CDN and points at your backend URL. |

---

## Part 7: How It All Works Together (Flow)

1. **You start the database** (e.g. `docker compose up db -d`) so PostgreSQL is running.
2. **You start the backend** (`cd backend && npm run dev`). It loads `.env`, connects to the database, and listens on port 3001. Routes are ready.
3. **You start the frontend** (`cd frontend && npm run dev`). It serves the app (e.g. on port 3000) and proxies `/api` to the backend.
4. **You open the app** in the browser. You register or log in; the backend creates a user (or checks password) and returns a **token**. The frontend stores the token and sends it with every later request.
5. **You click “Add demo wearable data.”** The frontend calls `POST /api/wearables/data` several times with fake heart rate, sleep, steps, HRV, etc. The backend saves each row in the **wearable_data** table.
6. **You click “Run wellness analysis.”** The frontend calls `POST /api/wellness/scores/process`. The backend loads that user’s recent wearable data, **summarizes** it in **aiProcessor**, sends the summary to **Mistral**, gets back JSON (scores + insights), **saves** them in **wellness_scores** and **insights**, and returns them. The frontend shows the scores and insights on the page.
7. **Insights and Profile** pages just **read** from the API (latest scores, list of insights, current user) and display them.

So: **database** stores everything, **backend** does security and AI, **frontend** gives the user buttons and screens. The **docs** and **scripts** at the root and in backend/frontend tell you how to run and deploy all of that.

---

## Part 8: Why These Choices?

- **One backend, one frontend** — Clear split: “server that talks to DB and AI” vs “what the user sees.” Easy to develop and deploy separately.
- **PostgreSQL + Prisma** — Relational data (users, data points, scores, insights) fits tables; Prisma gives a type‑safe way to read/write from Node.
- **Mistral** — We need an AI that can follow a prompt and return structured JSON; Mistral is used so we’re not tied to a single provider and can swap later if needed.
- **React + Vite** — Simple UI (forms, a few screens); Vite is fast and the proxy in dev makes API calls straightforward.
- **JWT** — Stateless way to know “this request is from user X” without storing sessions on the server.
- **Docs in `docs/` and backend DEMO** — So “how do I run it?” and “how do I deploy it?” are in one place each, and the root README stays short.

---

That’s the whole project: **what it is, why each part exists, what the main files do, and how they work together**, in plain language.
