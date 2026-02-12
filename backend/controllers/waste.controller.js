import axios from 'axios';
import FormData from 'form-data';
import Waste from '../models/Waste.model.js';
import User from '../models/User.model.js';

// Disposal guidance mapping
const disposalGuidance = {
  glass: 'Rinse and place in the glass recycling bin. Remove lids and caps. Broken glass should be wrapped safely.',
  hazardous: 'Take to a hazardous waste facility. Never dispose in regular trash. Contains harmful chemicals.',
  metal: 'Place in the metal recycling bin. Clean cans and remove labels. Aluminum and steel are highly recyclable.',
  organic: 'Compost in the green bin. Food scraps and yard waste decompose naturally and enrich soil.',
  paper: 'Place in the paper recycling bin. Keep dry and clean. Remove any plastic windows or staples.',
  plastic: 'Check the recycling number. Rinse containers and remove caps. Place in appropriate recycling bin.'
};

// Environmental impact messages
const environmentalImpact = {
  glass: 'Glass is 100% recyclable and can be recycled endlessly without loss of quality. Great choice! ♻️',
  hazardous: 'Proper disposal prevents soil and water contamination. Thank you for being responsible! ⚠️',
  metal: 'Recycling metal saves 95% of the energy needed to produce new metal. Excellent work! 🔧',
  organic: 'Composting reduces methane emissions and creates nutrient-rich soil. Excellent choice! 🌱',
  paper: 'Recycling paper saves trees and reduces landfill waste. One ton saves 17 trees! 📄',
  plastic: 'Recycling plastic reduces ocean pollution and saves petroleum resources. Keep it up! 🌊'
};

// Eco score calculation
const calculateEcoScore = (category, confidence) => {
  const basePoints = {
    glass: 10,
    metal: 10,
    paper: 9,
    plastic: 8,
    organic: 8,
    hazardous: 5
  };
  
  const confidenceMultiplier = confidence / 100;
  const points = Math.round(basePoints[category] * confidenceMultiplier);
  
  return points;
};

// @desc    Predict waste category
// @route   POST /api/waste/predict
// @access  Private
export const predictWaste = async (req, res, next) => {
  try {
    console.log('📥 Prediction request received');
    console.log('   User:', req.user?.email);
    console.log('   File:', req.file?.originalname);
    
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    console.log('📤 Sending to model service...');
    
    // Prepare form data for model service
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    // Call model service
    const modelResponse = await axios.post(
      `${process.env.MODEL_SERVICE_URL}/predict`,
      formData,
      {
        headers: {
          ...formData.getHeaders()
        },
        timeout: 30000 // 30 seconds timeout
      }
    );

    console.log('✅ Model response:', modelResponse.data);
    
    const { category, confidence } = modelResponse.data;

    // Calculate eco score
    const ecoPoints = calculateEcoScore(category, confidence);
    
    console.log('💾 Saving to database...');

    // Save waste record
    const wasteRecord = await Waste.create({
      userId: req.user._id,
      category: category.toLowerCase(),
      confidence: Math.round(confidence),
      disposalGuidance: disposalGuidance[category.toLowerCase()],
      environmentalImpact: {
        carbonSaved: 0,
        description: environmentalImpact[category.toLowerCase()]
      },
      ecoPoints: ecoPoints,
      timestamp: new Date()
    });

    console.log('✅ Waste record saved:', wasteRecord._id);
    console.log('📊 Updating user stats...');

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        totalScans: 1,
        ecoScore: ecoPoints
      }
    });

    console.log('✅ User stats updated');
    console.log('🎉 Prediction complete!');

    res.status(200).json({
      success: true,
      message: 'Waste classified successfully',
      data: {
        id: wasteRecord._id,
        category: wasteRecord.category,
        confidence: wasteRecord.confidence,
        disposalGuidance: wasteRecord.disposalGuidance,
        environmentalImpact: wasteRecord.environmentalImpact.description,
        ecoPointsEarned: ecoPoints,
        timestamp: wasteRecord.timestamp
      }
    });
  } catch (error) {
    console.error('❌ Prediction error:', error.message);
    console.error('   Error details:', error.response?.data || error);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'Model service is unavailable. Please try again later.'
      });
    }
    
    if (error.name === 'ValidationError') {
      console.error('   Validation error:', error.errors);
      return res.status(400).json({
        success: false,
        message: 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ')
      });
    }
    
    next(error);
  }
};

// @desc    Get user waste history
// @route   GET /api/waste/history
// @access  Private
export const getHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;

    const history = await Waste.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Waste.countDocuments({ userId: req.user._id });

    res.status(200).json({
      success: true,
      data: {
        history,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalRecords: total,
          hasMore: skip + history.length < total
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user statistics
// @route   GET /api/waste/stats
// @access  Private
export const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get user info
    const user = await User.findById(userId);

    // Category distribution
    const categoryDistribution = await Waste.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Monthly activity (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyActivity = await Waste.aggregate([
      {
        $match: {
          userId: userId,
          timestamp: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Recent scans
    const recentScans = await Waste.find({ userId: userId })
      .sort({ timestamp: -1 })
      .limit(5)
      .select('category confidence timestamp');

    res.status(200).json({
      success: true,
      data: {
        totalScans: user.totalScans,
        ecoScore: user.ecoScore,
        categoryDistribution: categoryDistribution.map(item => ({
          category: item._id,
          count: item.count
        })),
        monthlyActivity: monthlyActivity.map(item => ({
          month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
          count: item.count
        })),
        recentScans
      }
    });
  } catch (error) {
    next(error);
  }
};
