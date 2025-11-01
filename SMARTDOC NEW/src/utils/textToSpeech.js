/**
 * Text-to-Speech Utility
 * Uses Web Speech API for browser-based TTS
 */

class TextToSpeechService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.currentUtterance = null;
    this.isInitialized = false;
    this.voices = [];
    this.defaultVoice = null;
    
    // Initialize voices
    this.initVoices();
  }

  initVoices() {
    // Load voices
    const loadVoices = () => {
      this.voices = this.synth.getVoices();
      
      // Prefer English voices
      this.defaultVoice = this.voices.find(voice => 
        voice.lang.startsWith('en') && voice.name.includes('Female')
      ) || this.voices.find(voice => 
        voice.lang.startsWith('en')
      ) || this.voices[0];
      
      this.isInitialized = true;
      console.log('TTS initialized with', this.voices.length, 'voices');
    };

    // Load voices immediately if available
    loadVoices();
    
    // Also listen for voices changed event (some browsers load voices asynchronously)
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  /**
   * Speak text
   * @param {string} text - Text to speak
   * @param {object} options - Voice options
   */
  speak(text, options = {}) {
    if (!this.isInitialized) {
      console.warn('TTS not initialized yet');
      this.initVoices();
    }

    // Cancel any ongoing speech
    this.cancel();

    // Clean text for better speech
    const cleanText = this.cleanTextForSpeech(text);

    if (!cleanText.trim()) {
      console.warn('No text to speak');
      return;
    }

    this.currentUtterance = new SpeechSynthesisUtterance(cleanText);
    
    // Set voice
    if (options.voice) {
      this.currentUtterance.voice = options.voice;
    } else if (this.defaultVoice) {
      this.currentUtterance.voice = this.defaultVoice;
    }

    // Set properties
    this.currentUtterance.rate = options.rate || 1.0;
    this.currentUtterance.pitch = options.pitch || 1.0;
    this.currentUtterance.volume = options.volume || 1.0;
    this.currentUtterance.lang = options.lang || 'en-US';

    // Event handlers
    this.currentUtterance.onstart = () => {
      console.log('TTS started');
      if (options.onStart) options.onStart();
    };

    this.currentUtterance.onend = () => {
      console.log('TTS ended');
      if (options.onEnd) options.onEnd();
      this.currentUtterance = null;
    };

    this.currentUtterance.onerror = (event) => {
      console.error('TTS error:', event);
      if (options.onError) options.onError(event);
    };

    // Speak
    this.synth.speak(this.currentUtterance);
  }

  /**
   * Clean text for better speech synthesis
   */
  cleanTextForSpeech(text) {
    return text
      // Remove markdown formatting
      .replace(/[#*_~`]/g, '')
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, '')
      // Remove inline code
      .replace(/`[^`]+`/g, '')
      // Remove URLs
      .replace(/https?:\/\/[^\s]+/g, 'link')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Pause speech
   */
  pause() {
    if (this.synth.speaking) {
      this.synth.pause();
    }
  }

  /**
   * Resume speech
   */
  resume() {
    if (this.synth.paused) {
      this.synth.resume();
    }
  }

  /**
   * Cancel speech
   */
  cancel() {
    this.synth.cancel();
    this.currentUtterance = null;
  }

  /**
   * Check if speaking
   */
  isSpeaking() {
    return this.synth.speaking;
  }

  /**
   * Check if paused
   */
  isPaused() {
    return this.synth.paused;
  }

  /**
   * Get available voices
   */
  getVoices() {
    return this.voices;
  }

  /**
   * Check if TTS is supported
   */
  isSupported() {
    return 'speechSynthesis' in window;
  }
}

// Create singleton instance
const ttsService = new TextToSpeechService();

export default ttsService;

// Export convenience functions
export const speak = (text, options) => ttsService.speak(text, options);
export const pause = () => ttsService.pause();
export const resume = () => ttsService.resume();
export const cancel = () => ttsService.cancel();
export const isSpeaking = () => ttsService.isSpeaking();
export const isPaused = () => ttsService.isPaused();
export const getVoices = () => ttsService.getVoices();
export const isSupported = () => ttsService.isSupported();
