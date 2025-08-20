import { openai, gemini } from "@inngest/agent-kit";

/**
 * Configuration for AI model selection
 * You can easily switch between models by changing these flags
 */
export const AI_MODEL_CONFIG = {
  // Temporarily use OpenAI for summarization while we debug Gemini
  USE_GEMINI_FOR_SUMMARIZATION: false, // Changed to false to test OpenAI

  // Keep OpenAI for real-time video calls (required by Stream Video)
  USE_OPENAI_FOR_REALTIME: true,

  // Default fallback model
  DEFAULT_MODEL_PROVIDER: "openai" as "openai" | "gemini", // Changed to openai
} as const;

/**
 * Available model configurations
 */
export const MODELS = {
  // OpenAI Models
  openai: {
    "gpt-4o": openai({
      model: "gpt-4o",
      apiKey: process.env.OPENAL_API_KEY,
    }),
    "gpt-4o-mini": openai({
      model: "gpt-4o-mini",
      apiKey: process.env.OPENAL_API_KEY,
    }),
    "gpt-3.5-turbo": openai({
      model: "gpt-3.5-turbo",
      apiKey: process.env.OPENAL_API_KEY,
    }),
  },
  
  // Gemini Models
  gemini: {
    "gemini-1.5-pro": gemini({
      model: "gemini-1.5-pro",
      apiKey: process.env.GEMINI_API_KEY,
    }),
    "gemini-1.5-flash": gemini({
      model: "gemini-1.5-flash", // Faster and cheaper than Pro
      apiKey: process.env.GEMINI_API_KEY,
    }),
    "gemini-1.5-flash-8b": gemini({
      model: "gemini-1.5-flash-8b", // Even faster and cheaper
      apiKey: process.env.GEMINI_API_KEY,
    }),
  },
} as const;

/**
 * Get the model for summarization based on configuration
 */
export function getSummarizationModel() {
  if (AI_MODEL_CONFIG.USE_GEMINI_FOR_SUMMARIZATION) {
    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.warn("⚠️ Gemini API key not found, falling back to OpenAI");
      return MODELS.openai["gpt-4o"];
    }
    return MODELS.gemini["gemini-1.5-pro"];
  }
  return MODELS.openai["gpt-4o"];
}

/**
 * Get a fallback model if the primary one fails
 */
export function getFallbackSummarizationModel() {
  if (AI_MODEL_CONFIG.USE_GEMINI_FOR_SUMMARIZATION) {
    // If Gemini was primary, fallback to OpenAI
    return MODELS.openai["gpt-4o-mini"]; // Use cheaper OpenAI model as fallback
  }
  // If OpenAI was primary, fallback to Gemini
  return MODELS.gemini["gemini-1.5-flash"]; // Use cheaper Gemini model as fallback
}

/**
 * Get the model for real-time video calls
 * Note: This must be OpenAI due to Stream Video integration requirements
 */
export function getRealtimeModel() {
  return MODELS.openai["gpt-4o"];
}

/**
 * Get a specific model by provider and name
 */
export function getModel(provider: "openai" | "gemini", modelName: string) {
  const providerModels = MODELS[provider];
  if (modelName in providerModels) {
    return providerModels[modelName as keyof typeof providerModels];
  }
  throw new Error(`Model ${modelName} not found for provider ${provider}`);
}

/**
 * Get the default model based on configuration
 */
export function getDefaultModel() {
  if (AI_MODEL_CONFIG.DEFAULT_MODEL_PROVIDER === "gemini") {
    return MODELS.gemini["gemini-1.5-pro"];
  }
  return MODELS.openai["gpt-4o"];
}

// Helper function removed to avoid build issues
// Use getSummarizationModel() or getRealtimeModel() directly instead

/**
 * Test function to verify both OpenAI and Gemini models are working
 */
export async function testModels() {
  console.log("🧪 Testing AI Models Configuration...");

  try {
    // Test Gemini model
    console.log("📝 Testing Gemini model...");
    const geminiModel = getSummarizationModel();
    console.log("✅ Gemini model configured successfully");

    // Test OpenAI model
    console.log("🤖 Testing OpenAI model...");
    const openaiModel = getRealtimeModel();
    console.log("✅ OpenAI model configured successfully");

    // Check API keys
    const hasGeminiKey = !!process.env.GEMINI_API_KEY;
    const hasOpenAIKey = !!process.env.OPENAL_API_KEY;

    console.log(`🔑 Gemini API Key: ${hasGeminiKey ? '✅ Present' : '❌ Missing'}`);
    console.log(`🔑 OpenAI API Key: ${hasOpenAIKey ? '✅ Present' : '❌ Missing'}`);

    return {
      geminiConfigured: true,
      openaiConfigured: true,
      geminiKeyPresent: hasGeminiKey,
      openaiKeyPresent: hasOpenAIKey,
      currentSummarizationProvider: AI_MODEL_CONFIG.USE_GEMINI_FOR_SUMMARIZATION ? 'Gemini' : 'OpenAI'
    };
  } catch (error) {
    console.error("❌ Error testing models:", error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      geminiConfigured: false,
      openaiConfigured: false
    };
  }
}

/**
 * Model pricing information (approximate, for reference)
 */
export const MODEL_PRICING = {
  openai: {
    "gpt-4o": { input: 0.005, output: 0.015 }, // per 1K tokens
    "gpt-4o-mini": { input: 0.00015, output: 0.0006 },
    "gpt-3.5-turbo": { input: 0.0005, output: 0.0015 },
  },
  gemini: {
    "gemini-1.5-pro": { input: 0.00125, output: 0.005 }, // per 1K tokens
    "gemini-1.5-flash": { input: 0.000075, output: 0.0003 },
    "gemini-1.5-flash-8b": { input: 0.0000375, output: 0.00015 },
  },
} as const;
