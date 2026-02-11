# API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Auth Endpoints

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "ecoScore": 0,
      "totalScans": 0,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400` - Validation error or user already exists
- `500` - Server error

---

### Login User
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "ecoScore": 150,
      "totalScans": 25,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400` - Missing credentials
- `401` - Invalid credentials
- `500` - Server error

---

### Get Current User
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "ecoScore": 150,
      "totalScans": 25,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**
- `401` - Unauthorized (invalid/missing token)
- `500` - Server error

---

## Waste Endpoints

### Predict Waste Category
**POST** `/waste/predict`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (FormData):**
```
image: <file> (JPEG, PNG, max 5MB)
```

**Response (200):**
```json
{
  "success": true,
  "message": "Waste classified successfully",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "category": "recyclable",
    "confidence": 92.5,
    "disposalGuidance": "Place in the blue recycling bin. Clean and dry items recycle better.",
    "environmentalImpact": "Recycling saves energy, reduces pollution, and conserves natural resources. Great job! 🌍",
    "ecoPointsEarned": 9,
    "timestamp": "2024-01-15T14:30:00.000Z"
  }
}
```

**Error Responses:**
- `400` - No image uploaded or invalid file type
- `401` - Unauthorized
- `503` - Model service unavailable
- `500` - Server error

---

### Get Waste History
**GET** `/waste/history?page=1&limit=10`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "userId": "507f1f77bcf86cd799439011",
        "category": "recyclable",
        "confidence": 92.5,
        "disposalGuidance": "Place in the blue recycling bin...",
        "environmentalImpact": "Recycling saves energy...",
        "timestamp": "2024-01-15T14:30:00.000Z",
        "createdAt": "2024-01-15T14:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalRecords": 25,
      "hasMore": true
    }
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `500` - Server error

---

### Get User Statistics
**GET** `/waste/stats`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalScans": 25,
    "ecoScore": 150,
    "categoryDistribution": [
      {
        "category": "recyclable",
        "count": 12
      },
      {
        "category": "organic",
        "count": 8
      },
      {
        "category": "general",
        "count": 3
      },
      {
        "category": "hazardous",
        "count": 2
      }
    ],
    "monthlyActivity": [
      {
        "month": "2024-01",
        "count": 15
      },
      {
        "month": "2024-02",
        "count": 10
      }
    ],
    "recentScans": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "category": "recyclable",
        "confidence": 92.5,
        "timestamp": "2024-01-15T14:30:00.000Z"
      }
    ]
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `500` - Server error

---

## Model Service Endpoints

### Predict (Model Service)
**POST** `http://localhost:8000/predict`

**Request Body (FormData):**
```
file: <image_file>
```

**Response (200):**
```json
{
  "category": "recyclable",
  "confidence": 92.5,
  "all_predictions": {
    "recyclable": 92.5,
    "organic": 5.2,
    "hazardous": 1.8,
    "general": 0.5
  }
}
```

**Error Responses:**
- `400` - Invalid file type
- `500` - Prediction failed

---

### Health Check (Model Service)
**GET** `http://localhost:8000/health`

**Response (200):**
```json
{
  "status": "healthy",
  "model_status": "loaded",
  "classes": ["general", "hazardous", "organic", "recyclable"]
}
```

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## Rate Limiting

- General endpoints: 100 requests per 15 minutes per IP
- Auth endpoints: 5 requests per 15 minutes per IP

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable
