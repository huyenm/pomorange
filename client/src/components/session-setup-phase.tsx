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
    
    onStartTimer(setup);
  };

  const setPreset = (focus: string, breakTime: string) => {
    setFocusDuration(focus);
    setBreakDuration(breakTime);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-[#F3793A]">
        <CardHeader>
          <div className="text-center">
            <CardTitle className="text-2xl font-semibold mb-2 card-heading">Setup Your Session</CardTitle>
            <p className="text-slate-600">Configure your focus and break durations</p>
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
                <SelectValue placeholder="Choose a task..." />
              </SelectTrigger>
              <SelectContent>
                {tasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.text}
                  </SelectItem>
                ))}
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
              <p className="text-xs text-muted-foreground mt-1">Recommended: 25 minutes</p>
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
              <p className="text-xs text-slate-500 mt-1">Recommended: 5 minutes</p>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Quick Presets
            </label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="p-4 h-auto flex-col"
                onClick={() => setPreset("25", "5")}
              >
                <div className="font-medium">Pomodoro</div>
                <div className="text-xs text-slate-500">25 / 5 min</div>
              </Button>
              <Button
                variant="outline"
                className="p-4 h-auto flex-col"
                onClick={() => setPreset("15", "3")}
              >
                <div className="font-medium">Short</div>
                <div className="text-xs text-slate-500">15 / 3 min</div>
              </Button>
              <Button
                variant="outline"
                className="p-4 h-auto flex-col"
                onClick={() => setPreset("45", "10")}
              >
                <div className="font-medium">Long</div>
                <div className="text-xs text-slate-500">45 / 10 min</div>
              </Button>
            </div>
          </div>

          {/* Session Preview */}
          <div className="bg-orange-50 rounded-lg p-4 border border-[#F3793A]">
            <h4 className="font-bold text-slate-800 mb-2">Session Preview</h4>
            <div className="text-sm text-slate-600 space-y-1">
              <p><strong>Task:</strong> {selectedTask?.text || "No task selected"}</p>
              <p><strong>Focus Time:</strong> {focusDuration} minutes</p>
              <p><strong>Break Time:</strong> {breakDuration} minutes</p>
              <p><strong>Estimated Finish:</strong> {calculateFinishTime()}</p>
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
