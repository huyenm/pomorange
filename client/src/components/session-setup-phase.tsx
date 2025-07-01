import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play, Clock, Pause } from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";
import { SessionSetup } from "@shared/schema";

interface SessionSetupPhaseProps {
  onStartTimer: (setup: SessionSetup) => void;
  onBackToPlanning: () => void;
}

export function SessionSetupPhase({ onStartTimer, onBackToPlanning }: SessionSetupPhaseProps) {
  const { tasks } = useTasks();
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [focusDuration, setFocusDuration] = useState("25");
  const [breakDuration, setBreakDuration] = useState("5");
  
  const activeTasks = tasks.filter(task => !task.completed);

  const selectedTask = tasks.find(task => task.id === selectedTaskId);
  
  const calculateFinishTime = () => {
    const now = new Date();
    const finishTime = new Date(now.getTime() + parseInt(focusDuration) * 60000);
    return finishTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const handleBeginTimer = () => {
    if (!selectedTaskId || !focusDuration || !breakDuration) return;
    
    const setup: SessionSetup = {
      taskId: selectedTaskId,
      focusDuration: parseInt(focusDuration),
      breakDuration: parseInt(breakDuration),
    };
    
    console.log("Debug - Creating setup with taskId:", selectedTaskId);
    console.log("Debug - Selected task object:", selectedTask);
    onStartTimer(setup);
  };

  const setPreset = (focus: string, breakTime: string) => {
    setFocusDuration(focus);
    setBreakDuration(breakTime);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="card-orange-border">
        <CardHeader>
          <div className="text-center">
            <CardTitle className="text-2xl font-semibold mb-2 card-heading text-heading-custom">Setup Your Session</CardTitle>
            <p className="text-muted-custom">Configure your focus and break durations</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Task Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Clock className="inline mr-2 h-4 w-4" />
              Select Task
            </label>
            <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
              <SelectTrigger>
                <SelectValue placeholder={activeTasks.length === 0 ? "No active tasks" : "Choose a task..."} />
              </SelectTrigger>
              <SelectContent>
                {activeTasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.text}
                  </SelectItem>
                ))}
                {activeTasks.length === 0 && (
                  <div className="p-3 text-center border-t">
                    <p className="text-sm text-[#BE8669] mb-3">No active tasks available</p>
                    <Button 
                      onClick={onBackToPlanning}
                      size="sm"
                      className="btn-primary w-full"
                    >
                      + Add New Tasks
                    </Button>
                  </div>
                )}
                {activeTasks.length > 0 && (
                  <div className="p-2 border-t">
                    <Button 
                      onClick={onBackToPlanning}
                      variant="ghost"
                      size="sm"
                      className="w-full text-[#F3793A] hover:bg-orange-50"
                    >
                      + Add New Task
                    </Button>
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Duration Settings */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Clock className="inline mr-2 h-4 w-4" />
                Focus Duration (minutes)
              </label>
              <Input
                type="number"
                value={focusDuration}
                onChange={(e) => setFocusDuration(e.target.value)}
                min="1"
                max="120"
              />
              <div className="flex space-x-2 mt-2">
                <Button
                  variant={focusDuration === "25" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFocusDuration("25")}
                  className={focusDuration === "25" ? "btn-primary" : "btn-secondary"}
                >
                  25
                </Button>
                <Button
                  variant={focusDuration === "30" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFocusDuration("30")}
                  className={focusDuration === "30" ? "btn-primary" : "btn-secondary"}
                >
                  30
                </Button>
                <Button
                  variant={focusDuration === "45" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFocusDuration("45")}
                  className={focusDuration === "45" ? "btn-primary" : "btn-secondary"}
                >
                  45
                </Button>
                <Button
                  variant={focusDuration === "50" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFocusDuration("50")}
                  className={focusDuration === "50" ? "btn-primary" : "btn-secondary"}
                >
                  50
                </Button>
                <Button
                  variant={focusDuration === "60" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFocusDuration("60")}
                  className={focusDuration === "60" ? "btn-primary" : "btn-secondary"}
                >
                  60
                </Button>
              </div>
              <p className="text-xs text-muted-custom mt-1">Recommended: 25 minutes</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Pause className="inline mr-2 h-4 w-4" />
                Break Duration (minutes)
              </label>
              <Input
                type="number"
                value={breakDuration}
                onChange={(e) => setBreakDuration(e.target.value)}
                min="1"
                max="30"
              />
              <div className="flex space-x-2 mt-2">
                <Button
                  variant={breakDuration === "5" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBreakDuration("5")}
                  className={breakDuration === "5" ? "btn-primary" : "btn-secondary"}
                >
                  5
                </Button>
                <Button
                  variant={breakDuration === "10" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBreakDuration("10")}
                  className={breakDuration === "10" ? "btn-primary" : "btn-secondary"}
                >
                  10
                </Button>
                <Button
                  variant={breakDuration === "15" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBreakDuration("15")}
                  className={breakDuration === "15" ? "btn-primary" : "btn-secondary"}
                >
                  15
                </Button>
              </div>
              <p className="text-xs text-muted-custom mt-1">Recommended: 5 minutes</p>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-sm font-medium text-heading-custom mb-3">
              Quick Presets
            </label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="p-4 h-auto flex-col"
                onClick={() => setPreset("25", "5")}
              >
                <div className="font-medium">Pomodoro</div>
                <div className="text-xs text-muted-custom">25 / 5 min</div>
              </Button>
              <Button
                variant="outline"
                className="p-4 h-auto flex-col"
                onClick={() => setPreset("15", "3")}
              >
                <div className="font-medium">Short</div>
                <div className="text-xs text-muted-custom">15 / 3 min</div>
              </Button>
              <Button
                variant="outline"
                className="p-4 h-auto flex-col"
                onClick={() => setPreset("45", "10")}
              >
                <div className="font-medium">Long</div>
                <div className="text-xs text-muted-custom">45 / 10 min</div>
              </Button>
            </div>
          </div>

          {/* Session Preview */}
          <div className="bg-orange-50 rounded-lg p-4 border border-[#F3793A]">
            <h4 className="font-bold text-heading-custom mb-2">Session Preview</h4>
            <div className="text-sm space-y-1">
              <p className="text-[#F3793A]"><strong>Task:</strong> {selectedTask?.text || "No task selected"}</p>
              <p className="text-[#F3793A]"><strong>Focus Time:</strong> {focusDuration} minutes</p>
              <p className="text-[#F3793A]"><strong>Break Time:</strong> {breakDuration} minutes</p>
              <p className="text-[#F3793A]"><strong>Estimated Finish:</strong> {calculateFinishTime()}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <Button
              variant="outline"
              onClick={onBackToPlanning}
              className="btn-secondary flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Planning
            </Button>
            <Button
              onClick={handleBeginTimer}
              disabled={!selectedTaskId || !focusDuration || !breakDuration}
              className="btn-primary flex-1"
            >
              <Play className="mr-2 h-4 w-4" />
              Begin Timer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
