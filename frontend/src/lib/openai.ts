// OpenAI API integration for speech-to-text and text-to-speech

const OPENAI_BASE_URL = 'https://api.openai.com/v1'

export interface TranscriptionOptions {
  model?: 'whisper-1' | 'gpt-4o-transcribe' | 'gpt-4o-mini-transcribe'
  language?: string
  prompt?: string
  responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt'
  temperature?: number
}

export interface TranscriptionResponse {
  text: string
  language?: string
  duration?: number
  segments?: TranscriptionSegment[]
}

export interface TranscriptionSegment {
  id: number
  seek: number
  start: number
  end: number
  text: string
  tokens: number[]
  temperature: number
  avg_logprob: number
  compression_ratio: number
  no_speech_prob: number
}

export interface TTSOptions {
  model?: 'tts-1' | 'tts-1-hd' | 'gpt-4o-mini-tts'
  voice?: 'alloy' | 'ash' | 'ballad' | 'coral' | 'echo' | 'fable' | 'nova' | 'onyx' | 'sage' | 'shimmer'
  responseFormat?: 'mp3' | 'opus' | 'aac' | 'flac' | 'wav' | 'pcm'
  speed?: number
  instructions?: string
}

// Speech to Text - Transcribe audio to text
export async function transcribeAudio(
  audioFile: File,
  apiKey: string,
  options: TranscriptionOptions = {}
): Promise<TranscriptionResponse> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required for transcription')
  }

  // Validate file size (25MB limit)
  if (audioFile.size > 25 * 1024 * 1024) {
    throw new Error('Audio file size must be less than 25MB')
  }

  // Validate file type
  const supportedTypes = ['audio/mp3', 'audio/mp4', 'audio/mpeg', 'audio/mpga', 'audio/m4a', 'audio/wav', 'audio/webm']
  if (!supportedTypes.some(type => audioFile.type.includes(type.split('/')[1]))) {
    console.warn('File type might not be supported:', audioFile.type)
  }

  const formData = new FormData()
  formData.append('file', audioFile)
  formData.append('model', options.model || 'gpt-4o-mini-transcribe')
  
  if (options.language) formData.append('language', options.language)
  if (options.prompt) formData.append('prompt', options.prompt)
  if (options.responseFormat) formData.append('response_format', options.responseFormat)
  if (options.temperature !== undefined) formData.append('temperature', options.temperature.toString())

  try {
    console.log('Sending transcription request with file:', audioFile.name, audioFile.size, 'bytes')
    
    const response = await fetch(`${OPENAI_BASE_URL}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        // Don't set Content-Type header - let the browser set it for FormData
      },
      body: formData
    })

    console.log('Transcription response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Transcription error response:', errorData)
      throw new Error(errorData.error?.message || `Transcription failed: ${response.status}`)
    }

    // Handle different response formats based on responseFormat
    if (options.responseFormat === 'text') {
      // For text format, response is plain text, not JSON
      const text = await response.text()
      console.log('Transcription response text:', text)
      return { text: text.trim() }
    } else {
      // For JSON formats, parse as JSON
      const data = await response.json()
      console.log('Transcription response data:', data)
      
      if (typeof data === 'string') {
        return { text: data }
      } else if (data.text) {
        return data as TranscriptionResponse
      } else {
        throw new Error('Unexpected response format from OpenAI')
      }
    }
  } catch (error) {
    console.error('OpenAI Transcription error:', error)
    throw error
  }
}

// Text to Speech - Convert text to spoken audio
export async function synthesizeSpeech(
  text: string,
  apiKey: string,
  options: TTSOptions = {}
): Promise<Blob> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required for text-to-speech')
  }

  if (!text.trim()) {
    throw new Error('Text cannot be empty')
  }

  const requestBody = {
    model: options.model || 'gpt-4o-mini-tts',
    input: text,
    voice: options.voice || 'coral',
    response_format: options.responseFormat || 'mp3',
    ...(options.speed && { speed: options.speed }),
    ...(options.instructions && { instructions: options.instructions })
  }

  try {
    const response = await fetch(`${OPENAI_BASE_URL}/audio/speech`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `Text-to-speech failed: ${response.status}`)
    }

    const audioBlob = await response.blob()
    return audioBlob
  } catch (error) {
    console.error('OpenAI TTS error:', error)
    throw error
  }
}

// Utility function to play audio blob
export async function playAudioBlob(audioBlob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    const audioUrl = URL.createObjectURL(audioBlob)
    
    audio.onloadeddata = () => {
      audio.play().then(resolve).catch(reject)
    }
    
    audio.onerror = () => {
      URL.revokeObjectURL(audioUrl)
      reject(new Error('Failed to play audio'))
    }
    
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl)
      resolve()
    }
    
    audio.src = audioUrl
  })
}

// Check if a model supports voice mode (non-reasoning models only)
export function isVoiceModeSupported(modelId: string): boolean {
  // Reasoning models that should NOT be available in voice mode
  const reasoningModels = [
    'google/gemini-2.5-pro-preview',
    'deepseek/deepseek-r1-0528',
    'anthropic/claude-sonnet-4',
    // Add other reasoning models as needed
  ]
  
  return !reasoningModels.some(reasoningModel => modelId.includes(reasoningModel))
}

// Get available voices for TTS
export function getAvailableVoices(): Array<{ id: string; name: string; description: string }> {
  return [
    { id: 'alloy', name: 'Alloy', description: 'Balanced and natural' },
    { id: 'ash', name: 'Ash', description: 'Clear and articulate' },
    { id: 'ballad', name: 'Ballad', description: 'Warm and expressive' },
    { id: 'coral', name: 'Coral', description: 'Friendly and engaging' },
    { id: 'echo', name: 'Echo', description: 'Deep and resonant' },
    { id: 'fable', name: 'Fable', description: 'Storytelling quality' },
    { id: 'nova', name: 'Nova', description: 'Bright and energetic' },
    { id: 'onyx', name: 'Onyx', description: 'Smooth and professional' },
    { id: 'sage', name: 'Sage', description: 'Wise and calming' },
    { id: 'shimmer', name: 'Shimmer', description: 'Light and airy' }
  ]
}