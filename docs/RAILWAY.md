# Deploy backend to Railway

## Steps

1. **Create account** at [railway.app](https://railway.app) (e.g. sign in with GitHub).

2. **New project** → Deploy from GitHub → select `zandriel-abyss/wellness-intelligence-platform`.

3. **Configure service**
   - **Root directory**: `backend`
   - **Build**: `npm install && npx prisma generate && npm run build`
   - **Start**: `npm start`

4. **Variables** (Railway project → Variables):

   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secret-jwt-key-32-chars-minimum
   MISTRAL_API_KEY=your-mistral-api-key
   MISTRAL_MODEL=mistral-large-latest
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```

   Add **PostgreSQL** in the project (New → Database → PostgreSQL). Railway sets `DATABASE_URL` automatically.

5. **Deploy**. After deploy, run migrations once (Railway CLI or one-off run):
   `npx prisma migrate deploy`

6. Copy your backend URL (e.g. `https://your-app.railway.app`) and use it as `VITE_API_URL` when deploying the frontend (Vercel).

---

Next: [Deploy frontend to Vercel](VERCEL.md).
