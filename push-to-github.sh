#!/bin/bash

echo "🚀 Push Wellness Platform to GitHub"
echo "==================================="

read -p "Enter your GitHub username: " GITHUB_USER
read -p "Enter your repository name (e.g., wellness-intelligence-platform): " REPO_NAME

echo ""
echo "📝 Pushing to GitHub repository: https://github.com/$GITHUB_USER/$REPO_NAME"

# Add remote origin
git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git 2>/dev/null || git remote set-url origin https://github.com/$GITHUB_USER/$REPO_NAME.git

# Push to GitHub
echo "📤 Pushing code..."
git push -u origin main 2>/dev/null || git push -u origin master

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Code successfully pushed to GitHub!"
    echo ""
    echo "🌐 Repository URL: https://github.com/$GITHUB_USER/$REPO_NAME"
    echo ""
    echo "🚀 Next Steps:"
    echo "=============="
    echo ""
    echo "1. RAILWAY BACKEND DEPLOYMENT:"
    echo "   • Go to https://railway.app"
    echo "   • Click 'New Project' → 'Deploy from GitHub'"
    echo "   • Select your repository: $REPO_NAME"
    echo "   • Set Root Directory: /backend"
    echo "   • Add these environment variables:"
    echo "     - NODE_ENV=production"
    echo "     - JWT_SECRET=your-super-secret-jwt-key-here-32-chars-min"
    echo "     - MISTRAL_API_KEY=your-mistral-api-key-here"
    echo "     - FRONTEND_URL=https://$REPO_NAME.vercel.app"
    echo ""
    echo "2. VERCEL FRONTEND DEPLOYMENT:"
    echo "   • Go to https://vercel.com"
    echo "   • Click 'New Project'"
    echo "   • Import your GitHub repository"
    echo "   • Set Root Directory: frontend"
    echo "   • Add environment variable:"
    echo "     - VITE_API_URL=https://your-railway-app.railway.app"
    echo ""
    echo "3. UPDATE BACKEND:"
    echo "   • In Railway dashboard, update FRONTEND_URL with your Vercel URL"
    echo "   • Redeploy the backend"
    echo ""
    echo "🎉 Your wellness platform will be live at:"
    echo "   Frontend: https://$REPO_NAME.vercel.app"
    echo "   Backend:  https://your-railway-app.railway.app"
    echo ""
    echo "🚀 Ready to revolutionize wellness! 🌟"

else
    echo ""
    echo "❌ Failed to push to GitHub. Please check:"
    echo "   • Repository exists and is accessible"
    echo "   • You have push permissions"
    echo "   • Repository URL is correct"
    echo ""
    echo "Manual commands:"
    echo "git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git"
    echo "git push -u origin main"
fi