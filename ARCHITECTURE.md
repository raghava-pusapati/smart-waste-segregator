# System Architecture Documentation

## 🏛️ Architecture Overview

### Microservice Architecture Pattern

```
┌─────────────┐      ┌─────────────┐      ┌──────────────┐
│   Frontend  │─────▶│   Backend   │─────▶│Model Service │
│  (React)    │◀─────│  (Express)  │◀─────│  (FastAPI)   │
└─────────────┘      └─────────────┘      └──────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │  MongoDB    │
                     │   Atlas     │
                     └─────────────┘
```

## 🔄 Request Flow

### 1. User Registration/Login Flow
```
User → Frontend → Backend → MongoDB
                    ↓
              JWT Token Generated
                    ↓
              Frontend (Store in localStorage)
```

### 2. Waste Classification Flow
```
User uploads image
    ↓
Frontend (FormData)
    ↓
Backend (/api/waste/predict)
    ↓
Validate JWT & File
    ↓
Forward to Model Service (/predict)
    ↓
Model Service processes image
    ↓
Returns: { category, confidence }
    ↓
Backend saves to MongoDB
    ↓
Updates user ecoScore & totalScans
    ↓
Returns enriched response to Frontend
    ↓
Frontend displays results with animations
```

### 3. Dashboard Data Flow
```
Frontend requests stats
    ↓
Backend (/api/waste/stats)
    ↓
Aggregate MongoDB data
    ↓
Return: {
  totalScans,
  ecoScore,
  categoryDistribution,
  recentHistory,
  monthlyActivity
}
    ↓
Frontend renders charts
```

## 🗂️ Database Design

### Collections

#### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (bcrypt hashed),
  ecoScore: Number (default: 0),
  totalScans: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

#### Waste Records Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, indexed),
  category: String (enum: ['recyclable', 'organic', 'hazardous', 'general']),
  confidence: Number (0-100),
  imageUrl: String,
  disposalGuidance: String,
  environmentalImpact: String,
  timestamp: Date (indexed),
  createdAt: Date
}
```

### Indexes
- `users.email` - Unique index for fast login
- `waste.userId` - For user-specific queries
- `waste.timestamp` - For time-based analytics

## 🎯 Eco Score Algorithm

```javascript
function calculateEcoScore(category, confidence) {
  const basePoints = {
    recyclable: 10,
    organic: 8,
    general: 5,
    hazardous: 3
  };
  
  const confidenceMultiplier = confidence / 100;
  const points = basePoints[category] * confidenceMultiplier;
  
  return Math.round(points);
}
```

## 🔐 Security Layers

1. **Authentication**: JWT with httpOnly cookies (optional)
2. **Authorization**: Middleware validates token on protected routes
3. **Input Validation**: Express-validator for all inputs
4. **File Upload**: Multer with file type & size restrictions
5. **Rate Limiting**: Express-rate-limit on API endpoints
6. **CORS**: Configured for specific origins only
7. **Password**: bcrypt with salt rounds = 12

## 📡 API Communication

### Backend → Model Service
```javascript
// Backend sends multipart/form-data
const formData = new FormData();
formData.append('file', imageBuffer, 'image.jpg');

const response = await axios.post(
  `${MODEL_SERVICE_URL}/predict`,
  formData,
  { headers: formData.getHeaders() }
);
```

### Frontend → Backend
```javascript
// Frontend sends with JWT
const formData = new FormData();
formData.append('image', file);

const response = await fetch('/api/waste/predict', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

## 🎨 Component Architecture (Frontend)

```
App
├── Layout
│   ├── Navbar
│   └── Footer
├── Pages
│   ├── Landing
│   ├── Auth (Login/Register)
│   ├── Scan
│   ├── Dashboard
│   └── About
├── Components
│   ├── WasteClassifier
│   ├── ResultCard
│   ├── StatsCard
│   ├── CategoryChart
│   ├── HistoryList
│   └── EcoScoreBadge
└── Context
    ├── AuthContext
    └── WasteContext
```

## 🚀 Deployment Strategy

### Development
- Frontend: `npm run dev` (Vite)
- Backend: `npm run dev` (nodemon)
- Model Service: `uvicorn main:app --reload`

### Production
1. **Frontend**: Build → Deploy to Vercel
2. **Backend**: Deploy to Railway/Render
3. **Model Service**: Deploy to Railway/Render (with GPU if needed)
4. **Database**: MongoDB Atlas (M0 free tier or higher)

### Environment Variables
- Use platform-specific env management
- Never commit `.env` files
- Use `.env.example` as template

## 📊 Monitoring & Logging

- **Backend**: Winston logger
- **Model Service**: Python logging
- **Error Tracking**: Sentry (optional)
- **Analytics**: Track classification accuracy over time

## 🔄 CI/CD Pipeline (Optional)

```yaml
# GitHub Actions example
on: [push]
jobs:
  test:
    - Run backend tests
    - Run frontend tests
  deploy:
    - Deploy to production
```

## 📈 Scalability Considerations

1. **Image Storage**: Use AWS S3 or Cloudinary instead of local storage
2. **Caching**: Redis for frequently accessed data
3. **Load Balancing**: Multiple backend instances
4. **Model Optimization**: TensorFlow Lite for faster inference
5. **Database**: Sharding for large-scale data
