import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Plus, List, Calendar as CalendarIcon, Clock, Coffee, Headphones, Trash2, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { TaskItem } from "@/components/task-item";
import { useTasks } from "@/hooks/use-tasks";
import { useSessions } from "@/hooks/use-sessions";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

interface PlanningPhaseProps {
  onStartSession: () => void;
}

export function PlanningPhase({ onStartSession }: PlanningPhaseProps) {
  const [newTaskText, setNewTaskText] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const { tasks, addTask, deleteTask, updateTask, toggleTaskCompletion } = useTasks();
  
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  const { records } = useSessions();

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

  const handleSelectTask = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  // Get sessions for a specific date
  const getSessionsForDate = (date: Date) => {
    return records.filter(record => 
      isSameDay(record.startTimestamp, date)
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-custom">
      {/* Tasks Section - Flexible width */}
      <div className="flex-1">
        <Card className="card-orange-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg sm:text-xl font-semibold card-heading text-heading-custom mobile-text-2xl">Today's Tasks</CardTitle>
            <Badge variant="secondary">{activeTasks.length} active</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 mobile-task-card">
          {/* Add Task Form */}
          <div className="p-4 bg-orange-50 rounded-lg border-2 border-dashed border-orange-200">
            <div className="flex space-x-3">
              <Input
                type="text"
                placeholder="Add a new task..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 h-10"
                style={{ paddingLeft: '10px', paddingRight: '10px' }}
              />
              <Button onClick={handleAddTask} className="btn-primary w-10 h-10 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Active Task List */}
          <div className="space-y-3">
            {activeTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <List className="h-12 w-12 mx-auto mb-3 text-orange-300" />
                <p className="text-muted-custom">No active tasks yet. Add your first task above!</p>
              </div>
            ) : (
              activeTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isSelected={selectedTaskId === task.id}
                  onSelect={() => handleSelectTask(task.id)}
                  onUpdate={updateTask}
                  onDelete={deleteTask}
                  onToggleComplete={toggleTaskCompletion}
                />
              ))
            )}
          </div>

          {/* Completed Tasks Section */}
          {completedTasks.length > 0 && (
            <div className="pt-6 border-t border-orange-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-heading-custom">Completed Tasks</h4>
                <Badge variant="outline" className="text-[#147E50] border-[#147E50]">
                  {completedTasks.length} completed
                </Badge>
              </div>
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleTaskCompletion(task.id)}
                        className="w-5 h-5 rounded-full border-2 border-green-500 flex-shrink-0 hover:border-green-600 transition-colors"
                      >
                        <Check className="w-3 h-3 text-green-500 m-auto" />
                      </button>
                      <span className="text-muted-custom line-through text-sm">{task.text}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTask(task.id)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Start Session Button */}
          <div className="pt-6 border-t border-orange-200">
            <Button
              onClick={onStartSession}
              className="btn-primary w-full py-4 text-base font-semibold"
              disabled={activeTasks.length === 0}
            >
              <Clock className="h-5 w-5" />
              <span className="ml-2">Start Setting up Session</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Calendar and Tips Section - Fixed width */}
    <div className="flex flex-col space-y-6 lg:w-[300px] lg:flex-shrink-0 w-full">
      {/* Monthly Calendar */}
      <Card className="card-orange-border">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg font-semibold card-heading text-heading-custom flex items-center mobile-text-2xl">
            <CalendarIcon className="mr-2 h-6 w-6 text-[#F3793A]" />
            Monthly Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border-0"
            modifiers={{
              hasSession: (date) => getSessionsForDate(date).length > 0
            }}
            modifiersStyles={{
              hasSession: { 
                backgroundColor: '#147E50', 
                color: 'white',
                fontWeight: 'bold'
              }
            }}
          />
          <div className="mt-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-[#147E50] rounded"></div>
              <span>Days with completed sessions</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="card-orange-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold card-heading text-heading-custom flex items-center">
            <Clock className="mr-2 h-6 w-6 text-[#F3793A]" />
            Focus Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-[#147E50] bg-opacity-20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
              <Clock className="h-5 w-5 text-[#147E50]" />
            </div>
            <div>
              <p className="text-sm font-medium text-heading-custom">Turn on Focus Mode</p>
              <p className="text-xs text-muted-custom">Disable notifications and distractions</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-[#F3793A] bg-opacity-20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
              <Coffee className="h-5 w-5 text-[#F3793A]" />
            </div>
            <div>
              <p className="text-sm font-medium text-heading-custom">Prepare Your Drink</p>
              <p className="text-xs text-muted-custom">Have water or coffee ready</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
              <Headphones className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-heading-custom">Use Background Music</p>
              <p className="text-xs text-muted-custom">Choose instrumental or nature sounds</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
              <List className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-heading-custom">Clear Your Workspace</p>
              <p className="text-xs text-muted-custom">Remove clutter and organize materials</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}
