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
    enum: ['glass', 'hazardous', 'metal', 'organic', 'paper', 'plastic'],
    lowercase: true
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
  disposalGuidance: {
    type: String,
    required: true
  },
  environmentalImpact: {
    type: String,
    required: true
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
