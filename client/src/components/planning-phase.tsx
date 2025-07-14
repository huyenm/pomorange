import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Plus, List, Calendar as CalendarIcon, Clock, Coffee, Headphones, Trash2, Check, X } from "lucide-react";
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
  const [newTaskNotes, setNewTaskNotes] = useState("");
  const [newTaskTags, setNewTaskTags] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const { tasks, addTask, deleteTask, updateTask, toggleTaskCompletion } = useTasks();
  
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  const { records } = useSessions();

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      const task = addTask(newTaskText.trim(), newTaskNotes.trim(), newTaskTags ? newTaskTags.split(",").map(tag => tag.trim()).filter(tag => tag) : []);
      setNewTaskText("");
      setNewTaskNotes("");
      setNewTaskTags("");
      setIsAddingTask(false);
    }
  };

  const handleCancelAddTask = () => {
    setNewTaskText("");
    setNewTaskNotes("");
    setNewTaskTags("");
    setIsAddingTask(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTask();
    } else if (e.key === "Escape") {
      handleCancelAddTask();
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
          {!isAddingTask ? (
            <div className="bg-orange-50 rounded-lg border-2 border-dashed border-orange-200" style={{ padding: '10px' }}>
              <Button
                onClick={() => setIsAddingTask(true)}
                variant="ghost"
                className="w-full h-10 text-left justify-start text-gray-500 hover:text-gray-700 hover:bg-transparent"
              >
                <Plus className="h-4 w-4" />
                Add task
              </Button>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg py-4 px-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5"></div>
                
                <div className="flex-1 space-y-2">
                  <Input
                    type="text"
                    placeholder="Task title..."
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="text-base border-none p-0 focus:ring-0 font-medium bg-transparent focus:bg-transparent outline-none focus:outline-none editing-input h-6"
                    autoFocus
                  />
                  
                  <div className="space-y-1">
                    <textarea
                      placeholder="Notes"
                      value={newTaskNotes}
                      onChange={(e) => setNewTaskNotes(e.target.value)}
                      className="text-sm text-gray-600 border-none p-0 resize-none focus:ring-0 min-h-6 bg-transparent focus:bg-transparent outline-none focus:outline-none editing-input overflow-hidden w-full"
                      rows={1}
                    />
                    
                    <Input
                      placeholder="Add Tags (comma separated)"
                      value={newTaskTags}
                      onChange={(e) => setNewTaskTags(e.target.value)}
                      className="text-sm text-blue-500 border-none p-0 focus:ring-0 bg-transparent focus:bg-transparent outline-none focus:outline-none editing-input h-6"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelAddTask}
                  className="h-7 px-3 text-xs"
                >
                  <X className="w-3 h-3" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddTask}
                  className="h-7 px-3 text-xs btn-primary"
                >
                  <Check className="w-3 h-3" />
                  Add Task
                </Button>
              </div>
            </div>
          )}

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
                    className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleTaskCompletion(task.id)}
                        className="w-5 h-5 rounded-full flex-shrink-0 transition-colors"
                        style={{ backgroundColor: 'rgb(20, 126, 80)', borderColor: 'rgb(20, 126, 80)', borderWidth: '2px' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgb(16, 100, 64)';
                          e.currentTarget.style.borderColor = 'rgb(16, 100, 64)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgb(20, 126, 80)';
                          e.currentTarget.style.borderColor = 'rgb(20, 126, 80)';
                        }}
                      >
                        <Check className="w-3 h-3 text-white m-auto" />
                      </button>
                      <span className="text-muted-custom line-through text-sm">{task.text}</span>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => deleteTask(task.id)}
                      className="text-gray-500 hover:text-red-500 w-7 h-7 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
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
