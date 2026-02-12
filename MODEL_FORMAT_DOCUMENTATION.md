# 🤖 Model Format Documentation - SavedModel

## ⚠️ IMPORTANT: Model Format

This project uses **TensorFlow SavedModel format** (NOT .keras or .h5)

### Why SavedModel Format?

The model was originally trained in TensorFlow 2.19 with Keras 3 and saved as `.keras` format. However, this caused deserialization errors during deployment:

```
Layer "dense" expects 1 input(s), but it received 2 input tensors.
```

This error occurred due to Keras 3 serialization issues with EfficientNet inside a Sequential model.

---

## ✅ Current Model Format

### Model Location:
```
model-service/
└── models/
    └── model_folder/          # SavedModel directory
        ├── saved_model.pb     # Model architecture & weights
        ├── variables/         # Model variables
        │   ├── variables.data-00000-of-00001
        │   └── variables.index
        └── assets/            # Additional assets (if any)
```

### Loading the Model:
```python
import tensorflow as tf

# Load SavedModel format
model = tf.keras.models.load_model("models/model_folder", compile=False)
```

---

## 🔄 How the Model Was Converted

### Step 1: Load Original .keras Model (in Colab)
```python
import tensorflow as tf

# Load the problematic .keras model
model = tf.keras.models.load_model("waste_classifier_clean.keras", compile=False)
```

### Step 2: Export as SavedModel
```python
# Export to SavedModel format (TensorFlow native format)
model.export("model_folder")
```

### Step 3: Download and Deploy
1. Download the `model_folder` directory from Colab
2. Place it in `model-service/models/model_folder/`
3. Update `.env` to point to the folder:
   ```
   MODEL_PATH=./models/model_folder
   ```

---

## 🚫 DO NOT Convert Back

**Never convert the SavedModel back to .keras or .h5 format!**

This will reintroduce the serialization issues. Always keep it as SavedModel.

### ❌ Don't Do This:
```python
# DON'T convert back to .keras
model.save("model.keras")  # ❌ Will cause errors

# DON'T convert to .h5
model.save("model.h5")  # ❌ Will cause errors
```

### ✅ Do This Instead:
```python
# Keep as SavedModel
model.export("model_folder")  # ✅ Correct format
```

---

## 📝 Model Configuration

### Environment Variables:
```bash
# model-service/.env
MODEL_PATH=./models/model_folder
```

### Model Details:
- **Format**: TensorFlow SavedModel
- **Input Shape**: (None, 224, 224, 3)
- **Output Shape**: (None, 6)
- **Classes**: glass, hazardous, metal, organic, paper, plastic
- **Base Model**: EfficientNetB0 (frozen)
- **Framework**: TensorFlow 2.19 + Keras 3

---

## 🔧 Retraining the Model

If you need to retrain the model in the future:

### Step 1: Train in Colab
```python
# Train your model as usual
model = create_model()
model.fit(train_data, validation_data=val_data, epochs=20)
```

### Step 2: Export as SavedModel (NOT .keras)
```python
# Export directly to SavedModel format
model.export("model_folder")

# Verify it works
loaded = tf.keras.models.load_model("model_folder")
test_pred = loaded.predict(test_image)
print("✅ Model loads successfully!")
```

### Step 3: Download and Deploy
```python
# Download the folder
from google.colab import files
import shutil

# Zip the folder for easier download
shutil.make_archive('model_folder', 'zip', 'model_folder')
files.download('model_folder.zip')
```

### Step 4: Extract and Place
1. Extract `model_folder.zip`
2. Replace `model-service/models/model_folder/` with the new folder
3. Restart model service

---

## 🧪 Testing the Model

### Test Model Loading:
```python
import tensorflow as tf
import numpy as np

# Load model
model = tf.keras.models.load_model("models/model_folder")

# Test with random input
test_input = np.random.rand(1, 224, 224, 3).astype(np.float32)
prediction = model.predict(test_input)

print(f"✅ Model loaded successfully!")
print(f"Input shape: {model.input_shape}")
print(f"Output shape: {model.output_shape}")
print(f"Prediction shape: {prediction.shape}")
print(f"Prediction sum: {prediction.sum():.4f}")  # Should be ~1.0
```

### Expected Output:
```
✅ Model loaded successfully!
Input shape: (None, 224, 224, 3)
Output shape: (None, 6)
Prediction shape: (1, 6)
Prediction sum: 1.0000
```

---

## 📊 Model Performance

- **Accuracy**: ~65% (current)
- **Target**: 85-90%+ (with improved training)
- **Categories**: 6 (glass, hazardous, metal, organic, paper, plastic)
- **Inference Time**: ~100-200ms per image

---

## 🔍 Troubleshooting

### Error: "No such file or directory: models/model_folder"
**Solution**: Make sure the model folder exists and contains:
- `saved_model.pb`
- `variables/` directory
- Check `MODEL_PATH` in `.env`

### Error: "Layer dense expects 1 input..."
**Solution**: This means you're using .keras format. Convert to SavedModel:
```python
model = tf.keras.models.load_model("model.keras", compile=False)
model.export("model_folder")
```

### Error: "Model not loaded, returning mock prediction"
**Solution**: 
1. Check model folder exists
2. Check `.env` MODEL_PATH is correct
3. Restart model service
4. Check logs for detailed error

---

## 📦 Model Folder Structure

```
model_folder/
├── saved_model.pb              # 5-10 MB (model graph)
├── variables/
│   ├── variables.data-00000-of-00001  # 15-20 MB (weights)
│   └── variables.index         # Small (index file)
├── assets/                     # Optional (usually empty)
└── fingerprint.pb              # Optional (metadata)
```

**Total Size**: ~20-30 MB

---

## ✅ Summary

- ✅ Use SavedModel format (folder with saved_model.pb)
- ✅ Load with: `tf.keras.models.load_model("model_folder")`
- ✅ Export with: `model.export("model_folder")`
- ❌ Don't use .keras or .h5 formats
- ❌ Don't convert back from SavedModel

**This format is stable, production-ready, and avoids Keras 3 serialization issues!**
