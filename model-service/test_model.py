"""
Quick test script to verify model loads correctly
Run: python test_model.py
"""
import tensorflow as tf
import numpy as np
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("=" * 60)
print("MODEL LOADING TEST")
print("=" * 60)

# Get model path
model_path = os.getenv("MODEL_PATH", "./models/model_folder")
print(f"\n📁 Model path: {model_path}")

# Check if path exists
if not os.path.exists(model_path):
    print(f"❌ ERROR: Model path does not exist!")
    print(f"   Looking for: {os.path.abspath(model_path)}")
    exit(1)

print(f"✅ Model path exists")

# Check for required files
required_files = [
    os.path.join(model_path, "saved_model.pb"),
    os.path.join(model_path, "variables", "variables.index"),
    os.path.join(model_path, "variables", "variables.data-00000-of-00001")
]

for file in required_files:
    if os.path.exists(file):
        size = os.path.getsize(file) / (1024 * 1024)  # MB
        print(f"✅ {os.path.basename(file)}: {size:.2f} MB")
    else:
        print(f"❌ Missing: {file}")

print("\n" + "=" * 60)
print("LOADING MODEL...")
print("=" * 60)

try:
    # Load model using TensorFlow's native SavedModel loader
    # Keras 3 doesn't support SavedModel with keras.models.load_model()
    model = tf.saved_model.load(model_path)
    
    print("\n✅ MODEL LOADED SUCCESSFULLY!")
    print(f"\n📊 Model Details:")
    print(f"   Available signatures: {list(model.signatures.keys())}")
    
    # Get the inference function
    infer = model.signatures["serving_default"]
    print(f"   Inference signature: serving_default")
    
    # Test prediction
    print("\n" + "=" * 60)
    print("TESTING PREDICTION...")
    print("=" * 60)
    
    # Create random test image
    test_image = np.random.rand(1, 224, 224, 3).astype(np.float32)
    print(f"\n🖼️  Test image shape: {test_image.shape}")
    
    # Convert to tensor
    input_tensor = tf.convert_to_tensor(test_image, dtype=tf.float32)
    
    # Make prediction
    output = infer(input_tensor)
    
    # Get output key
    output_key = list(output.keys())[0]
    prediction = output[output_key].numpy()
    
    print(f"✅ Prediction successful!")
    print(f"\n📈 Prediction Results:")
    print(f"   Output key: {output_key}")
    print(f"   Shape: {prediction.shape}")
    print(f"   Sum: {prediction.sum():.4f} (should be ~1.0)")
    
    # Show class probabilities
    class_names = ['glass', 'hazardous', 'metal', 'organic', 'paper', 'plastic']
    print(f"\n🎯 Class Probabilities:")
    for i, class_name in enumerate(class_names):
        prob = prediction[0][i] * 100
        print(f"   {class_name:12} : {prob:6.2f}%")
    
    predicted_class = class_names[np.argmax(prediction[0])]
    confidence = np.max(prediction[0]) * 100
    print(f"\n🏆 Predicted: {predicted_class} ({confidence:.2f}%)")
    
    print("\n" + "=" * 60)
    print("✅ ALL TESTS PASSED!")
    print("=" * 60)
    print("\n🚀 Your model is ready to use!")
    print("   Start the service with: uvicorn main:app --reload --port 8000")
    
except Exception as e:
    print(f"\n❌ ERROR LOADING MODEL:")
    print(f"   {str(e)}")
    print("\n📝 Troubleshooting:")
    print("   1. Check if model_folder contains saved_model.pb")
    print("   2. Check if variables folder has the weight files")
    print("   3. Try re-exporting the model in Colab")
    import traceback
    print("\n🔍 Full error:")
    traceback.print_exc()
    exit(1)
