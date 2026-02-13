# Getting started (from a fresh download or clone)

Use this guide if you **just downloaded the zip** or **cloned the repo** and want to run the app from zero. Follow the steps in order.

---

## One-command launch (optional)

If you prefer a **single script** that sets up and starts everything:

- **Mac / Linux:** From the project root, run:
  ```bash
  chmod +x start.sh   # only needed once
  ./start.sh
  ```
- **Windows:** Double-click **`start.bat`** or run it from Command Prompt in the project root.

The script will: create `backend/.env` from the example if missing, install dependencies, start the database, run migrations, optionally seed demo users, then start backend and frontend and open the browser. Press **Ctrl+C** (or close the window on Windows) to stop.

If you prefer to do each step yourself, continue with the sections below.

---

## Prerequisites

Install these **before** you start:

| What | Why | How to check |
|------|-----|----------------|
| **Node.js 18 or newer** | Backend and frontend run on Node. | Open a terminal and run: `node -v`. You should see something like `v20.x.x` or `v18.x.x`. If not, install from [nodejs.org](https://nodejs.org). |
| **npm** | Comes with Node; used to install dependencies and run scripts. | Run: `npm -v`. |
| **Docker Desktop** (or Docker Engine) | Used to run PostgreSQL in one command so you don’t have to install Postgres yourself. | Run: `docker --version`. If you prefer to install Postgres directly, see the note at the end. |
| **Mistral API key** (optional but recommended) | The app uses Mistral for real wellness analysis. Without a valid key, it falls back to **mock** (fixed) scores and insights. | Sign up at [console.mistral.ai](https://console.mistral.ai) and create an API key. You’ll add it in Step 2. |

**Unzip** the project (if you downloaded a zip) so you have a folder like `wellness-intelligence-platform-main`. All commands below assume you’re in that folder or its subfolders.

---

## Step 1: Create the backend environment file

The backend needs a `.env` file with database URL and optional Mistral key. **This file is not in the repo** (for security), so you must create it once.

1. Open the **backend** folder.
2. Copy the example env file:
   - **Mac/Linux:** in a terminal, from the **project root** (the folder that contains `backend` and `frontend`):
     ```bash
     cp backend/.env.example backend/.env
     ```
   - **Windows (Command Prompt):** from the project root:
     ```bash
     copy backend\.env.example backend\.env
     ```
3. **(Optional)** If you have a **Mistral API key**, open `backend/.env` in a text editor and replace the line:
   ```env
   MISTRAL_API_KEY=sk-test-placeholder-key-for-development
   ```
   with your real key. Save the file.

If you skip the Mistral key, the app still runs but will show **mock** scores instead of AI-generated ones.

---

## Step 2: Install dependencies

From the **project root** folder, run:

```bash
cd backend
npm install
cd ../frontend
npm install
cd ..
```

You only need to do this once (or after pulling big changes).

---

## Step 3: Start the database

From the **project root** (the folder that contains `docker-compose.yml`):

```bash
docker compose up db -d
```

This starts PostgreSQL in the background. Wait a few seconds. To check it’s running:

```bash
docker compose ps
```

You should see a container for `db` with status “Up” and port `5432`.

---

## Step 4: Create database tables (first time only)

From the **project root**:

```bash
cd backend
npx prisma migrate dev
cd ..
```

When prompted for a migration name you can press Enter. This creates the tables (users, wearable data, scores, insights, etc.) in the database.

---

## Step 5 (optional): Add demo users

If you want to log in as **Active Andy** or **Restless Sam** (pre-loaded with different demo data), run once:

```bash
cd backend
npx prisma db seed
cd ..
```

Password for both demo users: **`DemoPass123!`**  
Emails: `demo-active@wellness-demo.local` and `demo-restless@wellness-demo.local`.

---

## Step 6: Start the backend (first terminal)

Open a **terminal**. From the **project root**:

```bash
cd backend
npm run dev
```

Leave this running. You should see:

```text
Wellness Intelligence API server running on port 3001
Environment: development
```

If you see “Can’t reach database server”, the database isn’t running or `backend/.env` has the wrong `DATABASE_URL`. Check Step 1 and Step 3.

---

## Step 7: Start the frontend (second terminal)

Open a **second terminal**. From the **project root**:

```bash
cd frontend
npm run dev
```

Leave this running. You should see something like:

```text
  Local:   http://localhost:3000/
```

---

## Step 8: Open the app in your browser

1. Go to **http://localhost:3000**
2. Either:
   - **Register** a new account (email + password), or  
   - **Log in** as a demo user (if you ran the seed in Step 5): e.g. `demo-active@wellness-demo.local` / `DemoPass123!`
3. On the **Dashboard**: click **Add demo wearable data**, then **Run wellness analysis**.
4. You should see scores (overall, stress, sleep, energy) and short insights. Use **Insights** and **Profile** in the nav to explore.

---

## Quick checklist (copy-paste order)

From a **fresh** project folder, in order:

1. `cp backend/.env.example backend/.env` (then optionally edit `backend/.env` and add your Mistral key)
2. `cd backend && npm install && cd ../frontend && npm install && cd ..`
3. `docker compose up db -d`
4. `cd backend && npx prisma migrate dev && cd ..`
5. (Optional) `cd backend && npx prisma db seed && cd ..`
6. **Terminal 1:** `cd backend && npm run dev`
7. **Terminal 2:** `cd frontend && npm run dev`
8. Open **http://localhost:3000** in your browser

---

## If something doesn’t work

- **“Can’t reach database server”**  
  - Start the DB: `docker compose up db -d` from the project root.  
  - Ensure `backend/.env` has `DATABASE_URL=postgresql://wellness_user:wellness_password@localhost:5432/wellness_db` (same as in `docker-compose.yml`).

- **“Not authorized” or 401 on login**  
  - Register a new user, or run the seed (Step 5) and use a demo user with password `DemoPass123!`.

- **“No recent wearable data found” when running analysis**  
  - Click **Add demo wearable data** on the Dashboard first, then **Run wellness analysis**.

- **Port 3001 or 3000 already in use**  
  - Another app is using that port. Stop it or change `PORT` in `backend/.env` (backend) or in `frontend/vite.config.ts` (frontend).

- **No Docker / I use my own Postgres**  
  - Install PostgreSQL and create a database (e.g. `wellness_db`).  
  - In `backend/.env`, set `DATABASE_URL` to your connection string, e.g. `postgresql://USER:PASSWORD@localhost:5432/wellness_db`.  
  - Then run `npx prisma migrate dev` from the `backend` folder and continue from Step 6.

---

## Terminal-only demo (no browser)

If you only want to see the AI output in the terminal (no frontend):

1. Do Steps 1–4 (create `.env`, install backend deps, start DB, run migrations).
2. From the project root:  
   `cd backend && npm run demo`  
   You should see “Demo user ready”, “Created 10 sample wearable data points”, “Calling AI (Mistral)…”, then scores and insights printed.

For the full app in the browser, use Steps 1–8 above.
