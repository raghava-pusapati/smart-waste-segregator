import '../config/env.js'; // Load environment variables FIRST
import { GoogleGenerativeAI } from '@google/generative-ai';

// Import enhanced fallback data
const enhancedDisposalGuidance = {
  glass: {
    steps: ['Rinse the glass item thoroughly', 'Remove lids and caps', 'Place in green/glass bin', 'Wrap if broken'],
    dos: ['Rinse before recycling', 'Remove metal caps', 'Separate by color'],
    donts: ['No broken ceramics', 'No regular trash', 'No light bulbs'],
    impact: { recycling_benefits: 'Glass is 100% recyclable endlessly', co2_saved: '0.3 kg', water_saved: '1.2 liters', energy_saved: '1.0 kWh' },
    fact: 'Recycling one glass bottle powers a computer for 25 minutes!'
  },
  plastic: {
    steps: ['Check recycling number', 'Rinse thoroughly', 'Remove caps and labels', 'Place in blue bin'],
    dos: ['Rinse containers', 'Check symbols', 'Flatten bottles'],
    donts: ['No plastic bags', 'No food waste', 'No burning'],
    impact: { recycling_benefits: 'Reduces ocean pollution and saves petroleum', co2_saved: '0.5 kg', water_saved: '2.0 liters', energy_saved: '1.5 kWh' },
    fact: 'Plastic bottles take 450 years to decompose!'
  },
  paper: {
    steps: ['Keep dry and clean', 'Remove plastic parts', 'Flatten boxes', 'Place in blue bin'],
    dos: ['Keep dry', 'Remove plastic', 'Flatten boxes'],
    donts: ['No wet paper', 'No tissue', 'No wax-coated'],
    impact: { recycling_benefits: 'Saves trees and reduces landfill waste', co2_saved: '0.4 kg', water_saved: '3.0 liters', energy_saved: '2.0 kWh' },
    fact: 'One ton of recycled paper saves 17 trees!'
  },
  metal: {
    steps: ['Rinse containers', 'Remove labels', 'Crush cans', 'Place in blue bin'],
    dos: ['Rinse thoroughly', 'Remove labels', 'Crush cans'],
    donts: ['No paint cans', 'No aerosols', 'No food waste'],
    impact: { recycling_benefits: 'Saves 95% energy vs new metal production', co2_saved: '0.6 kg', water_saved: '1.5 liters', energy_saved: '2.5 kWh' },
    fact: 'Aluminum cans recycled in 60 days!'
  },
  organic: {
    steps: ['Separate from packaging', 'Place in green bin', 'Consider composting', 'Keep separate'],
    dos: ['Compost at home', 'Use biodegradable bags', 'Keep moist separate'],
    donts: ['No plastic', 'No meat bones', 'No dry waste'],
    impact: { recycling_benefits: 'Reduces methane and creates rich soil', co2_saved: '0.2 kg', water_saved: '0.5 liters', energy_saved: '0.5 kWh' },
    fact: 'Food waste produces methane, 25x worse than CO2!'
  },
  hazardous: {
    steps: ['Do NOT use regular trash', 'Store safely', 'Take to facility', 'Contact authorities'],
    dos: ['Store safely', 'Use facilities', 'Follow guidelines'],
    donts: ['Never burn', 'No drains', 'No regular trash'],
    impact: { recycling_benefits: 'Prevents soil and water contamination', co2_saved: '0.1 kg', water_saved: '0.3 liters', energy_saved: '0.2 kWh' },
    fact: 'One battery contaminates 600,000 liters of water!'
  }
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Model priority list (try in order if quota exceeded)
const MODEL_PRIORITY = [
  'gemini-2.5-flash-lite',  // Try this first (higher quota)
  'gemini-2.0-flash-lite',  // Fallback 1 (even higher quota)
  'gemini-2.5-flash'        // Fallback 2 (lowest quota, last resort)
];

let currentModelIndex = 0;

function getModel() {
  const modelName = MODEL_PRIORITY[currentModelIndex];
  console.log(`🤖 Using model: ${modelName}`);
  return genAI.getGenerativeModel({ model: modelName });
}

function switchToNextModel() {
  if (currentModelIndex < MODEL_PRIORITY.length - 1) {
    currentModelIndex++;
    console.log(`⚠️ Switching to next model: ${MODEL_PRIORITY[currentModelIndex]}`);
    return true;
  }
  console.log('❌ All models exhausted');
  return false;
}

// Debug: Check if API key is loaded
if (!process.env.GEMINI_API_KEY) {
  console.error('⚠️  WARNING: GEMINI_API_KEY not found in environment variables!');
} else {
  console.log('✅ Gemini API Key loaded:', process.env.GEMINI_API_KEY.substring(0, 20) + '...');
}

/**
 * Verify model's prediction with Gemini AI
 * Used when model has high confidence
 */
export const verifyWithGemini = async (imageBuffer, mimeType, modelCategory, confidence) => {
  try {
    const model = getModel();
    const imageBase64 = imageBuffer.toString('base64');

    const prompt = `
You are a waste management expert.

Our TensorFlow model classified this image as "${modelCategory}" with ${confidence}% confidence.

Your task:
1. Analyze the image carefully
2. Determine if you AGREE or DISAGREE with the classification
3. If you disagree, identify what it actually is

IMPORTANT DISTINCTIONS:
- Our model is trained on: glass, hazardous, metal, organic, paper, plastic
- "organic" means FOOD WASTE, YARD WASTE, BIODEGRADABLE WASTE (banana peels, leaves, etc.)
- "organic" does NOT mean cloth/textile (even if cotton/natural fiber)
- "organic" does NOT mean wood furniture
- If you see cloth/textile → category is "textile", NOT "organic"
- If you see electronics → category is "e-waste", NOT "metal"
- If you see batteries → category is "battery", NOT just "hazardous"
- If you see furniture → category is "furniture", NOT "organic" or "paper"

Return JSON with:
{
  "agrees_with_model": true/false,
  "item_identified": "specific item name (e.g., plastic water bottle, cotton t-shirt, smartphone)",
  "item_description": "brief description of the item",
  "correct_category": "glass/hazardous/metal/organic/paper/plastic/textile/e-waste/battery/furniture/other",
  "reasoning": "explain why you agree or disagree with the model",
  "is_waste": true/false,
  "disposal_instructions": {
    "steps": ["step 1", "step 2", "step 3", "step 4"],
    "dos": ["do 1", "do 2", "do 3"],
    "donts": ["dont 1", "dont 2", "dont 3"]
  },
  "environmental_impact": {
    "recycling_benefits": "specific benefit for this item",
    "co2_saved": "0.5 kg",
    "water_saved": "2 liters",
    "energy_saved": "1.5 kWh"
  },
  "awareness": {
    "did_you_know": "interesting fact about this specific item",
    "global_impact": "global statistics about this item type",
    "local_tip": "India-specific recycling tip"
  },
  "alternatives": ["eco-friendly alternative 1", "alternative 2", "alternative 3"]
}

Make instructions SPECIFIC to the actual item you see in the image.
If you disagree with the model, provide disposal instructions for the CORRECT item.
Return ONLY valid JSON, no markdown or extra text.
`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType || 'image/jpeg'
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const aiData = JSON.parse(jsonMatch[0]);
      console.log(`🤖 Gemini Analysis: ${aiData.item_identified}`);
      console.log(`   Agrees with model: ${aiData.agrees_with_model}`);
      if (!aiData.agrees_with_model) {
        console.log(`   Correction: ${modelCategory} → ${aiData.correct_category}`);
        console.log(`   Reasoning: ${aiData.reasoning}`);
      }
      return aiData;
    }
    
    throw new Error('Invalid JSON response from Gemini');
  } catch (error) {
    console.error('❌ Gemini verification error:', error.message);
    
    // If quota exceeded, try next model
    if (error.message.includes('429') || error.message.includes('quota')) {
      console.log('⚠️ Quota exceeded, trying next model...');
      if (switchToNextModel()) {
        // Retry with next model
        return verifyWithGemini(imageBuffer, mimeType, modelCategory, confidence);
      }
    }
    
    // Return null to indicate failure, will use fallback
    return null;
  }
};

