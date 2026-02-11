# Smart Waste Segregator 🌱

> **Professional, Production-Ready AI-Powered Waste Classification System**

[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18-green)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.9-yellow)](https://python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

AI-powered waste classification system with intelligent disposal guidance, user tracking, and environmental impact awareness.

## 🎯 Project Vision

A modern SaaS-style environmental assistant that combines deep learning, user authentication, and gamification to improve waste segregation and recycling efficiency.

---

## ⚡ Quick Start (Choose One)

### 🚀 Option 1: Fast Setup (15 minutes)
**[→ GET_STARTED_NOW.md](GET_STARTED_NOW.md)** - Complete guided setup with troubleshooting

### 📖 Option 2: Quick Reference (10 minutes)
**[→ QUICK_START.md](QUICK_START.md)** - Condensed setup guide

### 📚 Option 3: Full Documentation
**[→ INDEX.md](INDEX.md)** - Complete documentation index

---

## 🏗️ Architecture

**Microservice-based architecture:**
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB
- **Model Service**: Python + FastAPI + TensorFlow/Keras
- **Database**: MongoDB Atlas

**[→ View Complete Architecture](ARCHITECTURE.md)**

---

## ✨ Key Features

### 🔐 Authentication & Security
- JWT-based authentication
- Secure password hashing (bcrypt)
- Protected routes
- Rate limiting
- Security headers

### 🤖 AI Classification
- 4 waste categories (Recyclable, Organic, Hazardous, General)
- Real-time image classification
- Confidence percentage
- Disposal guidance
- Environmental impact messages

### 📊 Dashboard & Analytics
- Interactive charts (Chart.js)
- Category distribution
- Monthly activity tracking
- Eco score system
- Recent scan history

### 🎨 Modern UI/UX
- Glassmorphism design
- Smooth animations (Framer Motion)
- Mobile-first responsive
- Toast notifications
- Loading states

---

## 📁 Project Structure

```
smart-waste-segregator/
├── frontend/          # React + Vite + Tailwind
├── backend/           # Express + MongoDB
├── model-service/     # FastAPI + TensorFlow
└── Documentation/     # 12 comprehensive guides
```

**[→ View Complete Structure](PROJECT_STRUCTURE.md)**

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB Atlas account
- npm/yarn

### Installation

1. **Clone and setup environment**
```bash
cp .env.example .env
# Configure your environment variables
```

2. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

3. **Backend Setup**
```bash
cd backend
npm install
npm run dev
```

4. **Model Service Setup**
```bash
cd model-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## 📁 Project Structure

```
smart-waste-segregator/
├── frontend/          # React application
├── backend/           # Express API server
├── model-service/     # FastAPI ML service
├── docker-compose.yml # Container orchestration
└── README.md
```

## 🎨 Design System

**Color Palette:**
- Primary: `#4CAF50` (Eco Green)
- Accent: `#2196F3` (Blue)
- Warning: `#D32F2F` (Red)
- Background: `#F5F5F5` (Off-white)

**Design Principles:**
- Minimalist & clean
- Glassmorphism effects
- Smooth animations
- Mobile-first responsive

## 📊 Features

- ✅ JWT Authentication
- ✅ Real-time waste classification
- ✅ Eco score tracking
- ✅ Interactive dashboard with charts
- ✅ Waste history management
- ✅ Environmental impact awareness
- ✅ Category-based disposal guidance

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Waste Management
- `POST /api/waste/predict` - Classify waste image
- `GET /api/waste/history` - Get user waste history
- `GET /api/waste/stats` - Get user statistics

### Model Service
- `POST /predict` - ML prediction endpoint

## 🗄️ Database Schema

**User Collection:**
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  ecoScore: Number (default: 0),
  totalScans: Number (default: 0),
  createdAt: Date
}
```

**Waste Collection:**
```javascript
{
  userId: ObjectId,
  category: String,
  confidence: Number,
  imageUrl: String,
  disposalGuidance: String,
  timestamp: Date
}
```

## 🚢 Deployment

Recommended platforms:
- **Frontend**: Vercel / Netlify
- **Backend**: Railway / Render
- **Model Service**: Railway / Render
- **Database**: MongoDB Atlas

## 📝 License

MIT License
