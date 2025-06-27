import bellBeginSound from "@assets/bell-begin_1751004075967.wav";
import bellAchieveSound from "@assets/bell-achieve_1751004075966.wav";

class AudioManager {
  private audioCache: Map<string, HTMLAudioElement> = new Map();

  constructor() {
    this.preloadAudio();
  }

  private preloadAudio() {
    // Preload audio files
    const bellBegin = new Audio(bellBeginSound);
    const bellAchieve = new Audio(bellAchieveSound);
    
    bellBegin.volume = 0.7;
    bellAchieve.volume = 0.7;
    
    this.audioCache.set('bell-begin', bellBegin);
    this.audioCache.set('bell-achieve', bellAchieve);
  }

  private async playAudio(key: string) {
    const audio = this.audioCache.get(key);
    if (audio) {
      try {
        audio.currentTime = 0; // Reset to beginning
        await audio.play();
      } catch (error) {
        console.warn(`Could not play audio ${key}:`, error);
      }
    }
  }

  async playSessionStart() {
    await this.playAudio('bell-begin');
  }

  async playSessionFinish() {
    await this.playAudio('bell-achieve');
  }

  async playBreakStart() {
    await this.playAudio('bell-begin');
  }

  async playBreakFinish() {
    await this.playAudio('bell-achieve');
  }
}

export const audioManager = new AudioManager();