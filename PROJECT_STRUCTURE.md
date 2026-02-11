# Project Structure

## 📁 Complete Folder Structure

```
smart-waste-segregator/
│
├── frontend/                          # React Frontend Application
│   ├── public/                        # Static assets
│   ├── src/
│   │   ├── components/                # Reusable UI components
│   │   │   ├── Layout.jsx            # Main layout wrapper
│   │   │   ├── Navbar.jsx            # Navigation bar
│   │   │   └── Footer.jsx            # Footer component
│   │   │
│   │   ├── pages/                     # Page components
│   │   │   ├── Landing.jsx           # Landing page
│   │   │   ├── Login.jsx             # Login page
│   │   │   ├── Register.jsx          # Registration page
│   │   │   ├── Scan.jsx              # Waste scanning page
│   │   │   ├── Dashboard.jsx         # User dashboard
│   │   │   └── About.jsx             # About page
│   │   │
│   │   ├── context/                   # React Context providers
│   │   │   └── AuthContext.jsx       # Authentication context
│   │   │
│   │   ├── services/                  # API service layer
│   │   │   └── api.js                # Axios configuration & API calls
│   │   │
│   │   ├── App.jsx                    # Main app component
│   │   ├── main.jsx                   # Entry point
│   │   └── index.css                  # Global styles
│   │
│   ├── index.html                     # HTML template
│   ├── package.json                   # Dependencies
│   ├── vite.config.js                 # Vite configuration
│   ├── tailwind.config.js             # Tailwind CSS config
│   ├── postcss.config.js              # PostCSS config
│   ├── Dockerfile                     # Docker configuration
│   └── .gitignore
│
├── backend/                           # Express Backend API
│   ├── controllers/                   # Request handlers
│   │   ├── auth.controller.js        # Auth logic
│   │   └── waste.controller.js       # Waste classification logic
│   │
│   ├── models/                        # Mongoose schemas
│   │   ├── User.model.js             # User schema
│   │   └── Waste.model.js            # Waste record schema
│   │
│   ├── routes/                        # API routes
│   │   ├── auth.routes.js            # Auth endpoints
│   │   └── waste.routes.js           # Waste endpoints
│   │
│   ├── middleware/                    # Express middleware
│   │   ├── auth.middleware.js        # JWT verification
│   │   ├── error.middleware.js       # Error handling
│   │   ├── upload.middleware.js      # File upload (Multer)
│   │   ├── validate.middleware.js    # Input validation
│   │   └── rateLimiter.middleware.js # Rate limiting
│   │
│   ├── config/                        # Configuration files
│   │   └── database.js               # MongoDB connection
│   │
│   ├── server.js                      # Express app entry point
│   ├── package.json                   # Dependencies
│   ├── Dockerfile                     # Docker configuration
│   └── .gitignore
│
├── model-service/                     # FastAPI Model Service
│   ├── models/                        # ML model storage
│   │   └── waste_classifier.keras    # Trained model (not in git)
│   │
│   ├── main.py                        # FastAPI application
│   ├── requirements.txt               # Python dependencies
│   ├── Dockerfile                     # Docker configuration
│   ├── README.md                      # Model service docs
│   └── .gitignore
│
├── docker-compose.yml                 # Multi-container orchestration
├── .env.example                       # Environment variables template
├── README.md                          # Project overview
├── ARCHITECTURE.md                    # System architecture docs
├── IMPLEMENTATION_GUIDE.md            # Step-by-step guide
├── API_DOCUMENTATION.md               # API reference
└── PROJECT_STRUCTURE.md               # This file
```

## 📦 Key Files Explained

### Frontend

**App.jsx**
- Main application component
- Routing configuration
- Protected route logic
- Toast notifications setup

**AuthContext.jsx**
- Global authentication state
- Login/logout functions
- User data management
- Token handling

**api.js**
- Axios instance configuration
- Request/response interceptors
- API endpoint functions
- Token injection

**Scan.jsx**
- Image upload interface
- Classification result display
- Animated confidence meter
- Disposal guidance cards

**Dashboard.jsx**
- User statistics overview
- Chart.js visualizations
- Recent scan history
- Eco score display

### Backend

**server.js**
- Express app initialization
- Middleware configuration
- Route mounting
- Error handling
- Server startup

**auth.controller.js**
- User registration logic
- Login authentication
- JWT token generation
- Password hashing

