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
  plugins?: Array<{
    id: string;
    max_results?: number;
    search_prompt?: string;
  }>;
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
      annotations?: Array<{
        type: string;
        url_citation?: {
          url: string;
          title: string;
          content?: string;
        };
      }>;
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
    webSearch?: boolean;
  } = {}
): Promise<ChatCompletionResponse> => {
  let modelToUse = options.model || DEFAULT_MODEL;
  
  // If web search is enabled, append :online to the model name
  if (options.webSearch && !modelToUse.includes(':online')) {
    modelToUse = `${modelToUse}:online`;
  }

  const request: ChatCompletionRequest = {
    model: modelToUse,
    messages,
    temperature: options.temperature || 0.7,
    max_tokens: options.max_tokens || 10000,
    stream: options.stream || false
  };

  // Add reasoning configuration for reasoning models
  const isReasoningModel = isThinkingModel(modelToUse);
  if (isReasoningModel) {
    (request as any).reasoning = {
      max_tokens: 8000  // Allow up to 8000 reasoning tokens
    };
  }

  // Add web search plugin if enabled
  if (options.webSearch) {
    request.plugins = [{
      id: 'web',
      max_results: 5,
      search_prompt: 'A web search was conducted. Incorporate the following web search results into your response. IMPORTANT: Cite them using markdown links named using the domain of the source.'
    }];
  }

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

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Helper function to check if a model supports thinking
export const isThinkingModel = (model: string): boolean => {
  const thinkingModels = [
    // OpenAI Reasoning Models
    'openai/o3',
    'openai/o3-pro', 
    'openai/o4-mini',
    
    // Anthropic Reasoning Models
    'anthropic/claude-3.7-sonnet:thinking',
    'anthropic/claude-sonnet-4',
    
    // DeepSeek Reasoning Models
    'deepseek/deepseek-r1',
    'deepseek/deepseek-r1-0528',
    'deepseek/deepseek-r1-distill-qwen-7b',
    'deepseek/deepseek-r1-distill-llama-8b',
    
    // Qwen Reasoning Models
    'qwen/qwq-32b',
    
    // Google Reasoning Models
    'google/gemini-2.5-pro-preview',
    'google/gemini-2.5-pro',
    'google/gemini-2.5-flash',
    'google/gemini-2.5-flash-preview-05-20:thinking',
    
    // Grok Reasoning Models
    'x-ai/grok-3-beta',
    'x-ai/grok-3-mini-beta',
    
    // Any model with ":thinking" suffix
    ':thinking'
  ];
  return thinkingModels.some(thinkingModel => model.includes(thinkingModel));
};

// Create streaming chat completion
export const createStreamingChatCompletion = async (
  messages: ChatMessage[],
  options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    apiKey?: string;
    webSearch?: boolean;
  } = {},
  onChunk: (chunk: string) => void,
  onFinishReason: (reason: string) => void,
  onComplete: (webSearchResults?: Array<{url: string, title: string, content?: string}>) => void,
  onError: (error: Error) => void,
  onThinking?: (isThinking: boolean, summary?: string) => void,
  abortSignal?: AbortSignal
): Promise<void> => {
  let modelToUse = options.model || DEFAULT_MODEL;
  
  // If web search is enabled, append :online to the model name
  if (options.webSearch && !modelToUse.includes(':online')) {
    modelToUse = `${modelToUse}:online`;
  }

  const request: ChatCompletionRequest = {
    model: modelToUse,
    messages,
    temperature: options.temperature || 0.7,
    max_tokens: options.max_tokens || 10000,
    stream: true
  };

  // Add reasoning configuration for reasoning models
  const isReasoningModel = isThinkingModel(modelToUse);
  if (isReasoningModel) {
    (request as any).reasoning = {
      max_tokens: 8000  // Allow up to 8000 reasoning tokens
    };
  }

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
      body: JSON.stringify(request),
      signal: abortSignal
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
    let webSearchResults: Array<{url: string, title: string, content?: string}> = [];
    let isCurrentlyThinking = false;
    let thinkingContent = '';
    // Note: isReasoningModel is already declared above

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        onComplete(webSearchResults.length > 0 ? webSearchResults : undefined);
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            onComplete(webSearchResults.length > 0 ? webSearchResults : undefined);
            return;
          }

          try {
            const parsed = JSON.parse(data);
            
            const delta = parsed.choices?.[0]?.delta;
            const content = delta?.content;
            const reasoning = delta?.reasoning;
            
            // Handle reasoning tokens for reasoning models
            if (reasoning && isReasoningModel && onThinking) {
              if (!isCurrentlyThinking) {
                isCurrentlyThinking = true;
                onThinking(true, 'Analyzing the problem...');
              }
              
              // Accumulate thinking content and extract meaningful parts
              thinkingContent += reasoning;
              
              // Extract a summary from the reasoning content
              const lines = thinkingContent.split('\n').filter(line => line.trim());
              if (lines.length > 0) {
                const lastLine = lines[lines.length - 1].trim();
                if (lastLine.length > 10 && lastLine.length < 100) {
                  onThinking(true, lastLine);
                }
              }
            }
            
            if (content) {
              // If we were thinking and now have content, stop thinking
              if (isCurrentlyThinking && onThinking) {
                isCurrentlyThinking = false;
                onThinking(false);
              }
              onChunk(content);
            } else if (reasoning) {
            } else {
            }
            
            // Look for annotations in both delta and message
            const deltaForAnnotations = parsed.choices?.[0]?.delta;
            const message = parsed.choices?.[0]?.message;
            const annotations = deltaForAnnotations?.annotations || message?.annotations;
            
            if (annotations && annotations.length > 0) {
              for (const annotation of annotations) {
                if (annotation.type === 'url_citation' && annotation.url_citation) {
                  const result = {
                    url: annotation.url_citation.url,
                    title: annotation.url_citation.title || new URL(annotation.url_citation.url).hostname,
                    content: annotation.url_citation.content
                  };
                  // Avoid duplicates
                  if (!webSearchResults.some(r => r.url === result.url)) {
                    webSearchResults.push(result);
                  }
                }
              }
            }
            
            // Check for finish_reason
            const finishReason = parsed.choices?.[0]?.finish_reason;
            if (finishReason) {
              onFinishReason(finishReason);
            }
          } catch (error) {
            continue;
          }
        }
      }
    }
  } catch (error) {
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
  // Cost estimates per 1M tokens
  const pricing: Record<string, { input: number; output: number }> = {
    'google/gemini-2.5-pro-preview': { input: 1.25, output: 10.0 },
    'deepseek/deepseek-r1-0528': { input: 0.45, output: 2.15 },
    'anthropic/claude-sonnet-4': { input: 3.0, output: 15.0 },
    'anthropic/claude-3.5-sonnet': { input: 3.0, output: 15.0 },
    'openai/gpt-4o': { input: 5.0, output: 15.0 },
    'openai/gpt-4.1-nano': { input: 1.0, output: 3.0 },
  };

  const modelPricing = pricing[model] || pricing['openai/gpt-4o'];
  
  return (
    (inputTokens / 1000000) * modelPricing.input +
    (outputTokens / 1000000) * modelPricing.output
  );
}; 
