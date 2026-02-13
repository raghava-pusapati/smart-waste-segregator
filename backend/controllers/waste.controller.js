import axios from 'axios';
import FormData from 'form-data';
import Waste from '../models/Waste.model.js';
import User from '../models/User.model.js';
import { verifyWithGemini, identifyWithGemini, resolveConflict } from '../services/aiEnhancement.js';

// Confidence threshold for AI enhancement
const CONFIDENCE_THRESHOLD = 50;

// Enhanced disposal guidance with detailed steps
export const enhancedDisposalGuidance = {
  glass: {
    steps: [
      'Rinse the glass item thoroughly with water',
      'Remove any lids, caps, or labels',
      'Place in the green/glass recycling bin',
      'If broken, wrap carefully in newspaper before disposal'
    ],
    dos: ['Rinse before recycling', 'Remove metal caps', 'Separate by color if required'],
    donts: ['Don\'t include broken ceramics', 'Don\'t mix with regular trash', 'Don\'t include light bulbs'],
    impact: {
      recycling_benefits: 'Glass is 100% recyclable and can be recycled endlessly without quality loss',
      co2_saved: '0.3 kg',
      water_saved: '1.2 liters',
      energy_saved: '1.0 kWh'
    },
    fact: 'Recycling one glass bottle saves enough energy to power a computer for 25 minutes!'
  },
  plastic: {
    steps: [
      'Check the recycling number (1-7) on the bottom',
      'Rinse the container thoroughly',
      'Remove caps and labels if possible',
      'Place in the blue/dry waste recycling bin'
    ],
    dos: ['Rinse containers', 'Check recycling symbols', 'Flatten bottles to save space'],
    donts: ['Don\'t include plastic bags', 'Don\'t mix with food waste', 'Don\'t burn plastic'],
    impact: {
      recycling_benefits: 'Recycling plastic reduces ocean pollution and saves petroleum resources',
      co2_saved: '0.5 kg',
      water_saved: '2.0 liters',
      energy_saved: '1.5 kWh'
    },
    fact: 'It takes 450 years for a plastic bottle to decompose in a landfill!'
  },
  paper: {
    steps: [
      'Keep paper dry and clean',
      'Remove any plastic windows or staples',
      'Flatten cardboard boxes',
      'Place in the blue/dry waste recycling bin'
    ],
    dos: ['Keep paper dry', 'Remove plastic parts', 'Flatten boxes'],
    donts: ['Don\'t include wet paper', 'Don\'t include tissue paper', 'Don\'t include wax-coated paper'],
    impact: {
      recycling_benefits: 'Recycling paper saves trees and reduces landfill waste',
      co2_saved: '0.4 kg',
      water_saved: '3.0 liters',
      energy_saved: '2.0 kWh'
    },
    fact: 'Recycling one ton of paper saves 17 trees and 7,000 gallons of water!'
  },
  metal: {
    steps: [
      'Rinse cans and containers',
      'Remove labels if possible',
      'Crush cans to save space',
      'Place in the blue/dry waste recycling bin'
    ],
    dos: ['Rinse thoroughly', 'Remove labels', 'Crush to save space'],
    donts: ['Don\'t include paint cans', 'Don\'t include aerosol cans', 'Don\'t mix with food waste'],
    impact: {
      recycling_benefits: 'Recycling metal saves 95% of the energy needed to produce new metal',
      co2_saved: '0.6 kg',
      water_saved: '1.5 liters',
      energy_saved: '2.5 kWh'
    },
    fact: 'Aluminum cans can be recycled and back on store shelves in just 60 days!'
  },
  organic: {
    steps: [
      'Separate food scraps from packaging',
      'Place in the green/wet waste bin',
      'Consider home composting__ if possible',
      'Keep separate from dry waste'
    ],
    dos: ['Compost at home', 'Use biodegradable bags', 'Keep moist waste separate'],
    donts: ['Don\'t include plastic packaging', 'Don\'t include meat bones', 'Don\'t mix with dry waste'],
    impact: {
      recycling_benefits: 'Composting reduces methane emissions and creates nutrient-rich soil',
      co2_saved: '0.2 kg',
      water_saved: '0.5 liters',
      energy_saved: '0.5 kWh'
    },
    fact: 'Food waste in landfills produces methane, a greenhouse gas 25x more potent than CO2!'
  },
  hazardous: {
    steps: [
      'Do NOT dispose in regular trash',
      'Store safely until collection day',
      'Take to designated hazardous waste facility',
      'Contact local authorities for guidance'
    ],
    dos: ['Store safely', 'Use designated facilities', 'Follow local guidelines'],
    donts: ['Never burn hazardous waste', 'Don\'t pour down drains', 'Don\'t mix with regular trash'],
    impact: {
      recycling_benefits: 'Proper disposal prevents soil and water contamination',
      co2_saved: '0.1 kg',
      water_saved: '0.3 liters',
      energy_saved: '0.2 kWh'
    },
    fact: 'One battery can contaminate 600,000 liters of water if not disposed properly!'
  }
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

// @desc    Predict waste category with AI enhancement
// @route   POST /api/waste/predict
// @access  Private
export const predictWaste = async (req, res, next) => {
  try {
    console.log('📥 Prediction request received');
    console.log('   User:', req.user?.email);
    console.log('   File:', req.file?.originalname);
    console.log('🔍 Cloudinary Upload Details:');
    console.log('   Path (URL):', req.file?.path);
    console.log('   Filename (Public ID):', req.file?.filename);
    console.log('   Full file object:', JSON.stringify(req.file, null, 2));
    
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }
    
    if (!req.file.path) {
      console.log('❌ Cloudinary upload failed - no path returned');
      return res.status(500).json({
        success: false,
        message: 'Image upload to Cloudinary failed'
      });
    }

    console.log('📤 Sending to model service...');
    
    // Download image from Cloudinary to send to model service
    const imageResponse = await axios.get(req.file.path, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(imageResponse.data);
    
    // Prepare form data for model service
    const formData = new FormData();
    formData.append('file', imageBuffer, {
      filename: req.file.originalname || 'image.jpg',
      contentType: req.file.mimetype || 'image/jpeg'
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
    
    const { category: modelCategory, confidence: modelConfidence } = modelResponse.data;
    
    console.log(`🎯 Model Classification: ${modelCategory} (${modelConfidence}%)`);
    console.log(`📊 Confidence Threshold: ${CONFIDENCE_THRESHOLD}%`);

    // AI Enhancement Logic
    let finalResult;
    let geminiResult = null;
    
    if (modelConfidence >= CONFIDENCE_THRESHOLD) {
      // HIGH CONFIDENCE: Verify with Gemini
      console.log('✅ High confidence - Verifying with Gemini...');
      geminiResult = await verifyWithGemini(imageBuffer, req.file.mimetype, modelCategory, modelConfidence);
      finalResult = resolveConflict(modelCategory, modelConfidence, geminiResult);
    } else {
      // LOW CONFIDENCE: Identify with Gemini
      console.log('⚠️ Low confidence - Identifying with Gemini...');
      geminiResult = await identifyWithGemini(imageBuffer, req.file.mimetype, modelCategory, modelConfidence);
      
      if (geminiResult && geminiResult.item_identified !== 'unknown item') {
        finalResult = {
          category: geminiResult.category,
          specificItem: geminiResult.item_identified,
          itemDescription: geminiResult.item_description,
          confidence: modelConfidence,
          source: 'gemini (low confidence)',
          hadConflict: false,
          isWaste: geminiResult.is_waste,
          isUnknownCategory: !['glass', 'hazardous', 'metal', 'organic', 'paper', 'plastic'].includes(geminiResult.category),
          disposalGuidance: geminiResult.disposal_instructions.steps.join('. '),
          recyclingTips: geminiResult.disposal_instructions.dos,
          disposalInstructions: geminiResult.disposal_instructions,
          environmentalImpact: geminiResult.environmental_impact,
          awareness: geminiResult.awareness,
          alternatives: geminiResult.alternatives,
          message: geminiResult.message
        };
      } else {
        // Gemini also failed
        finalResult = resolveConflict(modelCategory, modelConfidence, null);
      }
    }

    console.log('🎉 Final Result:', {
      category: finalResult.category,
      specificItem: finalResult.specificItem,
      source: finalResult.source,
      hadConflict: finalResult.hadConflict
    });

    // Calculate eco score
    const ecoPoints = finalResult.isWaste ? calculateEcoScore(finalResult.category, modelConfidence) : 0;
    
    // Ensure ecoPoints is a valid number
    const validEcoPoints = isNaN(ecoPoints) ? 0 : Math.max(0, Math.round(ecoPoints));
    
    console.log('💾 Saving to database...');

    // Get Cloudinary URL (multer-storage-cloudinary automatically uploads)
    const imageUrl = req.file?.path || null; // Cloudinary URL
    const imagePublicId = req.file?.filename || null; // Cloudinary public ID
    
    console.log('📸 Image Storage Info:');
    console.log('   Image URL:', imageUrl);
    console.log('   Public ID:', imagePublicId);

    // Prepare waste record data
    const wasteData = {
      userId: req.user._id,
      category: finalResult.category.toLowerCase(),
      specificItem: finalResult.specificItem,
      itemDescription: finalResult.itemDescription,
      confidence: Math.round(modelConfidence),
      isUnknownCategory: finalResult.isUnknownCategory || false,
      isWaste: finalResult.isWaste,
      imageUrl: imageUrl, // Save Cloudinary URL
      imageData: imagePublicId, // Save public ID for deletion later
      disposalGuidance: finalResult.disposalGuidance || disposalGuidance[finalResult.category.toLowerCase()] || 'Contact local waste management for guidance',
      recyclingTips: finalResult.recyclingTips || [],
      disposalInstructions: finalResult.disposalInstructions || {
        steps: [finalResult.disposalGuidance || 'Dispose properly'],
        dos: finalResult.recyclingTips || [],
        donts: []
      },
      environmentalImpact: {
        carbonSaved: 0,
        description: finalResult.environmentalImpact?.recycling_benefits || environmentalImpact[finalResult.category.toLowerCase()] || 'Proper disposal helps the environment',
        recycling_benefits: finalResult.environmentalImpact?.recycling_benefits,
        co2_saved: finalResult.environmentalImpact?.co2_saved,
        water_saved: finalResult.environmentalImpact?.water_saved,
        energy_saved: finalResult.environmentalImpact?.energy_saved
      },
      aiEnhancedData: {
        source: finalResult.source,
        hadConflict: finalResult.hadConflict,
        conflictDetails: finalResult.conflictDetails,
        awareness: finalResult.awareness,
        alternatives: finalResult.alternatives
      },
      ecoPoints: validEcoPoints,
      timestamp: new Date()
    };

    // Save waste record
    const wasteRecord = await Waste.create(wasteData);

    console.log('✅ Waste record saved:', wasteRecord._id);
    console.log('   Saved imageUrl:', wasteRecord.imageUrl);
    console.log('   Saved imageData:', wasteRecord.imageData);
    console.log('📊 Updating user stats...');

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        totalScans: 1,
        ecoScore: validEcoPoints
      }
    });

    console.log('✅ User stats updated');
    console.log('🎉 Prediction complete!');

    // Prepare response
    const responseData = {
      id: wasteRecord._id,
      category: wasteRecord.category,
      specificItem: wasteRecord.specificItem,
      itemDescription: wasteRecord.itemDescription,
      confidence: wasteRecord.confidence,
      isWaste: wasteRecord.isWaste,
      isUnknownCategory: wasteRecord.isUnknownCategory,
      disposalGuidance: wasteRecord.disposalGuidance,
      disposalInstructions: wasteRecord.disposalInstructions,
      environmentalImpact: wasteRecord.environmentalImpact.description,
      environmentalImpactDetails: {
        recycling_benefits: wasteRecord.environmentalImpact.recycling_benefits,
        co2_saved: wasteRecord.environmentalImpact.co2_saved,
        water_saved: wasteRecord.environmentalImpact.water_saved,
        energy_saved: wasteRecord.environmentalImpact.energy_saved
      },
      ecoPointsEarned: validEcoPoints,
      timestamp: wasteRecord.timestamp,
      aiEnhanced: {
        source: wasteRecord.aiEnhancedData.source,
        hadConflict: wasteRecord.aiEnhancedData.hadConflict,
        conflictDetails: wasteRecord.aiEnhancedData.conflictDetails,
        awareness: wasteRecord.aiEnhancedData.awareness,
        alternatives: wasteRecord.aiEnhancedData.alternatives
      }
    };

    // Add message for non-waste items
    if (!wasteRecord.isWaste && finalResult.message) {
      responseData.message = finalResult.message;
    }

    res.status(200).json({
      success: true,
      message: wasteRecord.isWaste ? 'Waste classified successfully' : 'Item identified (not waste)',
      data: responseData
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

// @desc    Get user waste history grouped by date
// @route   GET /api/waste/history
// @access  Private
export const getHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    // Get all scans for the user, sorted by date (newest first)
    const scans = await Waste.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .select('category imageUrl disposalGuidance timestamp confidence')
      .lean();

    // Group scans by date
    const groupedByDate = {};
    
    scans.forEach(scan => {
      const date = new Date(scan.timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!groupedByDate[date]) {
        groupedByDate[date] = {
          date: date,
          timestamp: scan.timestamp,
          scans: [],
          categoryCounts: {}
        };
      }
      
      groupedByDate[date].scans.push(scan);
      
      // Count categories
      groupedByDate[date].categoryCounts[scan.category] = 
        (groupedByDate[date].categoryCounts[scan.category] || 0) + 1;
    });

    // Convert to array and sort by date
    const historyByDate = Object.values(groupedByDate).sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    res.status(200).json({
      success: true,
      data: {
        history: historyByDate,
        totalScans: scans.length
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
