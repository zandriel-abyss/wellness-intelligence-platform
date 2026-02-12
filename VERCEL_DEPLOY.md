# 🎨 Deploy Frontend to Vercel

## Step-by-Step Vercel Deployment

### 1. Create Vercel Account
- Go to [vercel.com](https://vercel.com)
- Sign up/Login with GitHub

### 2. Import Project
- Click "New Project"
- Import your GitHub repository: `zandriel-abyss/wellness-intelligence-platform`
- Vercel will detect it's a monorepo

### 3. Configure Build Settings
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

### 4. Add Environment Variable
```
REACT_APP_API_URL=https://your-railway-project.railway.app
```
*(Replace with your actual Railway backend URL)*

### 5. Deploy
- Click "Deploy"
- Wait for build to complete (~2-3 minutes)

### 6. Get Your Frontend URL
Vercel will give you a URL like:
`https://wellness-intelligence-platform.vercel.app`

---

## 🔄 Final Step: Update Backend

Go back to Railway dashboard and update the `FRONTEND_URL` environment variable to your Vercel URL, then redeploy the backend.

---

## 🎉 Your Platform is Live!

- **Frontend**: `https://wellness-intelligence-platform.vercel.app`
- **Backend**: `https://your-railway-project.railway.app`

**Test it out:**
1. Register a new account
2. Add wearable data
3. Process with AI
4. See personalized wellness insights!