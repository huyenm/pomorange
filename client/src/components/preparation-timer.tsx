import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, Clock, Bell } from "lucide-react";
import { usePreparationTimer } from "@/hooks/use-preparation-timer";

interface PreparationTimerProps {
  phase: "planning" | "setup";
  onComplete?: () => void;
}

export function PreparationTimer({ phase, onComplete }: PreparationTimerProps) {
  const {
    timeRemaining,
    isRunning,
    isCompleted,
    startTimer,
    pauseTimer,
    resetTimer,
    formatTime,
    progress
  } = usePreparationTimer();

  const getPhaseText = () => {
    return phase === "planning" ? "Plan Preparation" : "Session Setup";
  };

  const getPhaseDescription = () => {
    return phase === "planning" 
      ? "Take 10 minutes to organize your tasks and prepare for focused work"
      : "Take 10 minutes to choose your task and configure your session";
  };

  return (
    <Card className={`border-2 ${isCompleted ? 'border-green-500 bg-green-50' : isRunning ? 'border-blue-500 bg-blue-50' : 'border-amber-500 bg-amber-50'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isCompleted ? 'bg-green-100' : isRunning ? 'bg-blue-100' : 'bg-amber-100'
            }`}>
              {isCompleted ? (
                <Bell className={`h-5 w-5 ${isCompleted ? 'text-green-600' : 'text-amber-600'}`} />
              ) : (
                <Clock className={`h-5 w-5 ${isRunning ? 'text-blue-600' : 'text-amber-600'}`} />
              )}
            </div>
            <div>
              <h3 className="font-medium text-slate-800">{getPhaseText()}</h3>
              <p className="text-sm text-slate-600">{getPhaseDescription()}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className={`text-2xl font-bold font-mono ${
                isCompleted ? 'text-green-600' : isRunning ? 'text-blue-600' : 'text-amber-600'
              }`}>
                {formatTime(timeRemaining)}
              </div>
              {isCompleted && (
                <p className="text-sm text-green-600 font-medium">Time's up! 🔔</p>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={pauseTimer}
                disabled={isCompleted}
              >
                {isRunning ? (
                  <>
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Start
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={resetTimer}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <Progress 
            value={progress} 
            className={`h-2 ${isCompleted ? 'bg-green-100' : isRunning ? 'bg-blue-100' : 'bg-amber-100'}`}
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>{Math.floor(progress / 10)} minutes elapsed</span>
            <span>{Math.floor((100 - progress) / 10)} minutes remaining</span>
          </div>
        </div>
        
        {isCompleted && onComplete && (
          <div className="mt-4 text-center">
            <Button
              onClick={onComplete}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Bell className="mr-2 h-4 w-4" />
              Begin Timer Now
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}