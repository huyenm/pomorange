import { useState, useEffect } from "react";
import { Coffee, SkipForward } from "lucide-react";
import { NavigationHeader } from "@/components/navigation-header";
import { PlanningPhase } from "@/components/planning-phase";
import { SessionSetupPhase } from "@/components/session-setup-phase";
import { TimerPhase } from "@/components/timer-phase";
import { TaskCompletionModal } from "@/components/task-completion-modal";
import { ConfettiModal } from "@/components/confetti-modal";
import { usePomodoro } from "@/hooks/use-pomodoro";
import { useTasks } from "@/hooks/use-tasks";
import { useSessions } from "@/hooks/use-sessions";
import { notifications } from "@/lib/notifications";
import { audioManager } from "@/lib/audio";
import { storage } from "@/lib/storage";
import { SessionSetup } from "@shared/schema";

type Phase = "planning" | "session" | "timer";

export default function PomodoroPage() {
  const [currentPhase, setCurrentPhase] = useState<Phase>("planning");
  const [sessionSetup, setSessionSetup] = useState<SessionSetup | null>(null);
  const [completionSessionSetup, setCompletionSessionSetup] = useState<SessionSetup | null>(null);
  const [completionStartTime, setCompletionStartTime] = useState<Date | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const [isBreakRunning, setIsBreakRunning] = useState(false);
  const [showConfettiModal, setShowConfettiModal] = useState(false);

  const [isEarlyFinish, setIsEarlyFinish] = useState(false);
  
  // Backup session setup to ensure continuity after breaks
  const [breakSessionSetup, setBreakSessionSetup] = useState<SessionSetup | null>(null);

  const { timerState, startTimer, pauseTimer, stopTimer, startBreak } = usePomodoro();
  const { tasks, addTask, deleteTask, updateTask, toggleTaskCompletion } = useTasks();
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
        // Focus session completed naturally - play sound and show completion modal
        if (sessionSetup) {
          // Save sessionSetup and startTime for the completion modal before showing it
          setCompletionSessionSetup(sessionSetup);
          setCompletionStartTime(timerState.startTime);
          
          // Play session finish sound when Time's up modal appears
          audioManager.playSessionFinish();
          notifications.showSessionComplete();
          
          setShowCompletionModal(true);
          stopTimer(); // Stop timer to prevent re-triggers
        }
      } else if (timerState.sessionType === "break") {
        // Break ended - automatically continue with same task
        console.log("Break completed! Current sessionSetup:", sessionSetup);
        setIsBreakRunning(false);
        notifications.showBreakEnd();
        
        // Use primary sessionSetup or backup
        const setupForContinuation = sessionSetup || breakSessionSetup;
        
        if (setupForContinuation) {
          const task = tasks.find(t => t.id === setupForContinuation.taskId);
          console.log("Found task after break:", task);
          
          if (task && !task.completed) {
            // Automatically start a new focus session with the same task
            console.log("Starting new focus session after break with same task");
            // Stop the break timer first
            stopTimer();
            
            // Use a longer delay to ensure clean state transition
            setTimeout(() => {
              setCurrentPhase("timer");
              startTimer(setupForContinuation, "focus");
              notifications.showSessionStart();
              audioManager.playSessionStart();
              // Clear backup after successful continuation
              setBreakSessionSetup(null);
            }, 200);
          } else {
            // Task completed, go to session setup
            console.log("Task was completed during break, going to session setup");
            stopTimer();
            setTimeout(() => {
              setCurrentPhase("session");
              setSessionSetup(null);
              setBreakSessionSetup(null);
            }, 100);
          }
        } else {
          console.log("No sessionSetup found after break, going to session setup");
          stopTimer();
          setTimeout(() => {
            setCurrentPhase("session");
            setBreakSessionSetup(null);
          }, 100);
        }
      }
    }
  }, [timerState.isRunning, timerState.timeRemaining, timerState.sessionType, timerState.startTime, sessionSetup, isEarlyFinish, tasks, stopTimer, startTimer, addRecord, toggleTaskCompletion, audioManager, notifications]);

  const handleStartSession = () => {
    setCurrentPhase("session");
  };

  const handleStartTimer = (setup: SessionSetup) => {
    setSessionSetup(setup);
    setCurrentPhase("timer");
    startTimer(setup, "focus");
    notifications.showSessionStart();
    audioManager.playSessionStart();
  };

  const handleFinishEarly = () => {
    if (!sessionSetup || !timerState.startTime) return;
    
    const actualMinutes = Math.ceil((Date.now() - timerState.startTime.getTime()) / 60000);
    const task = tasks.find(t => t.id === sessionSetup.taskId);
    
    // Play finish sound and show notification
    audioManager.playSessionFinish();
    notifications.showSessionComplete();
    
    // Mark task as completed
    toggleTaskCompletion(sessionSetup.taskId);
    
    // Record the session as completed
    console.log("Recording early finish session - Task lookup:", { 
      taskId: sessionSetup.taskId, 
      foundTask: task, 
      allTasks: tasks.map(t => ({ id: t.id, text: t.text }))
    });
    
    addRecord({
      taskId: sessionSetup.taskId,
      taskName: task?.text || `Task ${sessionSetup.taskId}`,
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
    const startTimeToUse = completionStartTime || timerState.startTime;
    
    if (!setupToUse || !startTimeToUse) {
      console.log("Missing sessionSetup or startTime", { setupToUse, startTime: startTimeToUse });
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
    console.log("Recording completed session - Task lookup:", { 
      taskId: setupToUse.taskId, 
      foundTask: task, 
      allTasks: tasks.map(t => ({ id: t.id, text: t.text }))
    });
    
    addRecord({
      taskId: setupToUse.taskId,
      taskName: task?.text || `Task ${setupToUse.taskId}`,
      startTimestamp: startTimeToUse,
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
    
    // Clear the completion session setup and start time
    setCompletionSessionSetup(null);
    setCompletionStartTime(null);
    
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
    const startTimeToUse = completionStartTime || timerState.startTime;
    
    console.log("handleTaskNotCompleted called with setup:", setupToUse);
    
    if (setupToUse && startTimeToUse) {
      const task = tasks.find(t => t.id === setupToUse.taskId);
      
      // Record the session but not completed
      console.log("Recording not completed session - Task lookup:", { 
        taskId: setupToUse.taskId, 
        foundTask: task, 
        allTasks: tasks.map(t => ({ id: t.id, text: t.text }))
      });
      
      addRecord({
        taskId: setupToUse.taskId,
        taskName: task?.text || `Task ${setupToUse.taskId}`,
        startTimestamp: startTimeToUse,
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
    
    // Start break automatically - keeping the same setup to continue after break
    if (setupToUse) {
      // CRITICAL: Ensure sessionSetup is preserved for after-break continuation
      setSessionSetup(setupToUse);
      setBreakSessionSetup(setupToUse); // Extra backup
      setIsBreakRunning(true);
      
      // Clear completion state since we're moving to break
      setCompletionSessionSetup(null);
      setCompletionStartTime(null);
      
      // Start break timer
      startBreak(setupToUse.breakDuration);
      notifications.showBreakStart(setupToUse.breakDuration);
      audioManager.playBreakStart();
      
      console.log("Break started with preserved sessionSetup:", setupToUse);
    }
  };

  const handleSkipBreak = () => {
    console.log("Skip break clicked! Current sessionSetup:", sessionSetup);
    
    stopTimer();
    setIsBreakRunning(false);
    
    // Use primary sessionSetup or backup
    const setupForContinuation = sessionSetup || breakSessionSetup;
    
    if (setupForContinuation) {
      const task = tasks.find(t => t.id === setupForContinuation.taskId);
      console.log("Found task for skip break:", task);
      
      if (task && !task.completed) {
        // Continue with same task after skipping break
        console.log("Continuing with same task after skipping break");
        setTimeout(() => {
          setCurrentPhase("timer");
          startTimer(setupForContinuation, "focus");
          notifications.showSessionStart();
          audioManager.playSessionStart();
          // Clear backup after successful continuation
          setBreakSessionSetup(null);
        }, 100);
      } else {
        // Task was completed, go to session setup
        console.log("Task completed, going to session setup");
        setTimeout(() => {
          setCurrentPhase("session");
          setSessionSetup(null);
          setBreakSessionSetup(null);
        }, 100);
      }
    } else {
      console.log("No sessionSetup found, going to session setup");
      setTimeout(() => {
        setCurrentPhase("session");
        setBreakSessionSetup(null);
      }, 100);
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
      <NavigationHeader />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-4 sm:py-8 min-h-screen" style={{ paddingLeft: '16px', paddingRight: '16px' }}>
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
          

      </main>

      {/* Task Completion Modal */}
      <TaskCompletionModal
        isOpen={showCompletionModal}
        taskName={(() => {
          const setupToUse = completionSessionSetup || sessionSetup;
          if (setupToUse) {
            const task = tasks.find(t => t.id === setupToUse.taskId);
            return task?.text || setupToUse.taskName || "Focus Session";
          }
          return "Focus Session";
        })()}
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
