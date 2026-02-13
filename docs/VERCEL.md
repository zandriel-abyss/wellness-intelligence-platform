# Deploy frontend to Vercel

The frontend is **Vite + React**. Build output is `dist` (not `build`).

## Steps

1. **Create account** at [vercel.com](https://vercel.com) (e.g. sign in with GitHub).

2. **New project** → Import Git repository → select `zandriel-abyss/wellness-intelligence-platform`.

3. **Configure**
   - **Root directory**: `frontend`
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
   - **Install**: `npm install`

4. **Environment variable**
   - `VITE_API_URL` = your backend URL (e.g. `https://your-app.railway.app`)

5. **Deploy**. Vercel will give you a URL like `https://your-project.vercel.app`.

6. **Backend CORS**: In Railway (or your backend host), set `FRONTEND_URL` to this Vercel URL and redeploy.

---

Your app is live. Register, add demo data, run wellness analysis, and view insights.
