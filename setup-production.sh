#!/bin/bash

echo "🚀 Setting up Wellness Intelligence Platform for Production"
echo "=========================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'.' -f1 | cut -d'v' -f2)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
cd backend
npm install
cd ../frontend
npm install
cd ..

echo "🗄️ Setting up Supabase PostgreSQL database..."
echo "1. Go to https://supabase.com"
echo "2. Create a new project"
echo "3. Copy your database connection string"
echo "4. Update the DATABASE_URL in backend/.env.production"
echo ""
read -p "Have you created your Supabase project and copied the connection string? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please create your Supabase project first, then run this script again."
    exit 1
fi

# Create production environment files
echo "🔧 Creating production environment files..."

# Backend production env
cat > backend/.env.production << EOL
# Database
DATABASE_URL="your-supabase-database-url-here"

# Server
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com

# Authentication
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# AI (Mistral)
MISTRAL_API_KEY=your-mistral-api-key-here
MISTRAL_MODEL=mistral-large-latest

# Redis (optional - for caching)
REDIS_URL=redis://localhost:6379

# Stripe (for payments - optional)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Email (for notifications - optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Logging
LOG_LEVEL=info
EOL

# Frontend production env
cat > frontend/.env.production << EOL
VITE_API_URL=https://your-backend-domain.com
EOL

echo "📝 Production environment files created!"
echo "   - backend/.env.production"
echo "   - frontend/.env.production"
echo ""
echo "⚠️  IMPORTANT: Update the following in your .env files:"
echo "   1. DATABASE_URL in backend/.env.production"
echo "   2. MISTRAL_API_KEY in backend/.env.production"
echo "   3. FRONTEND_URL and VITE_API_URL with your actual domains"
echo ""

# Generate Prisma client and push schema
echo "🗃️ Setting up database schema..."
cd backend
npx prisma generate
echo "✅ Prisma client generated"

read -p "Enter your DATABASE_URL for production: " DB_URL
if [ -n "$DB_URL" ]; then
    export DATABASE_URL="$DB_URL"
    npx prisma db push --force-reset
    echo "✅ Database schema deployed to production"
else
    echo "⚠️  Skipping database setup. Run 'npx prisma db push' manually after setting DATABASE_URL"
fi

cd ..

# Build applications
echo "🔨 Building applications for production..."
cd backend
npm run build
echo "✅ Backend built"

cd ../frontend
npm run build
echo "✅ Frontend built"

cd ..

echo ""
echo "🎉 Production setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Deploy backend to Railway, Render, or AWS"
echo "2. Deploy frontend to Vercel, Netlify, or AWS S3"
echo "3. Set up your domains and SSL certificates"
echo "4. Test the production deployment"
echo ""
echo "🔗 Useful deployment guides:"
echo "   - Railway: https://docs.railway.app/"
echo "   - Render: https://docs.render.com/"
echo "   - Vercel: https://vercel.com/docs"
echo "   - Netlify: https://docs.netlify.com/"
echo ""
echo "🚀 Your wellness platform is ready for production!"