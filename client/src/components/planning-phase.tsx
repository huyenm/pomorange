import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Clock, Coffee, Headphones, List } from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";
import { useSessions } from "@/hooks/use-sessions";
import { PreparationTimer } from "@/components/preparation-timer";

interface PlanningPhaseProps {
  onStartSession: () => void;
}

export function PlanningPhase({ onStartSession }: PlanningPhaseProps) {
  const [newTaskText, setNewTaskText] = useState("");
  const { tasks, addTask, deleteTask } = useTasks();
  const { getStats } = useSessions();
  const stats = getStats();

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      addTask(newTaskText.trim());
      setNewTaskText("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
  };

  return (
    <div className="space-y-6">
      {/* Preparation Timer */}
      <PreparationTimer phase="planning" onComplete={onStartSession} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tasks Section */}
        <div className="lg:col-span-2">
          <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">Today's Tasks</CardTitle>
              <Badge variant="secondary">{tasks.length} tasks</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Task Form */}
            <div className="p-4 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
              <div className="flex space-x-3">
                <Input
                  type="text"
                  placeholder="Add a new task..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={handleAddTask} className="px-6">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Task List */}
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <List className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p>No tasks yet. Add your first task above!</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-slate-800 font-medium">{task.text}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTask(task.id)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Start Session Button */}
            <div className="pt-6 border-t border-slate-200">
              <Button
                onClick={onStartSession}
                className="w-full py-4 text-lg font-semibold"
                disabled={tasks.length === 0}
              >
                Start Setting up Session
                <Clock className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tips and Stats Section */}
      <div className="lg:col-span-1 space-y-6">
        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <Clock className="mr-2 h-5 w-5 text-amber-500" />
              Focus Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <Clock className="h-3 w-3 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Turn on Focus Mode</p>
                <p className="text-xs text-slate-600">Disable notifications and distractions</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center mt-0.5">
                <Coffee className="h-3 w-3 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Prepare Your Drink</p>
                <p className="text-xs text-slate-600">Have water or coffee ready</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <Headphones className="h-3 w-3 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Use Background Music</p>
                <p className="text-xs text-slate-600">Choose instrumental or nature sounds</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                <List className="h-3 w-3 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Clear Your Workspace</p>
                <p className="text-xs text-slate-600">Remove clutter and organize materials</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Today's Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Completed Sessions</span>
              <span className="text-lg font-bold text-green-600">{stats.totalSessions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Focus Time</span>
              <span className="text-lg font-bold text-blue-600">
                {Math.floor(stats.totalFocusTime / 60)}h {stats.totalFocusTime % 60}m
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Tasks Completed</span>
              <span className="text-lg font-bold text-slate-800">{stats.completedTasks}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
