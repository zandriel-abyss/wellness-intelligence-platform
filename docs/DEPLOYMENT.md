# Production deployment

Deploy backend (e.g. Railway) and frontend (e.g. Vercel). Database: Supabase, Railway PostgreSQL, or similar.

## Prerequisites

- Node.js 18+
- GitHub repo
- (Optional) Domain for production URLs

## 1. Database

Use one of:

- **Supabase**: [supabase.com](https://supabase.com) → New Project → copy connection string.
- **Railway**: New Project → Provision PostgreSQL → use `DATABASE_URL` from Variables.

## 2. Backend env (production)

In your backend host (e.g. Railway), set:

```env
DATABASE_URL=postgresql://...
NODE_ENV=production
PORT=3001
JWT_SECRET=your-secret-key-min-32-chars
FRONTEND_URL=https://your-frontend-domain.com

# AI (Mistral)
MISTRAL_API_KEY=your-mistral-api-key
MISTRAL_MODEL=mistral-large-latest

# Optional
REDIS_URL=redis://...
```

## 3. Deploy backend

- **Railway**: See [docs/RAILWAY.md](RAILWAY.md).
- **Render / others**: Root directory `backend`, build `npm install && npx prisma generate && npm run build`, start `npm start`.

## 4. Deploy frontend

- **Vercel**: See [docs/VERCEL.md](VERCEL.md).
- Frontend is **Vite + React**. Build: `npm run build`. Output: `dist`. Env: `VITE_API_URL=https://your-backend-url`.

## 5. Point frontend at backend

Set `VITE_API_URL` (Vercel) to your backend URL. Set `FRONTEND_URL` (backend) to your frontend URL for CORS.

---

**Quick links:** [Railway (backend)](RAILWAY.md) · [Vercel (frontend)](VERCEL.md)
