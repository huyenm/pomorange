import { useState, useEffect } from "react";
import { Clock, Menu, X, Coffee, SkipForward } from "lucide-react";
import pomorangeLogo from "@assets/pomologo_1751004068165.png";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlanningPhase } from "@/components/planning-phase";
import { SessionSetupPhase } from "@/components/session-setup-phase";
import { TimerPhase } from "@/components/timer-phase";
import { ReportsPhase } from "@/components/history-phase";
import { TaskCompletionModal } from "@/components/task-completion-modal";

import { ConfettiModal } from "@/components/confetti-modal";
import { usePomodoro } from "@/hooks/use-pomodoro";
import { useTasks } from "@/hooks/use-tasks";
import { useSessions } from "@/hooks/use-sessions";
import { notifications } from "@/lib/notifications";
import { audioManager } from "@/lib/audio";
import { storage } from "@/lib/storage";
import { SessionSetup } from "@shared/schema";

type Phase = "planning" | "session" | "timer" | "reports";

export default function PomodoroPage() {
  const [currentPhase, setCurrentPhase] = useState<Phase>("planning");
  const [sessionSetup, setSessionSetup] = useState<SessionSetup | null>(null);
  const [completionSessionSetup, setCompletionSessionSetup] = useState<SessionSetup | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const [isBreakRunning, setIsBreakRunning] = useState(false);
  const [showConfettiModal, setShowConfettiModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEarlyFinish, setIsEarlyFinish] = useState(false);

  const { timerState, startTimer, pauseTimer, stopTimer, startBreak } = usePomodoro();
  const { tasks, addTask, deleteTask, toggleTaskCompletion } = useTasks();
  const { addRecord } = useSessions();

  // Request notification permission on mount
  useEffect(() => {
    notifications.requestPermission();
  }, []);

  // Handle timer completion
  useEffect(() => {
    // Only handle natural timer completion (not early finish)
    if (!timerState.isRunning && timerState.timeRemaining === 0 && timerState.startTime && !isEarlyFinish) {
      if (timerState.sessionType === "focus") {
        // Focus session completed naturally - show completion modal
        if (sessionSetup) {
          // Save sessionSetup for the completion modal before showing it
          setCompletionSessionSetup(sessionSetup);
          setShowCompletionModal(true);
          notifications.showSessionComplete();
          stopTimer(); // Stop timer to prevent re-triggers
        }
      } else if (timerState.sessionType === "break") {
        // Break ended - continue with same task
        setIsBreakRunning(false);
        notifications.showBreakEnd();
        
        if (sessionSetup) {
          const task = tasks.find(t => t.id === sessionSetup.taskId);
          if (task && !task.completed) {
            // Continue with same task - start new focus session immediately
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
        
        // Stop the timer to prevent re-triggers
        stopTimer();
      }
    }
  }, [timerState.isRunning, timerState.timeRemaining, timerState.sessionType, timerState.startTime, sessionSetup, isEarlyFinish]); // Removed functions that cause re-renders

  const handleStartSession = () => {
    setCurrentPhase("session");
  };

  const handleStartTimer = (setup: SessionSetup) => {
    setSessionSetup(setup);
    setCurrentPhase("timer");
    startTimer(setup, "focus");
    notifications.showSessionStart();
  };

  const handleFinishEarly = () => {
    if (!sessionSetup || !timerState.startTime) return;
    
    const actualMinutes = Math.ceil((Date.now() - timerState.startTime.getTime()) / 60000);
    const task = tasks.find(t => t.id === sessionSetup.taskId);
    
    // Play finish sound and show notification
    notifications.showSessionComplete();
    
    // Mark task as completed
    toggleTaskCompletion(sessionSetup.taskId);
    
    // Record the session as completed
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

    // Stop timer first, then set flag and show confetti
    stopTimer();
    
    // Set flag to prevent useEffect from triggering completion modal
    setIsEarlyFinish(true);
    
    // Play achievement sound and show confetti
    audioManager.playAchievement();
    setShowConfettiModal(true);
  };

  const handleTaskCompleted = () => {
    console.log("handleTaskCompleted called");
    const setupToUse = completionSessionSetup || sessionSetup;
    
    if (!setupToUse || !timerState.startTime) {
      console.log("Missing sessionSetup or startTime", { setupToUse, startTime: timerState.startTime });
      return;
    }
    
    console.log("Proceeding with task completion for:", setupToUse.taskId);
    
    // First stop timer and close modal
    stopTimer();
    setShowCompletionModal(false);
    setIsEarlyFinish(true);
    
    const task = tasks.find(t => t.id === setupToUse.taskId);
    console.log("Found task:", task);
    
    // Mark task as completed in storage
    storage.toggleTaskCompletion(setupToUse.taskId);
    console.log("Task toggled in storage");
    
    // Record the session
    addRecord({
      taskId: setupToUse.taskId,
      taskName: task?.text || "Unknown Task",
      startTimestamp: timerState.startTime,
      endTimestamp: new Date(),
      plannedMinutes: setupToUse.focusDuration,
      actualMinutes: setupToUse.focusDuration,
      actualFinishedEarly: false,
      breakDuration: setupToUse.breakDuration,
      completed: true,
    });
    console.log("Session recorded");
    
    // Show confetti and play sound
    audioManager.playAchievement();
    setShowConfettiModal(true);
    console.log("Confetti modal shown");
    
    // Clear the completion session setup
    setCompletionSessionSetup(null);
    
    // Force tasks refresh after a short delay
    setTimeout(() => {
      const freshTasks = storage.getTasks();
      console.log("Fresh tasks from storage:", freshTasks);
      // This will force the useTasks hook to re-render with new data
      window.dispatchEvent(new Event('storage'));
    }, 50);
  };

  const handleTaskNotCompleted = () => {
    const setupToUse = completionSessionSetup || sessionSetup;
    
    if (setupToUse && timerState.startTime) {
      const task = tasks.find(t => t.id === setupToUse.taskId);
      
      // Record the session but not completed
      addRecord({
        taskId: setupToUse.taskId,
        taskName: task?.text || "Unknown Task",
        startTimestamp: timerState.startTime,
        endTimestamp: new Date(),
        plannedMinutes: setupToUse.focusDuration,
        actualMinutes: setupToUse.focusDuration,
        actualFinishedEarly: false,
        breakDuration: setupToUse.breakDuration,
        completed: false,
      });
    }
    
    // Close completion modal and start break
    setShowCompletionModal(false);
    
    // Start break automatically
    if (sessionSetup) {
      setIsBreakRunning(true);
      startBreak(sessionSetup.breakDuration);
      notifications.showBreakStart(sessionSetup.breakDuration);
    }
  };

  const handleSkipBreak = () => {
    stopTimer();
    setIsBreakRunning(false);
    
    if (sessionSetup) {
      const task = tasks.find(t => t.id === sessionSetup.taskId);
      if (task && !task.completed) {
        // Continue with same task after skipping break
        setCurrentPhase("timer");
        startTimer(sessionSetup, "focus");
        notifications.showSessionStart();
      } else {
        // Task was completed, go to session setup
        setCurrentPhase("session");
        setSessionSetup(null);
      }
    } else {
      setCurrentPhase("session");
    }
  };

  const handleQuitSession = () => {
    stopTimer();
    setCurrentPhase("planning");
    setSessionSetup(null);
  };

  const handleConfettiClose = () => {
    setShowConfettiModal(false);
    setIsEarlyFinish(false);
    
    // Go back to session setup with fresh state
    setCurrentPhase("session");
    setSessionSetup(null);
    
    // Trigger one final tasks refresh
    window.dispatchEvent(new Event('storage'));
  };

  const currentTask = sessionSetup ? tasks.find(t => t.id === sessionSetup.taskId) : null;
  const currentTaskName = currentTask?.text || "Unknown task";
  
  // For the completion modal, use the saved completion setup
  const completionTask = completionSessionSetup ? tasks.find(t => t.id === completionSessionSetup.taskId) : null;
  const completionTaskName = completionTask?.text || "Unknown task";

  return (
    <div className="min-h-screen bg-[#FEF5F0]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-shrink-0">
              <img 
                src="/pomologo.png" 
                alt="Pomorange Logo" 
                className="w-[160px] h-[41.03px] object-contain"
              />
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1 bg-orange-100 rounded-lg p-1">
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

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-[#BE8669]/20">
              <nav className="flex flex-col space-y-2">
                <Button
                  variant={currentPhase === "planning" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setCurrentPhase("planning");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`justify-start ${currentPhase === "planning" ? "btn-primary px-4 py-2 text-sm font-bold" : "btn-secondary px-4 py-2 text-sm font-normal"}`}
                  style={{ fontFamily: 'Space Mono, monospace' }}
                >
                  Planning
                </Button>
                <Button
                  variant={currentPhase === "session" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setCurrentPhase("session");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`justify-start ${currentPhase === "session" ? "btn-primary px-4 py-2 text-sm font-bold" : "btn-secondary px-4 py-2 text-sm font-normal"}`}
                  style={{ fontFamily: 'Space Mono, monospace' }}
                >
                  Session
                </Button>
                <Button
                  variant={currentPhase === "timer" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setCurrentPhase("timer");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`justify-start ${currentPhase === "timer" ? "btn-primary px-4 py-2 text-sm font-bold" : "btn-secondary px-4 py-2 text-sm font-normal"}`}
                  style={{ fontFamily: 'Space Mono, monospace' }}
                >
                  Timer
                </Button>
                <Button
                  variant={currentPhase === "reports" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setCurrentPhase("reports");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`justify-start ${currentPhase === "reports" ? "btn-primary px-4 py-2 text-sm font-bold" : "btn-secondary px-4 py-2 text-sm font-normal"}`}
                  style={{ fontFamily: 'Space Mono, monospace' }}
                >
                  Reports
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-8 px-4 min-h-screen">
        {currentPhase === "planning" && (
          <PlanningPhase onStartSession={handleStartSession} />
        )}
        
        {currentPhase === "session" && (
          <SessionSetupPhase
            onStartTimer={handleStartTimer}
            onBackToPlanning={() => setCurrentPhase("planning")}
          />
        )}
        
        {currentPhase === "timer" && sessionSetup && !isBreakRunning && (
          <TimerPhase
            timerState={timerState}
            sessionSetup={sessionSetup}
            onPauseTimer={pauseTimer}
            onFinishEarly={handleFinishEarly}
            onQuitSession={handleQuitSession}
          />
        )}
        
        {isBreakRunning && (
          <div className="max-w-md mx-auto text-center py-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coffee className="h-8 w-8 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Space Mono, monospace' }}>
                Break Time!
              </h2>
              <div className="text-4xl font-bold text-amber-600 mb-6" style={{ fontFamily: 'Space Mono, monospace' }}>
                {Math.floor(timerState.timeRemaining / 60)}:{(timerState.timeRemaining % 60).toString().padStart(2, '0')}
              </div>
              <p className="text-gray-600 mb-6">
                Take a well-deserved break
              </p>
              <Button 
                variant="outline" 
                onClick={handleSkipBreak}
                className="btn-secondary"
                style={{ fontFamily: 'Space Mono, monospace' }}
              >
                <SkipForward className="mr-2 h-4 w-4" />
                Skip Break
              </Button>
            </div>
          </div>
        )}
        
        {currentPhase === "reports" && <ReportsPhase />}
      </main>

      {/* Task Completion Modal */}
      <TaskCompletionModal
        isOpen={showCompletionModal}
        taskName={completionTaskName}
        onCompleted={handleTaskCompleted}
        onNotCompleted={handleTaskNotCompleted}
      />



      {/* Confetti Celebration Modal */}
      <ConfettiModal
        isOpen={showConfettiModal}
        taskName={sessionSetup ? (tasks.find(t => t.id === sessionSetup.taskId)?.text || "Task completed") : "Task completed"}
        onClose={handleConfettiClose}
      />
    </div>
  );
}
