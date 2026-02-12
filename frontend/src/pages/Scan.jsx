import { useState, useRef } from 'react';
import { Upload, Camera, X, Loader, CheckCircle, Image as ImageIcon, Trash2 } from 'lucide-react';
import { wasteAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const categoryColors = {
  glass: 'bg-cyan-500',
  hazardous: 'bg-red-500',
  metal: 'bg-gray-600',
  organic: 'bg-green-500',
  paper: 'bg-amber-500',
  plastic: 'bg-blue-500'
};

const categoryIcons = {
  glass: '🥃',
  hazardous: '⚠️',
  metal: '🔧',
  organic: '🌱',
  paper: '📄',
  plastic: '♻️'
};

const Scan = () => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [classifyingIndex, setClassifyingIndex] = useState(-1);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { user, updateUser } = useAuth();

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Validate files
    const validFiles = [];
    const newPreviews = [];
    
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        continue;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }
    
    if (validFiles.length > 0) {
      setSelectedImages([...selectedImages, ...validFiles]);
      setPreviews([...previews, ...newPreviews]);
      setResults([]);
      toast.success(`${validFiles.length} image(s) added`);
    }
    
    // Reset input value so same file can be selected again
    e.target.value = '';
  };

  const handleCameraCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please capture an image');
        return;
      }
      setSelectedImages([...selectedImages, file]);
      setPreviews([...previews, URL.createObjectURL(file)]);
      setResults([]);
      toast.success('Photo captured!');
    }
    
    // Reset input value so camera can be used again
    e.target.value = '';
  };

  // Open webcam
  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use rear camera on mobile
      });
      setStream(mediaStream);
      setShowCamera(true);
      
      // Wait for video element to be ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
      
      toast.success('Camera opened! Position your waste item and click Capture');
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('Could not access camera. Using file picker instead.');
      // Fallback to file input
      cameraInputRef.current?.click();
    }
  };

  // Capture photo from webcam
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setSelectedImages([...selectedImages, file]);
        setPreviews([...previews, URL.createObjectURL(file)]);
        setResults([]);
        toast.success('Photo captured!');
        closeCamera();
      }
    }, 'image/jpeg', 0.95);
  };

  // Close webcam
  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setPreviews(newPreviews);
    
    // Also remove result if exists
    if (results.length > 0) {
      const newResults = results.filter((_, i) => i !== index);
      setResults(newResults);
    }
  };

  const handleClassify = async () => {
    if (selectedImages.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    setLoading(true);
    setResults([]);
    const newResults = [];
    let totalEcoPoints = 0;

    try {
      // Classify each image
      for (let i = 0; i < selectedImages.length; i++) {
        setClassifyingIndex(i);
        
        const formData = new FormData();
        formData.append('image', selectedImages[i]);

        try {
          const response = await wasteAPI.predict(formData);
          newResults.push({
            success: true,
            data: response.data.data
          });
          totalEcoPoints += response.data.data.ecoPointsEarned;
        } catch (error) {
          console.error(`Classification error for image ${i + 1}:`, error);
          newResults.push({
            success: false,
            error: error.response?.data?.message || 'Classification failed'
          });
        }
      }

      setResults(newResults);
      
      // Update user stats with total points
      if (user && totalEcoPoints > 0) {
        updateUser({
          ...user,
          totalScans: user.totalScans + selectedImages.length,
          ecoScore: user.ecoScore + totalEcoPoints
        });
      }
      
      const successCount = newResults.filter(r => r.success).length;
      toast.success(`${successCount}/${selectedImages.length} images classified successfully!`);
    } catch (error) {
      console.error('Classification error:', error);
      toast.error('Classification failed');
    } finally {
      setLoading(false);
      setClassifyingIndex(-1);
    }
  };

  const handleReset = () => {
    setSelectedImages([]);
    setPreviews([]);
    setResults([]);
    closeCamera(); // Close camera if open
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Scan Your Waste
          </h1>
          <p className="text-lg text-gray-600">
            Upload or capture an image to classify waste and get disposal guidance
          </p>
        </div>

        {/* Camera Modal */}
        {showCamera && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Take Photo</h3>
                <button
                  onClick={closeCamera}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="relative bg-black rounded-xl overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-auto"
                  style={{ maxHeight: '60vh' }}
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={capturePhoto}
                  className="btn-primary flex-1"
                >
                  <Camera className="mr-2 w-5 h-5 inline" />
                  Capture Photo
                </button>
                <button
                  onClick={closeCamera}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hidden File Inputs - Keep outside conditional so refs always work */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCameraCapture}
          className="hidden"
        />

        {/* Main Card */}
        <div className="glass-card rounded-2xl p-8 mb-8">
          {selectedImages.length === 0 ? (
            /* Upload Area */
            <div className="space-y-4">
              {/* Upload Button */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-12 hover:border-primary-500 transition-colors cursor-pointer bg-gray-50 hover:bg-primary-50"
              >
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Upload Waste Images
                </h3>
                <p className="text-gray-600 mb-4">
                  Click to browse or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  Supports: JPG, PNG (Max 5MB per image)
                </p>
                <p className="text-sm text-primary-500 font-medium mt-2">
                  📸 You can select multiple images at once!
                </p>
              </div>

              {/* Camera Button */}
              <div className="text-center">
                <button
                  onClick={openCamera}
                  className="btn-primary inline-flex items-center"
                >
                  <Camera className="mr-2 w-5 h-5" />
                  Take Photo with Camera
                </button>
              </div>
            </div>
          ) : (
            /* Preview & Classify Area */
            <div>
              {/* Image Grid */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Selected Images ({selectedImages.length})
                  </h3>
                  <button
                    onClick={handleReset}
                    className="text-red-500 hover:text-red-600 text-sm flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear All
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg bg-gray-100"
                      />
                      {/* Remove button */}
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {/* Loading indicator */}
                      {loading && classifyingIndex === index && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                          <Loader className="animate-spin w-8 h-8 text-white" />
                        </div>
                      )}
                      {/* Success indicator */}
                      {results[index]?.success && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white p-1.5 rounded-full shadow-lg">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add More Button */}
              {results.length === 0 && (
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary flex-1 flex items-center justify-center"
                  >
                    <ImageIcon className="mr-2 w-5 h-5" />
                    Add More Images
                  </button>
                  <button
                    onClick={openCamera}
                    className="btn-secondary flex-1 flex items-center justify-center"
                  >
                    <Camera className="mr-2 w-5 h-5" />
                    Take Photo
                  </button>
                </div>
              )}

              {/* Classify Button */}
              {results.length === 0 && (
                <button
                  onClick={handleClassify}
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <Loader className="animate-spin mr-2 w-5 h-5" />
                      Classifying {classifyingIndex + 1}/{selectedImages.length}...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Camera className="mr-2 w-5 h-5" />
                      Classify All Images
                    </span>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results Cards */}
        <AnimatePresence>
          {results.length > 0 && (
            <div className="space-y-6">
              {/* Summary Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6 bg-gradient-to-r from-primary-50 to-accent-50"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Classification Summary
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary-500">
                      {results.filter(r => r.success).length}
                    </p>
                    <p className="text-sm text-gray-600">Successful</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-red-500">
                      {results.filter(r => !r.success).length}
                    </p>
                    <p className="text-sm text-gray-600">Failed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-500">
                      +{results.reduce((sum, r) => sum + (r.success ? r.data.ecoPointsEarned : 0), 0)}
                    </p>
                    <p className="text-sm text-gray-600">Eco Points</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">
                      {selectedImages.length}
                    </p>
                    <p className="text-sm text-gray-600">Total Images</p>
                  </div>
                </div>
              </motion.div>

              {/* Individual Results */}
              {results.map((result, index) => (
                result.success ? (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card rounded-2xl p-6"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={previews[index]}
                        alt={`Result ${index + 1}`}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            Image {index + 1}
                          </h3>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                        <div className={`${categoryColors[result.data.category]} text-white px-4 py-2 rounded-lg inline-flex items-center gap-2`}>
                          <span className="text-2xl">{categoryIcons[result.data.category]}</span>
                          <span className="font-bold capitalize">{result.data.category}</span>
                          <span className="text-sm">({result.data.confidence}%)</span>
                        </div>
                      </div>
                    </div>

                    {/* Disposal Guidance */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-3">
                      <h4 className="font-semibold text-blue-900 mb-1 flex items-center text-sm">
                        <span className="mr-2">📋</span>
                        Disposal Guidance
                      </h4>
                      <p className="text-blue-800 text-sm">
                        {result.data.disposalGuidance}
                      </p>
                    </div>

                    {/* Environmental Impact */}
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <h4 className="font-semibold text-green-900 mb-1 flex items-center text-sm">
                        <span className="mr-2">🌍</span>
                        Environmental Impact
                      </h4>
                      <p className="text-green-800 text-sm">
                        {result.data.environmentalImpact}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card rounded-2xl p-6 border-2 border-red-200"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={previews[index]}
                        alt={`Failed ${index + 1}`}
                        className="w-24 h-24 object-cover rounded-lg opacity-50"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Image {index + 1} - Failed
                        </h3>
                        <p className="text-red-600">
                          {result.error}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              ))}

              {/* Scan Again Button */}
              <button
                onClick={handleReset}
                className="btn-primary w-full"
              >
                Scan More Items
              </button>
            </div>
          )}
        </AnimatePresence>


      </div>
    </div>
  );
};

export default Scan;
