# Wellness Intelligence – Frontend (Option B)

Single-page app with **Dashboard**, **Insights**, and **Profile**. Log in → add demo data → run AI analysis → see scores and insights.

## Run locally

1. **Backend** (with DB and Mistral):
   ```bash
   docker compose up db -d
   cd backend && npx prisma migrate dev && npm run dev
   ```

2. **(Optional) Seed 2 demo users** with different wellness profiles:
   ```bash
   cd backend && npx prisma db seed
   ```
   Then log in as **Active Andy** (demo-active@wellness-demo.local) or **Restless Sam** (demo-restless@wellness-demo.local), password `DemoPass123!`.

3. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Open **http://localhost:3000**. Use demo logins or register. **Dashboard**: add demo wearable data (~24 points over 5 days), then **Run wellness analysis**. **Insights**: view latest scores and saved insights. **Profile**: see account and log out.

API calls go to the backend via Vite’s proxy (`/api` → `http://localhost:3001`).
