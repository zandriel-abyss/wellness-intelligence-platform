# 🚀 Deploy Backend to Railway

## Step-by-Step Railway Deployment

### 1. Create Railway Account
- Go to [railway.app](https://railway.app)
- Sign up/Login with GitHub

### 2. Create New Project
- Click "New Project" → "Deploy from GitHub"
- Search for and select: `zandriel-abyss/wellness-intelligence-platform`
- Click "Configure project"

### 3. Configure Build Settings
- **Root Directory**: `/backend`
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npm start`
- Click "Deploy"

### 4. Add Environment Variables
In Railway Dashboard → Your Project → "Variables" tab:

```
NODE_ENV=production
JWT_SECRET=wellness-platform-super-secret-jwt-key-2026-production-ready
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
FRONTEND_URL=https://wellness-intelligence-platform.vercel.app
```

### 5. Database Setup
Railway automatically creates a PostgreSQL database. The connection URL is automatically available as `DATABASE_URL`.

### 6. Get Your Backend URL
After deployment, Railway will give you a URL like:
`https://your-project-name.railway.app`

**Copy this URL** - you'll need it for the frontend deployment.

---

## ✅ Next: Deploy Frontend to Vercel

Use your Railway URL as the `REACT_APP_API_URL` in Vercel.