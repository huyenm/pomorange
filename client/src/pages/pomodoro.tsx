import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlanningPhase } from "@/components/planning-phase";
import { SessionSetupPhase } from "@/components/session-setup-phase";
import { TimerPhase } from "@/components/timer-phase";
import { HistoryPhase } from "@/components/history-phase";
import { TaskCompletionModal } from "@/components/task-completion-modal";
import { BreakTimerModal } from "@/components/break-timer-modal";
import { usePomodoro } from "@/hooks/use-pomodoro";
import { useTasks } from "@/hooks/use-tasks";
import { useSessions } from "@/hooks/use-sessions";
import { notifications } from "@/lib/notifications";
import { SessionSetup } from "@shared/schema";

type Phase = "planning" | "session" | "timer" | "history";

export default function PomodoroPage() {
  const [currentPhase, setCurrentPhase] = useState<Phase>("planning");
  const [sessionSetup, setSessionSetup] = useState<SessionSetup | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);

  const { timerState, startTimer, pauseTimer, stopTimer, startBreak } = usePomodoro();
  const { tasks } = useTasks();
  const { addRecord } = useSessions();

  // Request notification permission on mount
  useEffect(() => {
    notifications.requestPermission();
  }, []);

  // Handle timer completion
  useEffect(() => {
    if (timerState.isRunning && timerState.timeRemaining === 0) {
      if (timerState.sessionType === "focus") {
        setShowCompletionModal(true);
      } else {
        // Break ended, return to session setup
        setCurrentPhase("session");
      }
    }
  }, [timerState.isRunning, timerState.timeRemaining, timerState.sessionType]);

  const handleStartSession = () => {
    setCurrentPhase("session");
  };

  const handleStartTimer = (setup: SessionSetup) => {
    setSessionSetup(setup);
    setCurrentPhase("timer");
    startTimer(setup, "focus");
  };

  const handleFinishEarly = () => {
    if (!sessionSetup || !timerState.startTime) return;
    
    const actualMinutes = Math.ceil((Date.now() - timerState.startTime.getTime()) / 60000);
    const task = tasks.find(t => t.id === sessionSetup.taskId);
    
    // Record the session
    addRecord({
      taskId: sessionSetup.taskId,
      taskName: task?.text || "Unknown Task",
      startTimestamp: timerState.startTime,
      endTimestamp: new Date(),
      plannedMinutes: sessionSetup.focusDuration,
      actualMinutes,
      actualFinishedEarly: true,
      breakDuration: sessionSetup.breakDuration,
      completed: true,
    });

    stopTimer();
    setShowBreakModal(true);
    startBreak(sessionSetup.breakDuration);
  };

  const handleTaskCompleted = () => {
    if (!sessionSetup || !timerState.startTime) return;
    
    const task = tasks.find(t => t.id === sessionSetup.taskId);
    
    // Record the session
    addRecord({
      taskId: sessionSetup.taskId,
      taskName: task?.text || "Unknown Task",
      startTimestamp: timerState.startTime,
      endTimestamp: new Date(),
      plannedMinutes: sessionSetup.focusDuration,
      actualMinutes: sessionSetup.focusDuration,
      actualFinishedEarly: false,
      breakDuration: sessionSetup.breakDuration,
      completed: true,
    });

    setShowCompletionModal(false);
    setShowBreakModal(true);
    startBreak(sessionSetup.breakDuration);
  };

  const handleTaskNotCompleted = () => {
    if (!sessionSetup || !timerState.startTime) return;
    
    const task = tasks.find(t => t.id === sessionSetup.taskId);
    
    // Record the session as incomplete
    addRecord({
      taskId: sessionSetup.taskId,
      taskName: task?.text || "Unknown Task",
      startTimestamp: timerState.startTime,
      endTimestamp: new Date(),
      plannedMinutes: sessionSetup.focusDuration,
      actualMinutes: sessionSetup.focusDuration,
      actualFinishedEarly: false,
      breakDuration: sessionSetup.breakDuration,
      completed: false,
    });

    setShowCompletionModal(false);
    setShowBreakModal(true);
    startBreak(sessionSetup.breakDuration);
  };

  const handleSkipBreak = () => {
    stopTimer();
    setShowBreakModal(false);
    setCurrentPhase("session");
  };

  const currentTask = sessionSetup ? tasks.find(t => t.id === sessionSetup.taskId) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-slate-900">Pomodoro Timer</h1>
            </div>
            
            {/* Tab Navigation */}
            <nav className="flex space-x-1 bg-slate-100 rounded-lg p-1">
              <Button
                variant={currentPhase === "planning" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentPhase("planning")}
                className="px-4 py-2 text-sm"
              >
                Planning
              </Button>
              <Button
                variant={currentPhase === "session" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentPhase("session")}
                className="px-4 py-2 text-sm"
              >
                Setup
              </Button>
              <Button
                variant={currentPhase === "timer" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentPhase("timer")}
                className="px-4 py-2 text-sm"
                disabled={!sessionSetup}
              >
                Timer
              </Button>
              <Button
                variant={currentPhase === "history" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentPhase("history")}
                className="px-4 py-2 text-sm"
              >
                History
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {currentPhase === "planning" && (
          <PlanningPhase onStartSession={handleStartSession} />
        )}
        
        {currentPhase === "session" && (
          <SessionSetupPhase
            onStartTimer={handleStartTimer}
            onBackToPlanning={() => setCurrentPhase("planning")}
          />
        )}
        
        {currentPhase === "timer" && sessionSetup && (
          <TimerPhase
            timerState={timerState}
            sessionSetup={sessionSetup}
            onPauseTimer={pauseTimer}
            onFinishEarly={handleFinishEarly}
          />
        )}
        
        {currentPhase === "history" && <HistoryPhase />}
      </main>

      {/* Modals */}
      <TaskCompletionModal
        isOpen={showCompletionModal}
        taskName={currentTask?.text || "Unknown Task"}
        onCompleted={handleTaskCompleted}
        onNotCompleted={handleTaskNotCompleted}
      />

      <BreakTimerModal
        isOpen={showBreakModal}
        timerState={timerState}
        onSkipBreak={handleSkipBreak}
      />
    </div>
  );
}
