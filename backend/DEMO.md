# How to run the wellness demo

You can run either **backend-only** (scores in the terminal) or the **full app** (browser UI).

---

## What you need first

- **Database** running (Postgres via Docker).
- **Backend `.env`** with `DATABASE_URL` and `MISTRAL_API_KEY` (see `backend/.env`).

---

## Option A: Backend-only (terminal)

No browser. One command prints scores and insights in the terminal.

### 1. Start the database

From the **project root** (folder that contains `docker-compose.yml`):

```bash
docker compose up db -d
```

### 2. Migrate (first time only)

```bash
cd backend
npx prisma migrate dev
```

### 3. Run the demo script

Still in **backend**:

```bash
npm run demo
```

You should see: “Demo user ready”, “Created 10 sample wearable data points”, “Calling AI (Mistral)…”, then **scores** and **insights** printed in the terminal.

---

## Option B: Full app (backend + frontend in browser)

Backend in one terminal, frontend in another, then use the UI.

### 1. Start the database

From the **project root**:

```bash
docker compose up db -d
```

### 2. Migrate (first time only)

```bash
cd backend
npx prisma migrate dev
```

### 3. (Optional) Seed demo users

In **backend**:

```bash
npx prisma db seed
```

Then you can log in as **Active Andy** or **Restless Sam** (see frontend login screen; password `DemoPass123!`).

### 4. Start the backend — **first terminal**

From the **project root**:

```bash
cd backend
npm run dev
```

Leave this running. You should see: “Wellness Intelligence API server running on port 3001”.

### 5. Start the frontend — **second terminal**

Open a **new terminal**. From the **project root**:

```bash
cd frontend
npm install
npm run dev
```

Leave this running. You should see the Vite dev server (e.g. “Local: http://localhost:3000”).

### 6. Open the app

In your browser go to **http://localhost:3000**.

- **Log in** (or use a demo user / register).
- On **Dashboard**: click **Add demo wearable data**, then **Run wellness analysis**.
- Check **Insights** and **Profile** in the nav.

---

## Summary

| Goal              | Steps                                                                 |
|-------------------|-----------------------------------------------------------------------|
| Terminal only     | `docker compose up db -d` → `cd backend` → `npx prisma migrate dev` → `npm run demo` |
| Full app in browser | Terminal 1: `cd backend` → `npm run dev`. Terminal 2: `cd frontend` → `npm install` → `npm run dev`. Then open http://localhost:3000 |