/**
 * Identify unknown item with Gemini AI
 * Used when model has low confidence
 */
export const identifyWithGemini = async (imageBuffer, mimeType, suggestedCategory, confidence) => {
  try {
    const model = getModel();
    const imageBase64 = imageBuffer.toString('base64');

    const prompt = `
You are a waste management expert.

Our TensorFlow model classified this image as "${suggestedCategory}" but with LOW confidence (${confidence}%).
This suggests the item might not be in our trained categories: glass, hazardous, metal, organic, paper, plastic.

Your task:
1. Identify what this item actually is
2. Determine if it's waste or not
3. Categorize it appropriately
4. Provide disposal guidance

Return JSON with:
{
  "item_identified": "specific item name (e.g., cloth shirt, electronic device, battery, furniture)",
  "item_description": "brief description",
  "is_waste": true/false,
  "category": "glass/hazardous/metal/organic/paper/plastic/textile/e-waste/battery/furniture/other",
  "confidence_in_identification": 0-100,
  "disposal_instructions": {
    "steps": ["step 1", "step 2", "step 3", "step 4"],
    "dos": ["do 1", "do 2", "do 3"],
    "donts": ["dont 1", "dont 2", "dont 3"]
  },
  "environmental_impact": {
    "recycling_benefits": "benefit if recyclable, or environmental concern if not",
    "co2_saved": "0 kg if not recyclable",
    "water_saved": "0 liters if not recyclable",
    "energy_saved": "0 kWh if not recyclable"
  },
  "awareness": {
    "did_you_know": "fact about this item",
    "global_impact": "statistics",
    "local_tip": "India-specific tip"
  },
  "alternatives": ["alternative 1", "alternative 2", "alternative 3"],
  "message": "friendly message to user explaining what this is and how to dispose"
}

Special cases:
- If it's NOT waste (person, car, building, etc.), set is_waste: false and provide a friendly message
- If it's e-waste (electronics), provide e-waste disposal guidance
- If it's textile/cloth, provide textile recycling guidance
- If it's battery, emphasize hazardous waste disposal
- If it's furniture, suggest donation or bulk waste pickup

Return ONLY valid JSON, no markdown or extra text.
`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType || 'image/jpeg'
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Parse JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const aiData = JSON.parse(jsonMatch[0]);
      console.log(`🤖 Gemini Identified: ${aiData.item_identified} (is_waste: ${aiData.is_waste})`);
      return aiData;
    }
    
    throw new Error('Invalid JSON response from Gemini');
  } catch (error) {
    console.error('❌ Gemini identification error:', error.message);
    
    // If quota exceeded, try next model
    if (error.message.includes('429') || error.message.includes('quota')) {
      console.log('⚠️ Quota exceeded, trying next model...');
      if (switchToNextModel()) {
        // Retry with next model
        return identifyWithGemini(imageBuffer, mimeType, suggestedCategory, confidence);
      }
    }
    
    return {
      item_identified: 'unknown item',
      is_waste: true,
      category: suggestedCategory,
      message: 'Unable to identify item clearly. Please try again with a clearer image.',
      disposal_instructions: {
        steps: ['Contact local waste management for guidance'],
        dos: ['Take a clearer photo and try again'],
        donts: ['Do not dispose without proper guidance']
      },
      environmental_impact: {
        recycling_benefits: 'Proper disposal helps the environment',
        co2_saved: '0 kg',
        water_saved: '0 liters',
        energy_saved: '0 kWh'
      },
      awareness: {
        did_you_know: 'Proper waste segregation is crucial for recycling',
        global_impact: 'Improper disposal contributes to pollution',
        local_tip: 'Check with your local municipality for disposal guidelines'
      },
      alternatives: []
    };
  }
};

