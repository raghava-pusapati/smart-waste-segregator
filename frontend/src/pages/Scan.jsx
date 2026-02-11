import { useState, useRef } from 'react';
import { Upload, Camera, X, Loader, CheckCircle } from 'lucide-react';
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
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);
  const { user, updateUser } = useAuth();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleClassify = async () => {
    if (!selectedImage) {
      toast.error('Please select an image first');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await wasteAPI.predict(formData);
      setResult(response.data.data);
      
      // Update user stats
      if (user) {
        updateUser({
          ...user,
          totalScans: user.totalScans + 1,
          ecoScore: user.ecoScore + response.data.data.ecoPointsEarned
        });
      }
      
      toast.success('Classification successful!');
    } catch (error) {
      console.error('Classification error:', error);
      toast.error(error.response?.data?.message || 'Classification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

        {/* Main Card */}
        <div className="glass-card rounded-2xl p-8 mb-8">
          {!preview ? (
            /* Upload Area */
            <div className="text-center">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-12 hover:border-primary-500 transition-colors cursor-pointer bg-gray-50 hover:bg-primary-50"
              >
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Upload Waste Image
                </h3>
                <p className="text-gray-600 mb-4">
                  Click to browse or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  Supports: JPG, PNG (Max 5MB)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            /* Preview & Result Area */
            <div>
              <div className="relative mb-6">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-96 object-contain rounded-xl bg-gray-100"
                />
                <button
                  onClick={handleReset}
                  className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {!result && (
                <button
                  onClick={handleClassify}
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <Loader className="animate-spin mr-2 w-5 h-5" />
                      Classifying...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Camera className="mr-2 w-5 h-5" />
                      Classify Waste
                    </span>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Result Card */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card rounded-2xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Classification Result
                </h2>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>

              {/* Category Badge */}
              <div className="flex items-center justify-center mb-8">
                <div className={`${categoryColors[result.category]} text-white px-8 py-4 rounded-2xl text-center`}>
                  <span className="text-4xl mb-2 block">
                    {categoryIcons[result.category]}
                  </span>
                  <h3 className="text-2xl font-bold capitalize">
                    {result.category}
                  </h3>
                </div>
              </div>

              {/* Confidence */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-medium">Confidence</span>
                  <span className="text-2xl font-bold text-primary-500">
                    {result.confidence}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.confidence}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="bg-primary-500 h-3 rounded-full"
                  />
                </div>
              </div>

              {/* Disposal Guidance */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <span className="mr-2">📋</span>
                  Disposal Guidance
                </h4>
                <p className="text-blue-800">
                  {result.disposalGuidance}
                </p>
              </div>

              {/* Environmental Impact */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                  <span className="mr-2">🌍</span>
                  Environmental Impact
                </h4>
                <p className="text-green-800">
                  {result.environmentalImpact}
                </p>
              </div>

              {/* Eco Points */}
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 text-center">
                <p className="text-primary-900 font-medium mb-2">
                  You earned
                </p>
                <p className="text-4xl font-bold text-primary-500">
                  +{result.ecoPointsEarned} 🌱
                </p>
                <p className="text-primary-700 text-sm mt-2">
                  Eco Points
                </p>
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-4">
                <button
                  onClick={handleReset}
                  className="btn-primary flex-1"
                >
                  Scan Another
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Scan;
