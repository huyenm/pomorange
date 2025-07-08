import bellBeginSound from "@assets/bell-begin_1751004075967.wav";
import achievementSound from "@assets/mixkit-achievement-completed-2068_1751336528070.wav";

class AudioManager {
  private audioCache: Map<string, HTMLAudioElement> = new Map();

  constructor() {
    this.preloadAudio();
  }

  private preloadAudio() {
    // Preload audio files
    const bellBegin = new Audio(bellBeginSound);
    const bellAchieve = new Audio("/bell-achieve.wav"); // Use the renamed file
    const achievement = new Audio(achievementSound);
    
    bellBegin.volume = 0.9; // Increased for clarity
    bellAchieve.volume = 0.9; // Increased for clarity
    achievement.volume = 0.8;
    
    this.audioCache.set('bell-begin', bellBegin);
    this.audioCache.set('bell-achieve', bellAchieve);
    this.audioCache.set('achievement', achievement);
  }

  private async playAudio(key: string) {
    const audio = this.audioCache.get(key);
    if (audio) {
      try {
        // Stop any current playback and reset
        audio.pause();
        audio.currentTime = 0;
        
        // Create a clone to avoid conflicts with multiple rapid plays
        const audioClone = audio.cloneNode() as HTMLAudioElement;
        audioClone.volume = audio.volume;
        await audioClone.play();
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

  async playAchievement() {
    await this.playAudio('achievement');
  }
}

export const audioManager = new AudioManager();