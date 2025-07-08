import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Pause, Play, Check, Clock, X } from "lucide-react";
import { TimerState, SessionSetup } from "@shared/schema";
import { useTasks } from "@/hooks/use-tasks";
import { useSessions } from "@/hooks/use-sessions";

interface TimerPhaseProps {
  timerState: TimerState;
  sessionSetup: SessionSetup;
  onPauseTimer: () => void;
  onFinishEarly: () => void;
  onQuitSession?: () => void;
}

export function TimerPhase({ timerState, sessionSetup, onPauseTimer, onFinishEarly, onQuitSession }: TimerPhaseProps) {
  const { tasks } = useTasks();
  const { getStats } = useSessions();
  const stats = getStats();
  
  const currentTask = tasks.find(task => task.id === sessionSetup.taskId);
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTimeSmall = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const progress = timerState.totalTime > 0 
    ? ((timerState.totalTime - timerState.timeRemaining) / timerState.totalTime) * 100
    : 0;

  const formatFinishTime = (date: Date | null) => {
    if (!date) return "--:--";
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const formatStartTime = (date: Date | null) => {
    if (!date) return "--:--";
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 px-4">
      {/* Timer Display */}
      <Card>
        <CardHeader>
          <div className="text-center">
            <Badge className="mb-4">
              <Clock className="mr-2 h-4 w-4" />
              {timerState.sessionType === "focus" ? "Focus Session" : "Break Time"}
            </Badge>
            <CardTitle className="text-base sm:text-lg font-medium mb-2 mobile-text-small" style={{ fontFamily: 'Space Mono, monospace' }}>
              {currentTask?.text || "Unknown Task"}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-6 sm:space-y-8 mobile-task-card">
          {/* Countdown Display */}
          <div>
            <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#F3793A] mb-4 font-mono mobile-timer-display">
              {formatTime(timerState.timeRemaining)}
            </div>
            <div className="text-slate-600 space-y-1 text-sm sm:text-base mobile-text-small">
              <p>Started at {formatStartTime(timerState.startTime)}</p>
              <p>Will finish at {formatFinishTime(timerState.finishTime)}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-slate-500">
              <span>{Math.floor((timerState.totalTime - timerState.timeRemaining) / 60)} minutes elapsed</span>
              <span>{Math.floor(timerState.timeRemaining / 60)} minutes remaining</span>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Button
              variant="outline"
              onClick={onPauseTimer}
              disabled={!timerState.isRunning}
              className="mobile-button-compact"
            >
              {timerState.isPaused ? (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </>
              )}
            </Button>
            
            {timerState.isPaused && onQuitSession && (
              <Button
                variant="destructive"
                onClick={onQuitSession}
                className="mobile-button-compact"
              >
                <X className="mr-2 h-4 w-4" />
                Quit
              </Button>
            )}
            
            {timerState.sessionType === "focus" && (
              <Button
                onClick={onFinishEarly}
                className="btn-primary mobile-button-compact"
              >
                <Check className="mr-2 h-4 w-4" />
                I've Finished Early
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Session Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-[#F3793A] mb-1">{stats.totalSessions}</div>
            <p className="text-sm text-muted-foreground">Sessions Today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-[#147E50] mb-1">
              {formatTimeSmall(stats.totalFocusTime * 60)}
            </div>
            <p className="text-sm text-muted-foreground">Focus Time Today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {sessionSetup.breakDuration} min
            </div>
            <p className="text-sm text-muted-foreground">Break Duration</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
