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
    setTimerState(prev => {
      if (!prev.isRunning) return prev;

      if (prev.isPaused) {
        // Resume from the frozen remaining time with a new absolute deadline.
        return {
          ...prev,
          isPaused: false,
          finishTime: new Date(Date.now() + prev.timeRemaining * 1000),
        };
      }

      // Capture the exact remaining time before freezing the timer.
      const secondsLeft = prev.finishTime
        ? Math.max(
            0,
            Math.ceil((prev.finishTime.getTime() - Date.now()) / 1000),
          )
        : prev.timeRemaining;

      return {
        ...prev,
        isPaused: true,
        timeRemaining: secondsLeft,
      };
    });
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
    const { finishTime, totalTime, isPaused, isRunning } = timerState;
    if (!finishTime || totalTime <= 0 || isPaused || !isRunning) return;

    let timeoutId: number;
    const finishMs = finishTime.getTime();

    const tick = () => {
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
  }, [
    timerState.finishTime,
    timerState.totalTime,
    timerState.isPaused,
    timerState.isRunning,
  ]);

  return {
    timerState,
    startTimer,
    pauseTimer,
    stopTimer,
    startBreak,
  };
}
