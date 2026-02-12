# Wellness Intelligence Engine (Prototype)

A prototype wellness intelligence engine that explores how wearable device data can be translated into interpretable wellbeing signals, insights, and evidence-informed micro-practices. This project is non-medical and intended for research, prototyping, and iterative development only.

## 🎯 Overview

This platform transforms raw wearable data (heart rate, sleep, activity, HRV, etc.) into actionable wellness intelligence using advanced AI. This system is designed as a proof-of-concept for preventive, participatory wellbeing. It does not provide medical diagnosis, treatment, or clinical decision-making.

Users receive:

- **Wellbeing Scores**: Non-clinical indicators of balance and resilience
- **Personalized Insights**: Explainable recommendations based on data patterns
- **Practitioner discovery (conceptual / optional module)**: Connect with yoga teachers, meditation guides, and wellness experts
- **Evidence-informed micro-practice suggestions**: Curated wellness activities tailored to individual needs

## 🏗️ Architecture

### Backend (Node.js + TypeScript)
- **Express.js** API server with TypeScript
- **Prisma ORM** with PostgreSQL database
- **OpenAI GPT-4** for AI-powered data analysis
- **JWT authentication** with secure user sessions
- **Comprehensive data models** for users, wearables, scores, and insights

### Frontend (React + TypeScript)
- **React 18** with TypeScript for type safety
- **Material-UI** for modern, accessible UI components
- **Recharts** for data visualization
- **React Router** for client-side navigation
- **Context API** for state management

### AI Pipeline
The AI pipeline is assistive and constrained. Outputs are designed to be explainable, non-diagnostic, and interpretable by users.

- **Data Ingestion**: Support for Fitbit, Oura, Apple Health, Garmin, Whoop, Polar
- **Data Processing**: Intelligent curation of noisy wearable data
- **Wellness Scoring**: Multi-dimensional health assessment (stress, sleep, energy, recovery, etc.)
- **Insight Generation**: Explainable AI recommendations with confidence scores
- **Practice Matching**: AI-driven wellness practice recommendations

## 🚀 Features

### Core Functionality
(Prototype scope – features may be simulated or partially implemented)

- ✅ User authentication and profiles
- ✅ Wearable device integration
- ✅ Rule-based and AI-assisted wellbeing scoring (prototype)
- ✅ Interpretable insights with supporting factors
- ✅ Practitioner discovery (non-clinical, optional)
- ✅ Wellness practice library

### AI Capabilities
- ✅ Pattern recognition in wearable data
- ✅ Stress level assessment from HRV and heart rate
- ✅ Sleep quality analysis
- ✅ Energy and recovery tracking
- ✅ Correlation analysis between metrics
- ✅ Personalized recommendations based on data patterns

### Data Processing
- ✅ Real-time data ingestion from wearables
- ✅ Data quality assessment and filtering
- ✅ Historical trend analysis
- ✅ Anomaly detection
- ✅ Predictive wellness insights

## 🛠️ Tech Stack

### Backend
- Node.js 18+
- TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- OpenAI GPT-4
- JWT Authentication
- Redis (caching)
- Stripe (payments)

### Frontend
- React 18
- TypeScript
- Material-UI
- Recharts
- React Router
- Axios

### DevOps
- Docker & Docker Compose
- PostgreSQL
- Redis
- Environment-based configuration

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis (optional, for caching)
- OpenAI API key

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd wellness-intelligence-platform

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Setup

```bash
# Backend environment
cd backend
cp .env.example .env
# Edit .env with your configuration

# Frontend environment (if needed)
cd ../frontend
cp .env.example .env
```

### 3. Database Setup

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 4. Start Development Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm start
```

### Using Docker (Alternative)

```bash
docker-compose up --build
```

## 🔧 Configuration

### Backend Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/wellness_db
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-key
REDIS_URL=redis://localhost:6379
```

### Frontend Environment Variables

```env
REACT_APP_API_URL=http://localhost:3001
```

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Wellness Endpoints
- `GET /api/wellness/dashboard` - Comprehensive dashboard data
- `POST /api/wellness/scores/process` - Trigger AI processing
- `GET /api/wellness/insights` - Get user insights
- `PUT /api/wellness/insights/:id/status` - Update insight status

### Wearable Endpoints
- `POST /api/wearables/connect` - Connect wearable device
- `GET /api/wearables/connections` - Get user connections
- `POST /api/wearables/data` - Ingest wearable data

### Practitioner Endpoints
- `GET /api/practitioners` - Search practitioners
- `GET /api/practitioners/:id` - Get practitioner details
- `POST /api/practitioners/:id/sessions` - Book session

## 🤖 AI Processing Pipeline

Important: This pipeline does not make medical determinations. AI outputs are generated to support user reflection and self-regulation, not diagnosis or treatment.

The AI pipeline consists of several stages:

1. **Data Collection**: Raw wearable data ingestion
2. **Data Curation**: Quality assessment and noise filtering
3. **Pattern Analysis**: Statistical analysis and trend detection
4. **Wellness Scoring**: Multi-dimensional health assessment
5. **Insight Generation**: AI-powered recommendations
6. **Practice Matching**: Personalized wellness practice suggestions

### Example AI Analysis

```typescript
// Input: Recent wearable data
const wearableData = [
  { type: 'heart_rate', value: 75, timestamp: '2024-01-01T10:00:00Z' },
  { type: 'hrv', value: 45, timestamp: '2024-01-01T10:00:00Z' },
  { type: 'sleep_hours', value: 6.5, timestamp: '2024-01-01T06:00:00Z' }
];

// Output: Wellness insights
const insights = {
  scores: {
    stress: { score: 65, confidence: 0.85, factors: { hrv: -0.3, sleep: -0.4 } },
    sleep: { score: 55, confidence: 0.92, factors: { duration: -0.5, quality: -0.2 } }
  },
  recommendations: [
    "You may explore mindfulness practices to reduce stress",
    "You may consider adjusting sleep routines to aim for 7-8 hours nightly",
    "Try breathing exercises before bed"
  ]
};
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📦 Deployment

### Production Build

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
# Serve build directory with nginx/apache
```

### Docker Deployment

```bash
docker-compose -f docker-compose.prod.yml up --build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Inspired by modern wellness platforms and AI-driven health insights
- Built with cutting-edge web technologies and AI capabilities
- Focused on privacy, explainability, and user empowerment

## 📞 Support

For questions, issues, or contributions, please open an issue on GitHub or contact the development team.

---

**Exploring how wearable data can support self-understanding, balance, and participatory wellbeing.**