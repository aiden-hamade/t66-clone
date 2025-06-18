// Audio recording utilities using Web Audio API
export interface AudioRecordingOptions {
  sampleRate?: number
  channels?: number
  bitsPerSample?: number
  silenceThreshold?: number
  silenceDuration?: number
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private audioStream: MediaStream | null = null
  private audioChunks: Blob[] = []
  private isRecording = false
  
  // Silence detection properties
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private silenceTimer: number | null = null
  private onSilenceDetected?: () => void

  constructor(private options: AudioRecordingOptions = {}) {
    this.options = {
      sampleRate: 16000, // OpenAI Whisper works well with 16kHz
      channels: 1, // Mono
      bitsPerSample: 16,
      silenceThreshold: 0.01, // Silence threshold (0-1)
      silenceDuration: 3000, // 3 seconds of silence before auto-stop
      ...options
    }
  }

  async initialize(): Promise<void> {
    try {
      // Request microphone access
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.options.sampleRate,
          channelCount: this.options.channels,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      // Create MediaRecorder with optimal settings for speech
      const mimeType = this.getSupportedMimeType();
      
      const options: MediaRecorderOptions = {
        mimeType: mimeType,
        audioBitsPerSecond: 128000 // 128kbps for good quality speech
      }

      this.mediaRecorder = new MediaRecorder(this.audioStream, options)
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.onstop = () => {
        this.isRecording = false
        this.stopSilenceDetection()
      }

      // Initialize audio context for silence detection
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 256
      
      const source = this.audioContext.createMediaStreamSource(this.audioStream)
      source.connect(this.analyser)

    } catch (error) {
      console.error('Error initializing audio recorder:', error)
      throw new Error('Failed to access microphone. Please check your permissions.')
    }
  }

  async startRecording(onSilenceDetected?: () => void): Promise<void> {
    if (!this.mediaRecorder) {
      throw new Error('Audio recorder not initialized')
    }

    if (this.isRecording) {
      return // Already recording
    }

    this.audioChunks = [] // Clear previous chunks
    this.onSilenceDetected = onSilenceDetected
    this.mediaRecorder.start(100) // Collect data every 100ms
    this.isRecording = true
    
    // Start silence detection
    this.startSilenceDetection()
  }

  private startSilenceDetection(): void {
    if (!this.analyser || !this.onSilenceDetected) return

    const bufferLength = this.analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    
    const checkAudioLevel = () => {
      if (!this.isRecording || !this.analyser) return

      this.analyser.getByteFrequencyData(dataArray)
      
      // Calculate average volume
      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength
      const volume = average / 255 // Normalize to 0-1
      
      // Only log audio level occasionally to reduce spam
      if (Math.random() < 0.01) { // Log ~1% of the time
        console.log('🎙️ Audio level:', volume.toFixed(3), 'Threshold:', this.options.silenceThreshold)
      }

      if (volume < (this.options.silenceThreshold || 0.02)) {
        // Silence detected (fallback only - user should use End Message button)
        if (!this.silenceTimer) {
          console.log('🔇 Extended silence detected (30s fallback), starting timer...', 'Volume:', volume.toFixed(3))
          this.silenceTimer = window.setTimeout(() => {
            console.log('⏰ Extended silence timeout reached (30s) - auto-stopping recording')
            if (this.onSilenceDetected) {
              this.onSilenceDetected()
            }
          }, this.options.silenceDuration || 30000)
        }
      } else {
        // Sound detected, reset silence timer
        if (this.silenceTimer) {
          console.log('🎵 Sound detected, resetting extended silence timer', 'Volume:', volume.toFixed(3))
          clearTimeout(this.silenceTimer)
          this.silenceTimer = null
        }
      }

      // Continue checking
      if (this.isRecording) {
        requestAnimationFrame(checkAudioLevel)
      }
    }

    checkAudioLevel()
  }

  private stopSilenceDetection(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer)
      this.silenceTimer = null
    }
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error('Not currently recording'))
        return
      }
      
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { 
          type: this.getSupportedMimeType() 
        })
        
        this.audioChunks = []
        this.isRecording = false
        resolve(audioBlob)
      }

      this.mediaRecorder.stop()
    })
  }

  getIsRecording(): boolean {
    return this.isRecording
  }

  cleanup(): void {
    this.stopSilenceDetection()
    
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop()
    }

    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop())
      this.audioStream = null
    }

    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }

    this.mediaRecorder = null
    this.analyser = null
    this.audioChunks = []
    this.isRecording = false
    this.onSilenceDetected = undefined
  }

  private getSupportedMimeType(): string {
    // Check for supported audio formats in order of preference
    const types = [
      'audio/webm;codecs=opus',  // Best compression for speech
      'audio/webm',              // Fallback WebM
      'audio/mp4',               // MP4 audio
      'audio/wav'                // WAV fallback
    ]

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }

    return 'audio/webm' // Default fallback
  }

  // Convert audio blob to formats supported by OpenAI
  async convertToSupportedFormat(audioBlob: Blob): Promise<File> {
    // OpenAI supports: mp3, mp4, mpeg, mpga, m4a, wav, webm
    const mimeType = audioBlob.type
    
    // Determine file extension based on MIME type
    let extension = 'webm'
    if (mimeType.includes('mp4')) extension = 'mp4'
    else if (mimeType.includes('wav')) extension = 'wav'
    else if (mimeType.includes('mp3')) extension = 'mp3'
    else if (mimeType.includes('webm')) extension = 'webm'

    // Create a File object with appropriate name and type
    const file = new File(
      [audioBlob], 
      `recording_${Date.now()}.${extension}`, 
      { type: mimeType }
    )

    return file
  }
}

// Hook for using audio recording in React components
export function useAudioRecorder(options?: AudioRecordingOptions) {
  let recorder: AudioRecorder | null = null

  const initialize = async () => {
    recorder = new AudioRecorder(options)
    await recorder.initialize()
    return recorder
  }

  const cleanup = () => {
    if (recorder) {
      recorder.cleanup()
      recorder = null
    }
  }

  return {
    initialize,
    cleanup,
    getRecorder: () => recorder
  }
}

// Utility function to check microphone permissions
export async function checkMicrophonePermission(): Promise<boolean> {
  try {
    const result = await navigator.permissions.query({ name: 'microphone' as PermissionName })
    return result.state === 'granted'
  } catch {
    // Fallback: try to access microphone directly
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop())
      return true
    } catch {
      return false
    }
  }
}

// Utility function to request microphone permission
export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach(track => track.stop())
    return true
  } catch (error) {
    console.error('Microphone permission denied:', error)
    return false
  }
}