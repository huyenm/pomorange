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

  // Play session start sound (exciting fanfare)
  async playSessionStart() {
    await this.ensureAudioContext();
    if (!this.audioContext) return;

    // Exciting ascending sequence with harmonics
    this.createBellSound(440, 0.2, 0.25); // A4
    this.createBellSound(554, 0.2, 0.15); // C#5 harmony
    setTimeout(() => {
      this.createBellSound(659, 0.2, 0.3); // E5
      this.createBellSound(830, 0.2, 0.2); // G#5 harmony
    }, 120);
    setTimeout(() => {
      this.createBellSound(1109, 0.3, 0.35); // C#6 - bright finish
      this.createBellSound(880, 0.3, 0.25); // A5 harmony
    }, 240);
  }

  // Play session finish sound (triumphant descending)
  async playSessionFinish() {
    await this.ensureAudioContext();
    if (!this.audioContext) return;

    // Triumphant sequence with rich harmonics
    this.createBellSound(880, 0.25, 0.3); // A5
    this.createBellSound(1109, 0.25, 0.2); // C#6 harmony
    setTimeout(() => {
      this.createBellSound(659, 0.25, 0.3); // E5
      this.createBellSound(830, 0.25, 0.2); // G#5 harmony
    }, 150);
    setTimeout(() => {
      this.createBellSound(440, 0.4, 0.35); // A4 - strong finish
      this.createBellSound(554, 0.4, 0.25); // C#5 harmony
    }, 300);
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