**waste.controller.js**
- Image processing
- Model service communication
- Database operations
- Eco score calculation
- Statistics aggregation

**User.model.js**
- User schema definition
- Password hashing hooks
- Instance methods
- Validation rules

**Waste.model.js**
- Waste record schema
- Category enum
- Indexes for performance
- Timestamp tracking

**auth.middleware.js**
- JWT token verification
- User authentication
- Request protection
- Token extraction

### Model Service

**main.py**
- FastAPI application
- Model loading
- Image preprocessing
- Prediction endpoint
- Batch prediction
- Health checks

## 🔄 Data Flow

### 1. User Registration Flow
```
User Input → Frontend Validation → API Request → Backend Validation
→ Password Hashing → MongoDB Save → JWT Generation → Response
```

### 2. Waste Classification Flow
```
Image Upload → Frontend FormData → Backend Multer → Model Service
→ TensorFlow Prediction → Backend Processing → MongoDB Save
→ User Stats Update → Response with Guidance
```

### 3. Dashboard Data Flow
```
Dashboard Load → Multiple API Calls (Stats, History) → MongoDB Aggregation
→ Data Formatting → Chart.js Rendering → UI Display
```

## 🎨 Component Hierarchy

```
App
├── Router
│   ├── Layout
│   │   ├── Navbar
│   │   ├── Outlet (Page Content)
│   │   └── Footer
│   │
│   └── Routes
│       ├── Landing (Public)
│       ├── Login (Public)
│       ├── Register (Public)
│       ├── About (Public)
│       ├── Scan (Protected)
│       └── Dashboard (Protected)
│
└── AuthProvider (Context)
```

## 🗄️ Database Collections

### users
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (indexed, unique),
  password: String (hashed),
  ecoScore: Number,
  totalScans: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### wastes
```javascript
{
  _id: ObjectId,
  userId: ObjectId (indexed, ref: users),
  category: String (enum),
  confidence: Number,
  imageUrl: String,
  disposalGuidance: String,
  environmentalImpact: String,
  timestamp: Date (indexed),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Security Layers

1. **Frontend**
   - Protected routes
   - Token storage
   - Input validation
   - XSS prevention

2. **Backend**
   - JWT authentication
   - Password hashing (bcrypt)
   - Rate limiting
   - CORS configuration
   - Helmet security headers
   - Input sanitization

3. **Database**
   - Connection encryption
   - Access control
   - IP whitelisting
   - Backup strategy

## 🚀 Deployment Structure

### Development
```
localhost:5173 (Frontend)
    ↓
localhost:5000 (Backend)
    ↓
localhost:8000 (Model Service)
    ↓
MongoDB Atlas (Cloud)
```

### Production
```
Vercel (Frontend)
    ↓
Railway/Render (Backend)
    ↓
Railway/Render (Model Service)
    ↓
MongoDB Atlas (Cloud)
```

## 📊 Technology Stack Summary

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- Chart.js
- Framer Motion
- React Hot Toast
- Lucide Icons

**Backend:**
- Node.js
- Express
- MongoDB + Mongoose
- JWT
- Bcrypt
- Multer
- Axios
- Express Validator
- Helmet
- Morgan

**Model Service:**
- Python 3.9+
- FastAPI
- TensorFlow/Keras
- Pillow
- NumPy
- Uvicorn

**DevOps:**
- Docker
- Docker Compose
- Git
- GitHub Actions (optional)

## 📝 File Naming Conventions

- **Components**: PascalCase (e.g., `Navbar.jsx`)
- **Pages**: PascalCase (e.g., `Dashboard.jsx`)
- **Services**: camelCase (e.g., `api.js`)
- **Middleware**: camelCase with .middleware suffix (e.g., `auth.middleware.js`)
- **Models**: PascalCase with .model suffix (e.g., `User.model.js`)
- **Controllers**: camelCase with .controller suffix (e.g., `auth.controller.js`)
- **Routes**: camelCase with .routes suffix (e.g., `auth.routes.js`)
- **Config**: camelCase (e.g., `database.js`)

## 🎯 Code Organization Principles

1. **Separation of Concerns**: Each file has a single responsibility
2. **Modularity**: Reusable components and functions
3. **Scalability**: Easy to add new features
4. **Maintainability**: Clear structure and naming
5. **Security**: Multiple layers of protection
6. **Performance**: Optimized queries and caching
7. **Testing**: Testable architecture
