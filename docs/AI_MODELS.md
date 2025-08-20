# AI Models Configuration

This project supports both OpenAI and Gemini AI models, giving you flexibility to choose the best model for each use case and manage usage limits effectively.

## Current Setup

### Models in Use

1. **Gemini AI** (Primary for summarization)
   - Used for: Meeting transcript summarization
   - Model: `gemini-1.5-pro`
   - Benefits: Cost-effective, high quality, helps reduce OpenAI usage

2. **OpenAI** (Required for real-time features)
   - Used for: Real-time video call AI agents
   - Model: `gpt-4o`
   - Required: Stream Video integration only works with OpenAI's real-time API

## Environment Variables

Make sure you have both API keys in your `.env` file:

```env
# OpenAI API Key (required for video calls)
OPENAL_API_KEY="your_openai_api_key_here"

# Gemini AI API Key (used for summarization)
GEMINI_API_KEY="your_gemini_api_key_here"
```

### Getting API Keys

1. **OpenAI API Key**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Gemini API Key**: Get from [Google AI Studio](https://aistudio.google.com/app/apikey)

## Configuration

### Switching Models

You can easily switch between models by editing `src/lib/ai-models.ts`:

```typescript
export const AI_MODEL_CONFIG = {
  // Set to false to use OpenAI for summarization instead
  USE_GEMINI_FOR_SUMMARIZATION: true,
  
  // This must remain true (Stream Video requirement)
  USE_OPENAI_FOR_REALTIME: true,
  
  // Default model provider for new features
  DEFAULT_MODEL_PROVIDER: "gemini" as "openai" | "gemini",
};
```

### Available Models

#### OpenAI Models
- `gpt-4o` - Most capable, higher cost
- `gpt-4o-mini` - Good balance of capability and cost
- `gpt-3.5-turbo` - Fastest, lowest cost

#### Gemini Models
- `gemini-1.5-pro` - High quality, similar to GPT-4
- `gemini-1.5-flash` - Faster and cheaper than Pro
- `gemini-1.5-flash-8b` - Fastest and cheapest option

## Usage Examples

### Creating Agents with Specific Models

```typescript
import { createAgentWithModel } from "@/lib/ai-models";

// Create an agent with Gemini
const geminiAgent = createAgentWithModel({
  name: "content-creator",
  system: "You are a helpful content creator...",
  provider: "gemini",
  modelName: "gemini-1.5-flash"
});

// Create an agent with OpenAI
const openaiAgent = createAgentWithModel({
  name: "code-reviewer",
  system: "You are an expert code reviewer...",
  provider: "openai",
  modelName: "gpt-4o-mini"
});
```

### Using Specific Models Directly

```typescript
import { getModel, getSummarizationModel, getRealtimeModel } from "@/lib/ai-models";

// Get a specific model
const fastModel = getModel("gemini", "gemini-1.5-flash-8b");

// Get the configured summarization model
const summaryModel = getSummarizationModel();

// Get the real-time model (always OpenAI)
const realtimeModel = getRealtimeModel();
```

## Cost Optimization

### Current Cost Savings
By using Gemini for summarization, you can save significantly on costs:

- **OpenAI GPT-4o**: $0.005 input / $0.015 output per 1K tokens
- **Gemini 1.5 Pro**: $0.00125 input / $0.005 output per 1K tokens
- **Savings**: ~75% cost reduction for summarization tasks

### Recommended Usage
- **Use Gemini for**: Text processing, summarization, content generation
- **Use OpenAI for**: Real-time interactions, complex reasoning (when needed)

## Troubleshooting

### Common Issues

1. **Missing API Keys**
   ```
   Error: API key not found
   ```
   Solution: Make sure both `OPENAL_API_KEY` and `GEMINI_API_KEY` are set in your `.env` file

2. **Model Not Found**
   ```
   Error: Model gemini-1.5-pro not found for provider gemini
   ```
   Solution: Check that the model name is correct in `ai-models.ts`

3. **Real-time Video Not Working**
   - Real-time video calls MUST use OpenAI
   - Check that `OPENAL_API_KEY` is valid
   - Don't try to use Gemini for Stream Video integration

### Testing Your Setup

You can test both models by running the development server and:

1. **Test Gemini**: Create a meeting and let it generate a summary
2. **Test OpenAI**: Start a video call with an AI agent

## Future Enhancements

Potential improvements you could add:

1. **Dynamic Model Selection**: Choose models based on task complexity
2. **Fallback Logic**: Automatically switch to backup model if primary fails
3. **Usage Tracking**: Monitor API usage across different models
4. **A/B Testing**: Compare model performance for different tasks
