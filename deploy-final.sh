#!/bin/bash

echo "🚀 FINAL DEPLOYMENT: Wellness Intelligence Platform"
echo "=================================================="
echo ""
echo "🎯 Ready to deploy with your OpenAI API key!"
echo ""

# Check if GitHub repo exists
if ! git remote get-url origin &> /dev/null; then
    echo "❌ GitHub repository not set up yet."
    echo ""
    echo "📋 Please complete these steps first:"
    echo ""
    echo "1. Go to https://github.com/zandriel-abyss"
    echo "2. Click 'New repository'"
    echo "3. Name: wellness-intelligence-platform"
    echo "4. Make it PUBLIC"
    echo "5. DON'T check any initialization boxes"
    echo "6. Click 'Create repository'"
    echo ""
    echo "Then run this script again!"
    exit 1
fi

echo "✅ GitHub repository detected"
echo ""

# Note: Add your OpenAI API key when setting up Railway environment variables

echo ""
echo "📤 Pushing latest code to GitHub..."
git add .
git commit -m "Final production deployment with OpenAI integration" || true
git push origin main 2>/dev/null || git push origin master

if [ $? -eq 0 ]; then
    echo "✅ Code pushed to GitHub successfully!"
else
    echo "⚠️  GitHub push failed, but continuing with deployment..."
fi

echo ""
echo "🚂 RAILWAY BACKEND DEPLOYMENT:"
echo "=============================="
echo ""
echo "🔗 Go to: https://railway.app"
echo ""
echo "📋 Configuration:"
echo "• New Project → Deploy from GitHub"
echo "• Repository: zandriel-abyss/wellness-intelligence-platform"
echo "• Root Directory: /backend"
echo "• Build Command: npm install && npx prisma generate && npm run build"
echo "• Start Command: npm start"
echo ""
echo "🔧 Environment Variables:"
echo "NODE_ENV=production"
echo "JWT_SECRET=wellness-platform-super-secret-jwt-key-2026-production-ready"
echo "OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE"
echo "FRONTEND_URL=https://wellness-intelligence-platform.vercel.app"
echo ""
echo "⚡ Click 'Deploy' - Railway will give you a backend URL!"
echo ""

# Wait for user to complete Railway setup
read -p "Have you deployed the backend to Railway? Enter your Railway URL (e.g., https://your-app.railway.app): " RAILWAY_URL

if [ -z "$RAILWAY_URL" ]; then
    echo "Please provide your Railway URL to continue."
    exit 1
fi

echo ""
echo "🎨 VERCEL FRONTEND DEPLOYMENT:"
echo "=============================="
echo ""
echo "🔗 Go to: https://vercel.com"
echo ""
echo "📋 Configuration:"
echo "• New Project"
echo "• Import GitHub repository: zandriel-abyss/wellness-intelligence-platform"
echo "• Root Directory: frontend"
echo "• Build Command: npm run build"
echo "• Output Directory: build"
echo ""
echo "🔧 Environment Variable:"
echo "REACT_APP_API_URL=$RAILWAY_URL"
echo ""
echo "⚡ Click 'Deploy' - Vercel will give you a frontend URL!"
echo ""

# Wait for user to complete Vercel setup
read -p "Have you deployed the frontend to Vercel? Enter your Vercel URL (e.g., https://wellness-intelligence-platform.vercel.app): " VERCEL_URL

if [ -z "$VERCEL_URL" ]; then
    echo "Please provide your Vercel URL to continue."
    exit 1
fi

echo ""
echo "🔄 FINAL CONFIGURATION:"
echo "======================"
echo ""
echo "1. Go back to Railway dashboard"
echo "2. Update FRONTEND_URL to: $VERCEL_URL"
echo "3. Click 'Deploy' to redeploy backend"
echo ""

echo "🧪 TESTING YOUR LIVE PLATFORM:"
echo "=============================="
echo ""
echo "🌐 Frontend Dashboard: $VERCEL_URL"
echo "🔗 Backend API: $RAILWAY_URL"
echo ""
echo "Test these endpoints:"
echo "• Health check: $RAILWAY_URL/health"
echo "• API docs: $RAILWAY_URL/api/health"
echo ""

echo "🎯 WHAT TO TEST:"
echo "==============="
echo "1. Open $VERCEL_URL in browser"
echo "2. Register a new account"
echo "3. Add some wearable data (heart rate, sleep, etc.)"
echo "4. Click 'Process Data' to see AI wellness scores"
echo "5. View personalized insights and recommendations"
echo ""

echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================"
echo ""
echo "🎊 Your AI-powered wellness intelligence platform is LIVE!"
echo ""
echo "🚀 Share this with the world:"
echo "🌐 $VERCEL_URL"
echo ""
echo "💡 Pro Tips:"
echo "• Monitor usage in Railway/Vercel dashboards"
echo "• OpenAI costs: ~$0.002 per AI analysis"
echo "• Scale automatically as users grow"
echo "• Add custom domain anytime"
echo ""
echo "🌟 You're revolutionizing wellness with AI! 🎯"