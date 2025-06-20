import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlanningPhase } from "@/components/planning-phase";
import { SessionSetupPhase } from "@/components/session-setup-phase";
import { TimerPhase } from "@/components/timer-phase";
import { ReportsPhase } from "@/components/history-phase";
import { TaskCompletionModal } from "@/components/task-completion-modal";
import { BreakTimerModal } from "@/components/break-timer-modal";
import { usePomodoro } from "@/hooks/use-pomodoro";
import { useTasks } from "@/hooks/use-tasks";
import { useSessions } from "@/hooks/use-sessions";
import { notifications } from "@/lib/notifications";
import { SessionSetup } from "@shared/schema";

type Phase = "planning" | "session" | "timer" | "reports";

export default function PomodoroPage() {
  const [currentPhase, setCurrentPhase] = useState<Phase>("planning");
  const [sessionSetup, setSessionSetup] = useState<SessionSetup | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);

  const { timerState, startTimer, pauseTimer, stopTimer, startBreak } = usePomodoro();
  const { tasks, addTask, deleteTask, toggleTaskCompletion } = useTasks();
  const { addRecord } = useSessions();

  // Request notification permission on mount
  useEffect(() => {
    notifications.requestPermission();
  }, []);

  // Handle timer completion
  useEffect(() => {
    if (timerState.isRunning && timerState.timeRemaining === 0) {
      if (timerState.sessionType === "focus") {
        // Focus session completed - record and start break
        if (sessionSetup) {
          const task = tasks.find(t => t.id === sessionSetup.taskId);
          
          // Record the completed session
          addRecord({
            taskId: sessionSetup.taskId,
            taskName: task?.text || "Unknown Task",
            startTimestamp: timerState.startTime || new Date(),
            endTimestamp: new Date(),
            plannedMinutes: sessionSetup.focusDuration,
            actualMinutes: sessionSetup.focusDuration,
            actualFinishedEarly: false,
            breakDuration: sessionSetup.breakDuration,
            completed: false, // Don't auto-complete unless user confirms
          });

          // Show completion modal and start break
          setShowCompletionModal(true);
          notifications.showSessionComplete();
          setShowBreakModal(true);
          startBreak(sessionSetup.breakDuration);
        }
      } else {
        // Break ended - continue with same task or go to session setup
        setShowBreakModal(false);
        
        if (sessionSetup) {
          const task = tasks.find(t => t.id === sessionSetup.taskId);
          if (task && !task.completed) {
            // Continue with same task
            setCurrentPhase("timer");
            startTimer(sessionSetup, "focus");
            notifications.showSessionStart();
          } else {
            // Task completed, go to session setup
            setCurrentPhase("session");
            setSessionSetup(null);
          }
        } else {
          setCurrentPhase("session");
        }
        
        notifications.showBreakEnd();
      }
    }
  }, [timerState.isRunning, timerState.timeRemaining, timerState.sessionType, sessionSetup, tasks, addRecord, startBreak, startTimer]);

  const handleStartSession = () => {
    setCurrentPhase("session");
  };

  const handleStartTimer = (setup: SessionSetup) => {
    setSessionSetup(setup);
    setCurrentPhase("timer");
    startTimer(setup, "focus");
    // Play session start sound and notification
    notifications.showSessionStart();
  };

  const handleFinishEarly = () => {
    if (!sessionSetup || !timerState.startTime) return;
    
    const actualMinutes = Math.ceil((Date.now() - timerState.startTime.getTime()) / 60000);
    const task = tasks.find(t => t.id === sessionSetup.taskId);
    
    // Mark task as completed first
    toggleTaskCompletion(sessionSetup.taskId);
    
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
    
    // Check if there are more active tasks after completing this one
    const remainingActiveTasks = tasks.filter(t => !t.completed && t.id !== sessionSetup.taskId);
    if (remainingActiveTasks.length === 0) {
      // No more tasks, go back to planning
      setCurrentPhase("planning");
    } else {
      // More tasks available, go to session setup to select next task
      setCurrentPhase("session");
      setSessionSetup(null); // Clear current session to force new task selection
    }
  };

  const handleTaskCompleted = () => {
    if (!sessionSetup) return;
    
    // Mark task as completed
    toggleTaskCompletion(sessionSetup.taskId);
    
    // Update the existing record to mark as completed
    const existingRecords = JSON.parse(localStorage.getItem('pomodoroRecords') || '[]');
    const lastRecord = existingRecords[existingRecords.length - 1];
    if (lastRecord && lastRecord.taskId === sessionSetup.taskId) {
      lastRecord.completed = true;
      localStorage.setItem('pomodoroRecords', JSON.stringify(existingRecords));
    }

    setShowCompletionModal(false);
    
    // Check if there are more active tasks
    const activeTasks = tasks.filter(t => !t.completed && t.id !== sessionSetup.taskId);
    if (activeTasks.length === 0) {
      // No more tasks, go back to planning after break
      setSessionSetup(null);
    }
    // Continue with break - flow will handle next steps
  };

  const handleTaskNotCompleted = () => {
    setShowCompletionModal(false);
    // Task remains active, continue with break and then same task
  };

  const handleSkipBreak = () => {
    stopTimer();
    setShowBreakModal(false);
    setCurrentPhase("session");
  };

  const currentTask = sessionSetup ? tasks.find(t => t.id === sessionSetup.taskId) : null;

  return (
    <div className="min-h-screen bg-[#FEF5F0]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-shrink-0">
              <img 
                src="/pomorange-logo.png" 
                alt="Pomorange Logo" 
                className="w-[160px] h-[41.03px] object-contain"
              />
            </div>
            
            {/* Tab Navigation */}
            <nav className="flex space-x-1 bg-orange-100 rounded-lg p-1">
              <Button
                variant={currentPhase === "planning" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentPhase("planning")}
                className={currentPhase === "planning" ? "btn-primary px-4 py-2 text-sm font-bold" : "btn-secondary px-4 py-2 text-sm font-normal"}
                style={{ fontFamily: 'Space Mono, monospace' }}
              >
                Planning
              </Button>
              <Button
                variant={currentPhase === "session" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentPhase("session")}
                className={currentPhase === "session" ? "btn-primary px-4 py-2 text-sm font-bold" : "btn-secondary px-4 py-2 text-sm font-normal"}
                style={{ fontFamily: 'Space Mono, monospace' }}
              >
                Setup
              </Button>
              <Button
                variant={currentPhase === "reports" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentPhase("reports")}
                className={currentPhase === "reports" ? "btn-primary px-4 py-2 text-sm font-bold" : "btn-secondary px-4 py-2 text-sm font-normal"}
                style={{ fontFamily: 'Space Mono, monospace' }}
              >
                Reports
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-8 px-4">
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
        
        {currentPhase === "reports" && <ReportsPhase />}
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
