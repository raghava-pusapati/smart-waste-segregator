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

// Dustbin color mapping (Indian waste management standard)
const dustbinColors = {
  glass: { color: 'Green', emoji: '🟢', bgColor: 'bg-green-100', textColor: 'text-green-800', borderColor: 'border-green-400' },
  hazardous: { color: 'Yellow', emoji: '🟡', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', borderColor: 'border-yellow-400' },
  metal: { color: 'Blue', emoji: '🔵', bgColor: 'bg-blue-100', textColor: 'text-blue-800', borderColor: 'border-blue-400' },
  organic: { color: 'Green', emoji: '🟢', bgColor: 'bg-green-100', textColor: 'text-green-800', borderColor: 'border-green-400' },
  paper: { color: 'Blue', emoji: '🔵', bgColor: 'bg-blue-100', textColor: 'text-blue-800', borderColor: 'border-blue-400' },
  plastic: { color: 'Blue', emoji: '🔵', bgColor: 'bg-blue-100', textColor: 'text-blue-800', borderColor: 'border-blue-400' },
  textile: { color: 'Blue', emoji: '🔵', bgColor: 'bg-blue-100', textColor: 'text-blue-800', borderColor: 'border-blue-400' },
  'e-waste': { color: 'Red', emoji: '🔴', bgColor: 'bg-red-100', textColor: 'text-red-800', borderColor: 'border-red-400' },
  battery: { color: 'Yellow', emoji: '🟡', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', borderColor: 'border-yellow-400' }
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
    setResults([]); // Clear previous results
    let totalEcoPoints = 0;

    try {
      // Classify each image and show results immediately
      for (let i = 0; i < selectedImages.length; i++) {
        setClassifyingIndex(i);
        
        const formData = new FormData();
        formData.append('image', selectedImages[i]);

        try {
          const response = await wasteAPI.predict(formData);
          const newResult = {
            success: true,
            data: response.data.data
          };
          
          // Add result immediately
          setResults(prev => [...prev, newResult]);
          
          const ecoPoints = response.data.data.ecoPointsEarned || 0;
          totalEcoPoints += ecoPoints;
          
        } catch (error) {
          console.error(`Classification error for image ${i + 1}:`, error);
          setResults(prev => [...prev, {
            success: false,
            error: error.response?.data?.message || 'Classification failed'
          }]);
        }
      }

      // Update user stats with total points
      if (user && totalEcoPoints > 0) {
        updateUser({
          ...user,
          totalScans: user.totalScans + selectedImages.length,
          ecoScore: user.ecoScore + totalEcoPoints
        });
      }
      
      toast.success(`Classification complete!`);
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

              {/* Individual Results - Responsive Grid Layout */}
              <div className={`grid gap-6 auto-rows-fr ${results.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' : 'grid-cols-1 lg:grid-cols-2'}`}>
                {results.map((result, index) => (
                  result.success ? (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="glass-card rounded-3xl p-6 shadow-xl flex flex-col h-full"
                    >
                      {/* Image and Category Header */}
                      <div className="flex items-start gap-4 mb-6 flex-shrink-0">
                        {/* Waste Image */}
                        <div className="relative flex-shrink-0">
                          <img
                            src={previews[index]}
                            alt={`Result ${index + 1}`}
                            className="w-32 h-32 object-cover rounded-xl shadow-lg ring-2 ring-white"
                          />
                        </div>
                        
                        {/* Category and Dustbin */}
                        <div className="flex-1 space-y-3">
                          {/* Category Badge */}
                          <div className={`${categoryColors[result.data.category] || 'bg-gray-500'} text-white px-4 py-3 rounded-xl shadow-lg`}>
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">{categoryIcons[result.data.category] || '♻️'}</span>
                              <div>
                                <span className="font-black text-xl capitalize block">{result.data.category}</span>
                                <span className="text-sm opacity-90 font-semibold">{result.data.confidence}% Match</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Dustbin Indicator */}
                          <div className={`${dustbinColors[result.data.category]?.bgColor || 'bg-gray-100'} ${dustbinColors[result.data.category]?.borderColor || 'border-gray-400'} border-2 rounded-xl p-3 shadow-md flex items-center gap-3`}>
                            <div className="text-3xl">🗑️</div>
                            <div>
                              <div className={`${dustbinColors[result.data.category]?.textColor || 'text-gray-800'} font-black text-sm`}>
                                {dustbinColors[result.data.category]?.color || 'General'} BIN
                              </div>
                              <div className="text-xs text-gray-600 font-medium">Dispose here</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Content sections - flex-grow to fill space */}
                      <div className="flex-grow space-y-4">

                    {/* Non-Waste Message */}
                    {!result.data.isWaste && result.data.message && (
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 rounded-xl p-4 shadow-md">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">ℹ️</span>
                          <div>
                            <h4 className="font-black text-purple-900 text-base mb-1">Not Waste</h4>
                            <p className="text-purple-800 text-sm leading-relaxed font-medium">
                              {result.data.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Key Disposal Steps - Only Top 3 */}
                    {result.data.disposalInstructions?.steps && result.data.disposalInstructions.steps.length > 0 && (
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 rounded-xl p-4 shadow-md">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">📋</span>
                          <div className="flex-1">
                            <h4 className="font-black text-blue-900 text-base mb-3">Quick Steps</h4>
                            <div className="space-y-2">
                              {result.data.disposalInstructions.steps.slice(0, 3).map((step, i) => (
                                <div key={i} className="flex items-start gap-2">
                                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                                    {i + 1}
                                  </span>
                                  <p className="text-blue-900 text-sm leading-relaxed font-medium pt-0.5">{step}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Environmental Impact - Simplified */}
                    {result.data.environmentalImpactDetails?.recycling_benefits && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-xl p-4 shadow-md">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">🌍</span>
                          <div className="flex-1">
                            <h4 className="font-black text-green-900 text-base mb-2">Impact</h4>
                            <p className="text-green-800 text-sm leading-relaxed font-medium mb-3">
                              {result.data.environmentalImpactDetails.recycling_benefits}
                            </p>
                            {/* Metrics in a row */}
                            <div className="grid grid-cols-3 gap-2">
                              {result.data.environmentalImpactDetails.co2_saved && (
                                <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
                                  <p className="text-xs text-gray-600 font-semibold mb-0.5">CO₂</p>
                                  <p className="text-base font-black text-green-700">
                                    {result.data.environmentalImpactDetails.co2_saved}
                                  </p>
                                </div>
                              )}
                              {result.data.environmentalImpactDetails.water_saved && (
                                <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
                                  <p className="text-xs text-gray-600 font-semibold mb-0.5">WATER</p>
                                  <p className="text-base font-black text-blue-700">
                                    {result.data.environmentalImpactDetails.water_saved}
                                  </p>
                                </div>
                              )}
                              {result.data.environmentalImpactDetails.energy_saved && (
                                <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
                                  <p className="text-xs text-gray-600 font-semibold mb-0.5">ENERGY</p>
                                  <p className="text-base font-black text-yellow-700">
                                    {result.data.environmentalImpactDetails.energy_saved}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Did You Know - Single Most Interesting Fact */}
                    {result.data.aiEnhanced?.awareness?.did_you_know && (
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500 rounded-xl p-4 shadow-md">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">💡</span>
                          <div>
                            <h4 className="font-black text-indigo-900 text-base mb-2">Did You Know?</h4>
                            <p className="text-indigo-800 text-sm leading-relaxed font-medium">
                              {result.data.aiEnhanced.awareness.did_you_know}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                      </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card rounded-3xl p-6 border-4 border-red-300 shadow-xl"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={previews[index]}
                        alt={`Failed ${index + 1}`}
                        className="w-24 h-24 object-cover rounded-xl opacity-50 shadow-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-black text-gray-900 mb-2">
                          Classification Failed
                        </h3>
                        <p className="text-red-600 text-sm font-medium">
                          {result.error}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              ))}
              </div>

              {/* Scan Again Button */}
              <button
                onClick={handleReset}
                className="btn-primary w-full mt-6"
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