/**
 * Resolve conflicts between model and Gemini
 */
export const resolveConflict = (modelCategory, modelConfidence, geminiResult) => {
  if (!geminiResult) {
    // Gemini failed, use model result with ENHANCED fallback data
    console.log('⚠️ Gemini failed, using model result with enhanced fallback data');
    
    const fallbackData = enhancedDisposalGuidance[modelCategory] || {
      steps: [`Dispose ${modelCategory} waste in appropriate bin`],
      dos: ['Follow local recycling guidelines'],
      donts: ['Do not mix with other waste types'],
      impact: {
        recycling_benefits: `Recycling ${modelCategory} helps the environment`,
        co2_saved: '0.3 kg',
        water_saved: '1 liter',
        energy_saved: '1 kWh'
      },
      fact: `Proper ${modelCategory} disposal is important for our planet`
    };
    
    return {
      category: modelCategory,
      specificItem: modelCategory + ' item',
      confidence: modelConfidence,
      source: 'model (gemini failed)',
      hadConflict: false,
      fallbackUsed: true,
      isWaste: true,
      disposalGuidance: fallbackData.steps.join('. '),
      recyclingTips: fallbackData.dos,
      disposalInstructions: {
        steps: fallbackData.steps,
        dos: fallbackData.dos,
        donts: fallbackData.donts
      },
      environmentalImpact: fallbackData.impact,
      awareness: {
        did_you_know: fallbackData.fact,
        global_impact: `${modelCategory} waste management is crucial for environmental protection`,
        local_tip: 'Check with local authorities for specific disposal guidelines'
      },
      alternatives: ['Reduce consumption', 'Reuse when possible', 'Recycle properly']
    };
  }

  if (geminiResult.agrees_with_model) {
    // NO CONFLICT - Both agree
    console.log('✅ Gemini agrees with model classification');
    return {
      category: modelCategory,
      specificItem: geminiResult.item_identified,
      itemDescription: geminiResult.item_description,
      confidence: modelConfidence,
      source: 'model + gemini',
      hadConflict: false,
      isWaste: geminiResult.is_waste,
      disposalGuidance: geminiResult.disposal_instructions.steps.join('. '),
      recyclingTips: geminiResult.disposal_instructions.dos,
      disposalInstructions: geminiResult.disposal_instructions,
      environmentalImpact: geminiResult.environmental_impact,
      awareness: geminiResult.awareness,
      alternatives: geminiResult.alternatives
    };
  } else {
    // CONFLICT DETECTED - Trust Gemini
    console.log(`⚠️ CONFLICT DETECTED:`);
    console.log(`   Model: ${modelCategory} (${modelConfidence}%)`);
    console.log(`   Gemini: ${geminiResult.correct_category}`);
    console.log(`   Reasoning: ${geminiResult.reasoning}`);
    console.log(`   → Trusting Gemini (more context-aware)`);
    
    return {
      category: geminiResult.correct_category,
      specificItem: geminiResult.item_identified,
      itemDescription: geminiResult.item_description,
      confidence: modelConfidence,
      source: 'gemini (corrected)',
      hadConflict: true,
      conflictDetails: {
        modelSaid: modelCategory,
        modelConfidence: modelConfidence,
        geminiSaid: geminiResult.correct_category,
        reasoning: geminiResult.reasoning
      },
      isWaste: geminiResult.is_waste,
      disposalGuidance: geminiResult.disposal_instructions.steps.join('. '),
      recyclingTips: geminiResult.disposal_instructions.dos,
      disposalInstructions: geminiResult.disposal_instructions,
      environmentalImpact: geminiResult.environmental_impact,
      awareness: geminiResult.awareness,
      alternatives: geminiResult.alternatives
    };
  }
};
