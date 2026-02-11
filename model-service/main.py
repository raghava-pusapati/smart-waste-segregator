from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.applications.efficientnet import preprocess_input
import numpy as np
from PIL import Image
import io
import os
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Waste Classification Model Service",
    description="AI-powered waste classification API",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
model = None
class_names = ['glass', 'hazardous', 'metal', 'organic', 'paper', 'plastic']
IMG_SIZE = 224  # Matches your training

# Load model on startup
@app.on_event("startup")
async def load_model():
    global model
    try:
        model_path = os.getenv("MODEL_PATH", "./models/waste_classifier.keras")
        logger.info(f"Loading model from {model_path}")
        
        # Load model without compiling (avoids custom layer issues)
        model = tf.keras.models.load_model(model_path, compile=False)
        
        logger.info("✅ Model loaded successfully")
        logger.info(f"Model input shape: {model.input_shape}")
        logger.info(f"Model output shape: {model.output_shape}")
        
    except Exception as e:
        logger.error(f"❌ Failed to load model: {str(e)}")
        logger.warning("⚠️ Service will run without model (for testing)")
        import traceback
        logger.error(traceback.format_exc())

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    Preprocess image to match your Colab testing (simple normalization, no EfficientNet preprocessing)
    """
    try:
        # Open image
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize to model input size
        image = image.resize((IMG_SIZE, IMG_SIZE))
        
        # Convert to array (same as your Colab: img_to_array)
        img_array = np.array(image, dtype=np.float32)
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        # NO preprocessing function - just raw pixel values like your Colab code
        # Your model was trained/tested without preprocess_input
        
        return img_array
    except Exception as e:
        logger.error(f"Image preprocessing error: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid image format")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Waste Classification Model Service",
        "status": "running",
        "model_loaded": model is not None
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "model_status": "loaded" if model is not None else "not_loaded",
        "classes": class_names
    }

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Predict waste category from uploaded image
    
    Returns:
        - category: Predicted waste category
        - confidence: Prediction confidence (0-100)
    """
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400,
                detail="File must be an image (JPEG, PNG, JPG)"
            )
        
        # Read image bytes
        image_bytes = await file.read()
        
        # Check if model is loaded
        if model is None:
            # Return mock prediction for testing
            logger.warning("Model not loaded, returning mock prediction")
            return JSONResponse(
                status_code=200,
                content={
                    "category": "plastic",
                    "confidence": 85.5,
                    "message": "Mock prediction (model not loaded)"
                }
            )
        
        # Preprocess image
        processed_image = preprocess_image(image_bytes)
        
        # Make prediction
        predictions = model.predict(processed_image, verbose=0)
        
        # Get predicted class and confidence
        predicted_class_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class_idx] * 100)
        category = class_names[predicted_class_idx]
        
        logger.info(f"Prediction: {category} ({confidence:.2f}%)")
        
        return {
            "category": category,
            "confidence": round(confidence, 2),
            "all_predictions": {
                class_names[i]: round(float(predictions[0][i] * 100), 2)
                for i in range(len(class_names))
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )

@app.post("/batch-predict")
async def batch_predict(files: list[UploadFile] = File(...)):
    """
    Predict multiple images at once
    """
    if len(files) > 10:
        raise HTTPException(
            status_code=400,
            detail="Maximum 10 images allowed per batch"
        )
    
    results = []
    for file in files:
        try:
            result = await predict(file)
            results.append({
                "filename": file.filename,
                "success": True,
                **result
            })
        except Exception as e:
            results.append({
                "filename": file.filename,
                "success": False,
                "error": str(e)
            })
    
    return {"results": results}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
