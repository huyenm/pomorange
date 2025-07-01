import { useState, useEffect, useRef, useCallback } from "react";
import { TimerState, SessionSetup } from "@shared/schema";
import { notifications } from "@/lib/notifications";

export function usePomodoro() {
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    isPaused: false,
    sessionType: "focus",
    timeRemaining: 0,
    totalTime: 0,
    startTime: null,
    finishTime: null,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback((setup: SessionSetup, sessionType: "focus" | "break" = "focus") => {
    clearTimer();
    
    const duration = sessionType === "focus" ? setup.focusDuration : setup.breakDuration;
    const timeInSeconds = duration * 60;
    const now = new Date();
    const finishTime = new Date(now.getTime() + timeInSeconds * 1000);

    setTimerState({
      isRunning: true,
      isPaused: false,
      sessionType,
      timeRemaining: timeInSeconds,
      totalTime: timeInSeconds,
      startTime: now,
      finishTime,
    });

    intervalRef.current = setInterval(() => {
      setTimerState(prev => {
        if (prev.isPaused || !prev.isRunning) return prev;
        
        const newTimeRemaining = prev.timeRemaining - 1;
        
        if (newTimeRemaining <= 0) {
          clearTimer();
          
          // Timer completed - return updated state
          return {
            ...prev,
            timeRemaining: 0,
            isRunning: false,
          };
        }
        
        return {
          ...prev,
          timeRemaining: newTimeRemaining,
        };
      });
    }, 1000);
  }, [clearTimer]);

  const pauseTimer = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  }, []);

  const stopTimer = useCallback(() => {
    clearTimer();
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      timeRemaining: 0,
      startTime: prev.startTime, // Keep start time for completion detection
    }));
  }, [clearTimer]);

  const startBreak = useCallback((breakDuration: number) => {
    clearTimer();
    
    const timeInSeconds = breakDuration * 60;
    const now = new Date();
    const finishTime = new Date(now.getTime() + timeInSeconds * 1000);

    notifications.showBreakStart(breakDuration);

    setTimerState({
      isRunning: true,
      isPaused: false,
      sessionType: "break",
      timeRemaining: timeInSeconds,
      totalTime: timeInSeconds,
      startTime: now,
      finishTime,
    });

    intervalRef.current = setInterval(() => {
      setTimerState(prev => {
        if (prev.isPaused || !prev.isRunning) return prev;
        
        const newTimeRemaining = prev.timeRemaining - 1;
        
        if (newTimeRemaining <= 0) {
          clearTimer();
          notifications.showBreakEnd();
          
          return {
            ...prev,
            timeRemaining: 0,
            isRunning: false,
          };
        }
        
        return {
          ...prev,
          timeRemaining: newTimeRemaining,
        };
      });
    }, 1000);
  }, [clearTimer]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return {
    timerState,
    startTimer,
    pauseTimer,
    stopTimer,
    startBreak,
  };
}
