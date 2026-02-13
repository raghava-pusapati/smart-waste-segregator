import mongoose from 'mongoose';

const wasteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    lowercase: true
    // Removed enum to allow unknown categories like textile, e-waste, battery, furniture
  },
  specificItem: {
    type: String,
    default: null
  },
  itemDescription: {
    type: String,
    default: null
  },
  isUnknownCategory: {
    type: Boolean,
    default: false
  },
  isWaste: {
    type: Boolean,
    default: true
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  imageUrl: {
    type: String,
    default: null
  },
  imageData: {
    type: String, // Base64 encoded for history
    default: null
  },
  disposalGuidance: {
    type: String,
    required: true
  },
  recyclingTips: [{
    type: String
  }],
  disposalInstructions: {
    steps: [{ type: String }],
    dos: [{ type: String }],
    donts: [{ type: String }]
  },
  aiEnhancedData: {
    source: String, // 'model', 'gemini', 'model + gemini', 'gemini (corrected)'
    hadConflict: Boolean,
    conflictDetails: {
      modelSaid: String,
      modelConfidence: Number,
      geminiSaid: String,
      reasoning: String
    },
    awareness: {
      did_you_know: String,
      global_impact: String,
      local_tip: String
    },
    alternatives: [{ type: String }]
  },
  environmentalImpact: {
    carbonSaved: {
      type: Number,
      default: 0
    },
    description: {
      type: String,
      required: true
    },
    recycling_benefits: String,
    co2_saved: String,
    water_saved: String,
    energy_saved: String
  },
  ecoPoints: {
    type: Number,
    default: 10
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for user-specific time-based queries
wasteSchema.index({ userId: 1, timestamp: -1 });

const Waste = mongoose.model('Waste', wasteSchema);

export default Waste;
