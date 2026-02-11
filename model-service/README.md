# Model Service

FastAPI-based microservice for waste classification using TensorFlow/Keras.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Place your trained model:
```bash
# Put your .keras model file in:
models/waste_classifier.keras
```

3. Run the service:
```bash
uvicorn main:app --reload --port 8000
```

## API Endpoints

### POST /predict
Classify a single waste image.

**Request:**
- Content-Type: multipart/form-data
- Body: file (image file)

**Response:**
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

### POST /batch-predict
Classify multiple images (max 10).

### GET /health
Health check endpoint.

## Model Requirements

- Input size: 224x224 RGB
- Output: 6 classes (glass, hazardous, metal, organic, paper, plastic)
- Format: .keras or .h5

## Environment Variables

- `MODEL_PATH`: Path to model file (default: ./models/waste_classifier.keras)
- `ALLOWED_ORIGINS`: CORS origins (default: *)
