# 🚀 Production Deployment Guide

This guide will help you deploy the Wellness Intelligence Platform to production.

## 📋 Prerequisites

- Node.js 18+
- GitHub account
- Domain name (optional but recommended)

## 🗄️ Step 1: Set up Production Database

### Option 1: Supabase (Recommended - Free Tier Available)

1. Go to [supabase.com](https://supabase.com) and create an account
2. Click "New Project"
3. Choose your organization and enter project details:
   - Name: `wellness-intelligence`
   - Database Password: Choose a strong password
   - Region: Select closest to your users
4. Wait for the database to be created (~2 minutes)
5. Go to Settings → Database → Connection string
6. Copy the connection string (it should look like: `postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres`)

### Option 2: Railway

1. Go to [railway.app](https://railway.app) and create an account
2. Click "New Project" → "Provision PostgreSQL"
3. Copy the DATABASE_URL from the Variables tab

### Option 3: PlanetScale

1. Go to [planetscale.com](https://planetscale.com) and create an account
2. Create a new database
3. Copy the connection string

## 🔧 Step 2: Environment Configuration

Run the automated setup script:

```bash
./setup-production.sh
```

This will:
- Check your Node.js version
- Install dependencies
- Create production environment files
- Guide you through database setup

### Manual Environment Setup

If you prefer to set up manually:

#### Backend (.env.production)
```env
# Database
DATABASE_URL="your-database-connection-string"

# Server
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com

# Authentication
JWT_SECRET=your-super-secret-jwt-key-32-chars-minimum
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# AI/OpenAI (Required)
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview

# Redis (Optional - for caching)
REDIS_URL=redis://localhost:6379

# Stripe (Optional - for payments)
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Email (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Logging
LOG_LEVEL=info
```

#### Frontend (.env.production)
```env
REACT_APP_API_URL=https://your-backend-domain.com
GENERATE_SOURCEMAP=false
```

## 🏗️ Step 3: Deploy Backend API

### Option 1: Railway (Recommended - Easiest)

1. Go to [railway.app](https://railway.app) and create an account
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect your GitHub repository
4. Set the root directory to `/backend`
5. Add environment variables from your `.env.production` file
6. Deploy! Railway will give you a URL like `https://your-app.railway.app`

### Option 2: Render

1. Go to [render.com](https://render.com) and create an account
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - Runtime: `Node`
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`
   - Root Directory: `backend`
7. Add environment variables
8. Deploy!

### Option 3: AWS/Heroku/Vercel

The backend can also be deployed to:
- AWS EC2/ECS/Fargate
- Google Cloud Run
- Digital Ocean App Platform
- Heroku
- Vercel (serverless functions)

## 🎨 Step 4: Deploy Frontend Dashboard

### Option 1: Vercel (Recommended - Free & Easy)

1. Go to [vercel.com](https://vercel.com) and create an account
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
5. Add environment variable: `REACT_APP_API_URL=https://your-backend-url`
6. Deploy! Vercel will give you a URL like `https://your-app.vercel.app`

### Option 2: Netlify

1. Go to [netlify.com](https://netlify.com) and create an account
2. Click "New site from Git"
3. Connect your GitHub repository
4. Configure:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `build`
5. Add environment variable: `REACT_APP_API_URL=https://your-backend-url`
6. Deploy!

## 🌐 Step 5: Domain & SSL Setup

### Custom Domain (Optional but Recommended)

1. **Vercel**: Go to Project Settings → Domains → Add your domain
2. **Netlify**: Site Settings → Domain management → Add custom domain
3. **Railway/Render**: Update your DNS records to point to their provided IP/URL

### SSL Certificates

All the recommended platforms (Vercel, Netlify, Railway, Render) provide automatic SSL certificates through Let's Encrypt. No additional configuration needed!

## 🧪 Step 6: Testing Production Deployment

1. **Update Frontend Environment**: Make sure `REACT_APP_API_URL` points to your production backend
2. **Test User Registration**: Create a new account on your production site
3. **Test AI Processing**: Add some wearable data and process it
4. **Test Dashboard**: Verify scores and insights are displayed correctly

### Useful Test Commands

```bash
# Test backend health
curl https://your-backend-domain.com/health

# Test API endpoints
curl -X POST https://your-backend-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'
```

## 🔧 Step 7: Monitoring & Maintenance

### Essential Monitoring

1. **Error Tracking**: Set up Sentry or LogRocket
2. **Performance Monitoring**: Use Vercel's analytics or add custom monitoring
3. **Database Monitoring**: Use Supabase's built-in monitoring or add custom alerts

### Regular Maintenance

1. **Update Dependencies**: Keep Node.js, React, and other dependencies updated
2. **Database Backups**: Supabase/Railway handle this automatically
3. **SSL Renewal**: Handled automatically by hosting platforms
4. **Security Updates**: Monitor for security vulnerabilities

## 🚀 Scaling Considerations

### Database Scaling
- Supabase has generous free tier limits
- Consider connection pooling for high traffic
- Monitor query performance and add indexes as needed

### API Scaling
- Railway/Render auto-scale based on traffic
- Consider Redis for caching frequently accessed data
- Implement rate limiting for API endpoints

### Frontend Scaling
- Vercel/Netlify handle CDN and global distribution
- Consider implementing service worker for offline functionality

## 💰 Cost Optimization

### Free Tiers (Perfect for MVP)
- **Supabase**: 500MB database, 50MB file storage, 50,000 monthly active users
- **Railway**: $5/month free credit
- **Vercel**: 100GB bandwidth, unlimited static sites
- **OpenAI**: $5 free credit for new accounts

### Expected Costs for Small Production
- **Database**: $10-25/month
- **Backend**: $5-15/month
- **Frontend**: $0 (free on Vercel/Netlify)
- **AI API**: $10-50/month depending on usage

## 🔐 Security Checklist

- ✅ JWT tokens with proper expiration
- ✅ Password hashing with bcrypt
- ✅ HTTPS/SSL enabled
- ✅ Environment variables for secrets
- ✅ CORS configured properly
- ✅ Input validation with Zod
- ✅ SQL injection prevention (Prisma ORM)
- ✅ Rate limiting implemented

## 📞 Support & Troubleshooting

### Common Issues

1. **Database Connection Errors**: Double-check your DATABASE_URL
2. **OpenAI API Errors**: Verify your API key and billing status
3. **CORS Errors**: Ensure FRONTEND_URL matches your frontend domain
4. **Build Failures**: Check Node.js version compatibility

### Getting Help

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check this deployment guide
- **Community**: Join wellness tech communities

## 🎯 Next Steps

Once deployed, consider adding:

1. **Wearable Integrations**: Fitbit, Oura, Apple Health OAuth
2. **Payment Processing**: Stripe integration for practitioner sessions
3. **Push Notifications**: Real-time insights via email/push
4. **Advanced Analytics**: User behavior and wellness trends
5. **Mobile App**: React Native companion app
6. **Practitioner Onboarding**: Application and verification system

## 🌟 Success Metrics

Track these KPIs to measure success:

- **User Registration**: Daily/weekly signups
- **Data Processing**: AI insights generated per user
- **Session Bookings**: Practitioner consultations scheduled
- **User Retention**: Daily/weekly active users
- **API Performance**: Response times and error rates

---

**🎉 Congratulations! Your AI-powered wellness platform is now live in production!**

Users can now:
- 📱 Access their personalized wellness dashboard
- 🤖 Receive AI-generated health insights
- 📊 Track their wellness scores over time
- 👨‍⚕️ Connect with wellness practitioners
- 🧘 Practice personalized wellness activities

**Welcome to the future of AI-powered wellness! 🌟**