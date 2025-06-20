// Audio utility for playing notification sounds
class AudioManager {
  private audioContext: AudioContext | null = null;

  constructor() {
    // Initialize AudioContext on first user interaction
    if (typeof window !== 'undefined') {
      this.initializeAudioContext();
    }
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  private async ensureAudioContext() {
    if (!this.audioContext) {
      this.initializeAudioContext();
    }

    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  // Generate a bell-like sound using oscillators
  private createBellSound(frequency: number, duration: number, volume: number = 0.3) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    // Configure oscillator for bell-like tone
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      frequency * 0.8, 
      this.audioContext.currentTime + duration
    );

    // Configure filter for warmer sound
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);

    // Configure gain for fade out
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01, 
      this.audioContext.currentTime + duration
    );

    // Connect nodes
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Play sound
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Play session start sound (ascending bell tones)
  async playSessionStart() {
    await this.ensureAudioContext();
    if (!this.audioContext) return;

    // Three ascending bell tones
    this.createBellSound(440, 0.3, 0.2); // A4
    setTimeout(() => this.createBellSound(554, 0.3, 0.2), 150); // C#5
    setTimeout(() => this.createBellSound(659, 0.4, 0.25), 300); // E5
  }

  // Play session finish sound (descending bell tones)
  async playSessionFinish() {
    await this.ensureAudioContext();
    if (!this.audioContext) return;

    // Three descending bell tones
    this.createBellSound(659, 0.3, 0.2); // E5
    setTimeout(() => this.createBellSound(554, 0.3, 0.2), 150); // C#5
    setTimeout(() => this.createBellSound(440, 0.4, 0.25), 300); // A4
  }

  // Play break start sound (gentle chime)
  async playBreakStart() {
    await this.ensureAudioContext();
    if (!this.audioContext) return;

    this.createBellSound(523, 0.5, 0.15); // C5 - gentle tone
  }

  // Play break finish sound (attention bell)
  async playBreakFinish() {
    await this.ensureAudioContext();
    if (!this.audioContext) return;

    // Double bell for attention
    this.createBellSound(880, 0.3, 0.2); // A5
    setTimeout(() => this.createBellSound(880, 0.3, 0.2), 200); // A5
  }
}

export const audioManager = new AudioManager();