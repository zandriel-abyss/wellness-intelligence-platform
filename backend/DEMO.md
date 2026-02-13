# How to run the wellness AI demo (layman-friendly)

This demo creates **fake wearable data** (heart rate, sleep, steps, stress), sends it to the **AI (Mistral)**, and prints your **wellness scores and insights** in plain language.

## What you need

1. **Database running** (e.g. Postgres via Docker).
2. **Backend `.env`** with `DATABASE_URL` and `MISTRAL_API_KEY` (see `backend/.env`).

## Steps

### 1. Start the database (if not already running)

From the **project root** (folder that contains `docker-compose.yml`):

```bash
docker compose up db -d
```

### 2. Apply database migrations (first time only)

```bash
cd backend
npx prisma migrate dev
```

### 3. Run the demo

From the **backend** folder:

```bash
npm run demo
```

You should see:

- “Demo user ready”
- “Created 10 sample wearable data points”
- “Calling AI (Mistral)…”
- Then a simple report: **scores** (overall, stress, sleep, energy) and **insights** with short suggestions.

No browser, no API calls by hand—just one command and the result in the terminal.
