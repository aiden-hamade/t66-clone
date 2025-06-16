// OpenRouter API configuration
const OPENROUTER_BASE_URL = import.meta.env.VITE_OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = import.meta.env.VITE_DEFAULT_MODEL || 'openai/gpt-4o';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{
    type: 'text' | 'image_url' | 'file';
    text?: string;
    image_url?: { url: string };
    file?: { filename: string; file_data: string };
  }>;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Create chat completion
export const createChatCompletion = async (
  messages: ChatMessage[],
  options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
    apiKey?: string;
  } = {}
): Promise<ChatCompletionResponse> => {
  const request: ChatCompletionRequest = {
    model: options.model || DEFAULT_MODEL,
    messages,
    temperature: options.temperature || 0.7,
    max_tokens: options.max_tokens || 4000,
    stream: options.stream || false
  };

  if (!options.apiKey) {
    throw new Error('OpenRouter API key is required');
  }

  try {
    console.log('OpenRouter API: Sending request to', `${OPENROUTER_BASE_URL}/chat/completions`);
    console.log('OpenRouter API: Request payload:', JSON.stringify(request, null, 2));
    
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${options.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'T66 - AI Chat Application'
      },
      body: JSON.stringify(request)
    });

    console.log('OpenRouter API: Response status:', response.status);
    console.log('OpenRouter API: Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenRouter API: Error response:', errorData);
      throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenRouter API: Success response:', data);
    return data;
  } catch (error) {
    console.error('OpenRouter API error:', error);
    throw error;
  }
};

// Create streaming chat completion
export const createStreamingChatCompletion = async (
  messages: ChatMessage[],
  options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    apiKey?: string;
  } = {},
  onChunk: (chunk: string) => void,
  onFinishReason: (reason: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> => {
  const request: ChatCompletionRequest = {
    model: options.model || DEFAULT_MODEL,
    messages,
    temperature: options.temperature || 0.7,
    max_tokens: options.max_tokens || 4000,
    stream: true
  };

  if (!options.apiKey) {
    throw new Error('OpenRouter API key is required');
  }

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${options.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'T66 - AI Chat Application'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to read response stream');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log('OpenRouter streaming: Stream ended naturally (done=true)');
        onComplete();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            console.log('OpenRouter streaming: Received [DONE] signal');
            onComplete();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
            
            // Check for finish_reason
            const finishReason = parsed.choices?.[0]?.finish_reason;
            if (finishReason) {
              console.log('OpenRouter streaming: Finish reason:', finishReason);
              onFinishReason(finishReason);
            }
          } catch (error) {
            console.log('OpenRouter streaming: Skipping invalid JSON chunk:', data);
            continue;
          }
        }
      }
    }
  } catch (error) {
    console.error('OpenRouter streaming error:', error);
    onError(error as Error);
  }
};

// Get available models
export const getAvailableModels = async (apiKey: string) => {
  if (!apiKey) {
    throw new Error('OpenRouter API key is required');
  }

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'T66 - AI Chat Application'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
};

// Estimate token count (rough approximation)
export const estimateTokenCount = (text: string): number => {
  // Rough approximation: 1 token ≈ 4 characters for most models
  return Math.ceil(text.length / 4);
};

// Calculate cost estimate
export const calculateCostEstimate = (
  inputTokens: number,
  outputTokens: number,
  model: string = DEFAULT_MODEL
): number => {
  // Rough cost estimates per 1K tokens (these would need to be updated with actual pricing)
  const pricing: Record<string, { input: number; output: number }> = {
    'openai/gpt-4o': { input: 0.005, output: 0.015 },
    'openai/gpt-4.1-nano': { input: 0.001, output: 0.003 },
  };

  const modelPricing = pricing[model] || pricing['openai/gpt-4o'];
  
  return (
    (inputTokens / 1000) * modelPricing.input +
    (outputTokens / 1000) * modelPricing.output
  );
}; 