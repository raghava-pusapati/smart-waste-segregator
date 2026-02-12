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
        # Use SavedModel format with TensorFlow's native loader
        # Keras 3 doesn't support SavedModel with keras.models.load_model()
        model_path = os.getenv("MODEL_PATH", "./models/model_folder")
        logger.info(f"Loading SavedModel from {model_path}")
        
        # Use TensorFlow's native SavedModel loader (not Keras)
        model = tf.saved_model.load(model_path)
        
        # Get the inference function
        # The model has a 'serving_default' signature for inference
        infer = model.signatures["serving_default"]
        
        logger.info("✅ SavedModel loaded successfully")
        logger.info(f"Model format: TensorFlow SavedModel")
        logger.info(f"Available signatures: {list(model.signatures.keys())}")
        
        # Store the inference function globally
        globals()['infer'] = infer
        
    except Exception as e:
        logger.error(f"❌ Failed to load model: {str(e)}")
        logger.warning("⚠️ Service will run without model (for testing)")
        import traceback
        logger.error(traceback.format_exc())

def preprocess_image(image_bytes: bytes) -> tf.Tensor:
    """
    Preprocess image for SavedModel inference
    Returns TensorFlow tensor ready for model input
    """
    try:
        # Open image
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize to model input size
        image = image.resize((IMG_SIZE, IMG_SIZE))
        
        # Convert to array
        img_array = np.array(image, dtype=np.float32)
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        # Convert to TensorFlow tensor
        input_tensor = tf.convert_to_tensor(img_array, dtype=tf.float32)
        
        return input_tensor
        
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
        logger.info(f"📥 Received prediction request")
        logger.info(f"   File: {file.filename}")
        logger.info(f"   Content-Type: {file.content_type}")
        
        # Validate file type
        if not file.content_type.startswith('image/'):
            logger.error(f"❌ Invalid file type: {file.content_type}")
            raise HTTPException(
                status_code=400,
                detail="File must be an image (JPEG, PNG, JPG)"
            )
        
        # Read image bytes
        image_bytes = await file.read()
        logger.info(f"   Image size: {len(image_bytes)} bytes")
        
        # Check if model is loaded
        if model is None:
            # Return mock prediction for testing
            logger.warning("⚠️ Model not loaded, returning mock prediction")
            return JSONResponse(
                status_code=200,
                content={
                    "category": "plastic",
                    "confidence": 85.5,
                    "message": "Mock prediction (model not loaded)"
                }
            )
        
        logger.info("🖼️  Preprocessing image...")
        # Preprocess image - returns TensorFlow tensor
        input_tensor = preprocess_image(image_bytes)
        logger.info(f"   Tensor shape: {input_tensor.shape}")
        
        # Get inference function
        infer = globals().get('infer')
        if infer is None:
            logger.error("❌ Inference function not available")
            raise Exception("Model inference function not available")
        
        logger.info("🤖 Running inference...")
        # Run inference
        output = infer(input_tensor)
        
        # Extract predictions from output dictionary
        output_key = list(output.keys())[0]
        predictions = output[output_key].numpy()
        logger.info(f"   Output shape: {predictions.shape}")
        
        # Get predicted class and confidence
        predicted_class_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class_idx] * 100)
        category = class_names[predicted_class_idx]
        
        logger.info(f"✅ Prediction: {category} ({confidence:.2f}%)")
        
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
        logger.error(f"❌ Prediction error: {str(e)}")
        logger.error(f"   Error type: {type(e).__name__}")
        import traceback
        logger.error(traceback.format_exc())
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
