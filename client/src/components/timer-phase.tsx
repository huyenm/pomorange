import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Pause, Play, Check, Clock } from "lucide-react";
import { TimerState, SessionSetup } from "@shared/schema";
import { useTasks } from "@/hooks/use-tasks";
import { useSessions } from "@/hooks/use-sessions";

interface TimerPhaseProps {
  timerState: TimerState;
  sessionSetup: SessionSetup;
  onPauseTimer: () => void;
  onFinishEarly: () => void;
}

export function TimerPhase({ timerState, sessionSetup, onPauseTimer, onFinishEarly }: TimerPhaseProps) {
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
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Timer Display */}
      <Card>
        <CardHeader>
          <div className="text-center">
            <Badge className="mb-4">
              <Clock className="mr-2 h-4 w-4" />
              {timerState.sessionType === "focus" ? "Focus Session" : "Break Time"}
            </Badge>
            <CardTitle className="text-lg font-medium mb-2">
              {currentTask?.text || "Unknown Task"}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-8">
          {/* Countdown Display */}
          <div>
            <div className="text-6xl md:text-7xl font-bold text-blue-600 mb-4 font-mono">
              {formatTime(timerState.timeRemaining)}
            </div>
            <div className="text-slate-600 space-y-1">
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
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={onPauseTimer}
              disabled={!timerState.isRunning}
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
            
            {timerState.sessionType === "focus" && (
              <Button
                onClick={onFinishEarly}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="mr-2 h-4 w-4" />
                I've Finished Early
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Session Info */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalSessions}</div>
            <p className="text-sm text-slate-600">Sessions Today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {formatTimeSmall(stats.totalFocusTime * 60)}
            </div>
            <p className="text-sm text-slate-600">Focus Time Today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-amber-600 mb-1">
              {sessionSetup.breakDuration} min
            </div>
            <p className="text-sm text-slate-600">Break Duration</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
