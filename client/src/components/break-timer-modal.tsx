import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Coffee, SkipForward } from "lucide-react";
import { TimerState } from "@shared/schema";

interface BreakTimerModalProps {
  isOpen: boolean;
  timerState: TimerState;
  onSkipBreak: () => void;
}

export function BreakTimerModal({ isOpen, timerState, onSkipBreak }: BreakTimerModalProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progress = timerState.totalTime > 0 
    ? ((timerState.totalTime - timerState.timeRemaining) / timerState.totalTime) * 100
    : 0;

  const formatFinishTime = (date: Date | null) => {
    if (!date) return "--:--";
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coffee className="h-8 w-8 text-amber-600" />
            </div>
            <DialogTitle className="text-xl font-semibold mb-2">Break Time!</DialogTitle>
            <p className="text-slate-600">Take a well-deserved break</p>
          </div>
        </DialogHeader>
        
        <div className="text-center space-y-6">
          <div className="text-4xl font-bold text-amber-600 font-mono">
            {formatTime(timerState.timeRemaining)}
          </div>
          
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-slate-600">
              Break ends at {formatFinishTime(timerState.finishTime)}
            </p>
          </div>

          <Button 
            variant="outline" 
            onClick={onSkipBreak}
            className="w-full"
          >
            <SkipForward className="mr-2 h-4 w-4" />
            Skip Break
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
