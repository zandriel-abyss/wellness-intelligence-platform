#!/bin/bash

echo "🎬 Quick Production Deployment Demo"
echo "==================================="
echo ""
echo "This script will guide you through deploying to production using:"
echo "• Railway (Backend + Database)"
echo "• Vercel (Frontend)"
echo ""
echo "Estimated time: 15-20 minutes"
echo "Estimated cost: FREE (using free tiers)"
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required. Please install Node.js 18+ first."
    echo "   Download: https://nodejs.org/"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo "❌ Git is required. Please install Git first."
    echo "   Download: https://git-scm.com/"
    exit 1
fi

echo "✅ Prerequisites met"

# Check if git repo exists
if [ ! -d .git ]; then
    echo "📝 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: Wellness Intelligence Platform"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

echo ""
echo "🚀 Step 1: Create GitHub Repository"
echo "==================================="
echo "1. Go to https://github.com and create a new repository"
echo "2. Name it: wellness-intelligence-platform"
echo "3. Make it public or private"
echo "4. DON'T initialize with README, .gitignore, or license"
echo ""
read -p "Enter your GitHub repository URL: " GITHUB_URL
echo ""

if [ -n "$GITHUB_URL" ]; then
    echo "📤 Pushing code to GitHub..."
    git remote add origin $GITHUB_URL 2>/dev/null || git remote set-url origin $GITHUB_URL
    git push -u origin main 2>/dev/null || git push -u origin master
    echo "✅ Code pushed to GitHub"
else
    echo "⚠️  Skipping GitHub setup. You'll need to push manually."
fi

echo ""
echo "🗄️ Step 2: Set up Railway (Backend + Database)"
echo "=============================================="
echo "Railway will provide:"
echo "• PostgreSQL database (free tier)"
echo "• Backend deployment (free tier)"
echo "• Automatic SSL certificates"
echo ""
echo "1. Go to https://railway.app"
echo "2. Sign up/Login with GitHub"
echo "3. Click 'New Project' → 'Deploy from GitHub'"
echo "4. Select your repository: wellness-intelligence-platform"
echo "5. Railway will detect it's a monorepo and ask for settings"
echo ""
echo "Railway Configuration:"
echo "• Root Directory: /backend"
echo "• Build Command: npm install && npx prisma generate && npm run build"
echo "• Start Command: npm start"
echo ""
echo "Environment Variables to add in Railway:"
echo "• NODE_ENV=production"
echo "• JWT_SECRET=your-super-secret-jwt-key-here"
echo "• OPENAI_API_KEY=your-openai-api-key-here"
echo "• FRONTEND_URL=https://your-vercel-domain.vercel.app"
echo ""
read -p "Have you created the Railway project? (y/n): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🎉 Railway backend deployed!"
    read -p "Enter your Railway backend URL (e.g., https://your-app.railway.app): " RAILWAY_URL
fi

echo ""
echo "🎨 Step 3: Set up Vercel (Frontend)"
echo "=================================="
echo "Vercel will provide:"
echo "• Frontend hosting (free tier)"
echo "• Global CDN"
echo "• Automatic SSL certificates"
echo ""
echo "1. Go to https://vercel.com"
echo "2. Sign up/Login with GitHub"
echo "3. Click 'New Project'"
echo "4. Import your GitHub repository"
echo "5. Configure build settings:"
echo "   • Root Directory: frontend"
echo "   • Build Command: npm run build"
echo "   • Output Directory: build"
echo ""
echo "Environment Variables:"
echo "• REACT_APP_API_URL=$RAILWAY_URL"
echo ""
read -p "Have you created the Vercel project? (y/n): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🎉 Vercel frontend deployed!"
    read -p "Enter your Vercel frontend URL (e.g., https://your-app.vercel.app): " VERCEL_URL
fi

echo ""
echo "🔄 Step 4: Update Backend Configuration"
echo "======================================="
echo "Now you need to update your Railway environment variables:"
echo ""
echo "In Railway Dashboard:"
echo "1. Go to your project"
echo "2. Click 'Variables' tab"
echo "3. Update FRONTEND_URL to: $VERCEL_URL"
echo "4. Redeploy the backend"
echo ""

echo "🎯 Step 5: Test Your Production Deployment"
echo "=========================================="
echo ""
echo "Test URLs:"
echo "• Frontend: $VERCEL_URL"
echo "• Backend API: $RAILWAY_URL/api/health"
echo ""
echo "Testing commands:"
echo "curl $RAILWAY_URL/health"
echo ""

echo "📱 Step 6: Access Your Live Platform"
echo "===================================="
echo ""
echo "Your wellness intelligence platform is now live!"
echo ""
echo "🌐 Frontend Dashboard: $VERCEL_URL"
echo "🔗 Backend API: $RAILWAY_URL"
echo ""
echo "Try these features:"
echo "1. Register a new account"
echo "2. Add some wearable data (use the test data)"
echo "3. Process data with AI to see wellness scores"
echo "4. View personalized insights and recommendations"
echo ""

echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================"
echo ""
echo "Your AI-powered wellness platform is now live and ready for users!"
echo ""
echo "Next steps:"
echo "• Share the platform with potential users"
echo "• Monitor usage and performance"
echo "• Add more features (wearable integrations, payments, etc.)"
echo "• Consider setting up a custom domain"
echo ""
echo "🚀 Happy wellness innovating!"