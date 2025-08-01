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



  //const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /*const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);*/

  // Start either focus or break sessions by setting absolute timestamps
  const startTimer = useCallback((setup: SessionSetup, sessionType: "focus" | "break" = "focus") => {
    //clearTimer();
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
  },
  []
);

   /* intervalRef.current = setInterval(() => {
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
  }, [clearTimer]); */

  const pauseTimer = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  }, []);

  const stopTimer = useCallback(() => {
    //clearTimer();
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      timeRemaining: 0,
      totalTime: 0,
      startTime: null, // Clear start time to prevent duplicate completion detection
      finishTime: null,
    }));
  }, []);

  const startBreak = useCallback((breakDuration: number) => {
    //clearTimer();
    notifications.showBreakStart(breakDuration);
    
    const timeInSeconds = breakDuration * 60;
    const now = new Date();
    const finishTime = new Date(now.getTime() + timeInSeconds * 1000);


    setTimerState({
      isRunning: true,
      isPaused: false,
      sessionType: "break",
      timeRemaining: timeInSeconds,
      totalTime: timeInSeconds,
      startTime: now,
      finishTime,
    });
  },
  []
);

   /* intervalRef.current = setInterval(() => {
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
  }, [clearTimer]); */

  useEffect(() => {
    const { startTime, totalTime, isPaused } = timerState;
    if (!startTime || totalTime <= 0) return;

    let timeoutId: number;
    const finishMs = startTime.getTime() + totalTime * 1000;

    const tick = () => {
      if (timerState.isPaused) {
        // while paused, check again in 1s
        timeoutId = window.setTimeout(tick, 1000);
        return;
      }

      const nowMs = Date.now();
      const msLeft = finishMs - nowMs;
      const secondsLeft = Math.max(0, Math.ceil(msLeft / 1000));

      setTimerState(prev => ({
        ...prev,
        timeRemaining: secondsLeft,
        isRunning: secondsLeft > 0,
      }));

      if (secondsLeft > 0) {
        // schedule next tick aligned to next full second
        const delay = msLeft % 1000 || 1000;
        timeoutId = window.setTimeout(tick, delay);
      }
    };

    // start immediately
    timeoutId = window.setTimeout(tick, 0);

    return () => clearTimeout(timeoutId);
  }, [timerState.startTime, timerState.totalTime, timerState.isPaused]);

  return {
    timerState,
    startTimer,
    pauseTimer,
    stopTimer,
    startBreak,
  };
}
