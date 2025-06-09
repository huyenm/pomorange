import { useState, useEffect, useRef, useCallback } from "react";
import { notifications } from "@/lib/notifications";

export function usePreparationTimer() {
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    // Create a bell sound using Web Audio API
    const createBellSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playBell = () => {
        // Create multiple oscillators for a bell-like sound
        const oscillators = [523.25, 659.25, 783.99]; // C5, E5, G5 frequencies
        
        oscillators.forEach((freq, index) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
          oscillator.type = 'sine';
          
          // Envelope for bell-like decay
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.3 / (index + 1), audioContext.currentTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.5);
          
          oscillator.start(audioContext.currentTime + index * 0.1);
          oscillator.stop(audioContext.currentTime + 1.5 + index * 0.1);
        });
      };

      return playBell;
    };

    try {
      const playBell = createBellSound();
      audioRef.current = { play: playBell } as any;
    } catch (error) {
      console.warn("Could not create audio context for bell sound");
    }
  }, []);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (isCompleted) return;
    
    setIsRunning(true);
    clearTimer();

    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          setIsCompleted(true);
          
          // Play bell sound
          if (audioRef.current && typeof audioRef.current.play === 'function') {
            try {
              audioRef.current.play();
            } catch (error) {
              console.warn("Could not play bell sound");
            }
          }
          
          // Show notification
          notifications.showPreparationComplete();
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer, isCompleted]);

  const pauseTimer = useCallback(() => {
    if (isRunning) {
      clearTimer();
      setIsRunning(false);
    } else if (!isCompleted) {
      startTimer();
    }
  }, [isRunning, isCompleted, clearTimer, startTimer]);

  const resetTimer = useCallback(() => {
    clearTimer();
    setTimeRemaining(600);
    setIsRunning(false);
    setIsCompleted(false);
  }, [clearTimer]);

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return {
    timeRemaining,
    isRunning,
    isCompleted,
    startTimer,
    pauseTimer,
    resetTimer,
    formatTime,
    progress: ((600 - timeRemaining) / 600) * 100
  };
}