import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Plus, List, Calendar as CalendarIcon, Clock, Coffee, Headphones, Trash2, Check, X, Tags, ChevronDown, Pipette } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { TaskItem } from "@/components/task-item";
import { useTasks } from "@/hooks/use-tasks";
import { useSessions } from "@/hooks/use-sessions";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { LABEL_COLORS, useLabels } from "@/hooks/use-labels";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function BroomIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m19 3-8.5 8.5" />
      <path d="m8.5 10.5 5 5" />
      <path d="M7.5 11.5 3 16l5 5 4.5-4.5" />
      <path d="m4.5 17.5 3 3" />
      <path d="m7 15 3 3" />
    </svg>
  );
}

interface PlanningPhaseProps {
  onStartSession: (selectedTaskId?: string) => void;
}

export function PlanningPhase({ onStartSession }: PlanningPhaseProps) {
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskNotes, setNewTaskNotes] = useState("");
  const [newTaskLabelId, setNewTaskLabelId] = useState("none");
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#F3793A");
  const [labelFilter, setLabelFilter] = useState("all");
  const [labelMenuOpen, setLabelMenuOpen] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const { tasks, addTask, deleteTask, updateTask, toggleTaskCompletion } = useTasks();
  const { labels, addLabel, updateLabelColor, deleteLabel } = useLabels();
  
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  const filteredActiveTasks = activeTasks.filter(task =>
    labelFilter === "all"
      ? true
      : labelFilter === "none"
        ? !task.labelId
        : task.labelId === labelFilter,
  );
  const filteredCompletedTasks = completedTasks.filter(task =>
    labelFilter === "all"
      ? true
      : labelFilter === "none"
        ? !task.labelId
        : task.labelId === labelFilter,
  );
  const { records } = useSessions();

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      addTask(
        newTaskText.trim(),
        newTaskNotes.trim(),
        [],
        newTaskLabelId === "none" ? null : newTaskLabelId,
      );

       // Notify all useTasks() hooks to reload from storage
      window.dispatchEvent(new Event("storage"));

      //Reset form
      setNewTaskText("");
      setNewTaskNotes("");
      setNewTaskLabelId("none");
      setIsAddingTask(false);
    }
  };

  const handleCancelAddTask = () => {
    setNewTaskText("");
    setNewTaskNotes("");
    setNewTaskLabelId("none");
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
            <Badge variant="outline" className="text-[#F3793A] border-[#F3793A] bg-orange-50">{activeTasks.length} active</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 mobile-task-card">
          {/* Compact Label Filter */}
          {labels.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="label-filter-trigger h-8 gap-0 rounded-full bg-white px-3 text-xs font-medium"
                >
                  <Tags className="mr-1.5 h-3.5 w-3.5 text-[#F3793A]" />
                  {labelFilter === "all"
                    ? "All labels"
                    : labelFilter === "none"
                      ? "Unlabeled"
                      : labels.find(label => label.id === labelFilter)?.name || "All labels"}
                  <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-56 p-2">
                <button
                  type="button"
                  onClick={() => setLabelFilter("all")}
                  className="flex w-full items-center rounded px-2 py-2 text-left text-sm hover:bg-orange-50"
                >
                  All labels
                  {labelFilter === "all" && <Check className="ml-auto h-4 w-4 text-[#147E50]" />}
                </button>
                <button
                  type="button"
                  onClick={() => setLabelFilter("none")}
                  className="flex w-full items-center rounded px-2 py-2 text-left text-sm hover:bg-orange-50"
                >
                  Unlabeled
                  {labelFilter === "none" && <Check className="ml-auto h-4 w-4 text-[#147E50]" />}
                </button>
                {labels.map(label => (
                  <div key={label.id} className="group/label flex items-center rounded hover:bg-orange-50">
                    <button
                      type="button"
                      onClick={() => setLabelFilter(label.id)}
                      className="flex flex-1 items-center gap-2 px-2 py-2 text-left text-sm"
                    >
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: label.color }} />
                      {label.name}
                      {labelFilter === label.id && <Check className="ml-auto h-4 w-4 text-[#147E50]" />}
                    </button>
                    <input
                      type="color"
                      value={label.color}
                      onChange={(event) => updateLabelColor(label.id, event.target.value)}
                      onClick={(event) => event.stopPropagation()}
                      className="mr-1 h-6 w-7 cursor-pointer rounded border bg-white p-0.5"
                      aria-label={`Change ${label.name} color`}
                      title={`Change ${label.name} color`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        deleteLabel(label.id);
                        if (labelFilter === label.id) setLabelFilter("all");
                      }}
                      className="mr-1 rounded p-1 text-gray-400 opacity-0 hover:bg-red-50 hover:text-red-600 group-hover/label:opacity-100 focus:opacity-100"
                      aria-label={`Delete ${label.name} label`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </PopoverContent>
            </Popover>
          )}

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
                    
                    <Popover open={labelMenuOpen} onOpenChange={setLabelMenuOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 justify-start gap-0 bg-white text-sm font-normal"
                        >
                          <Tags className="mr-2 h-4 w-4 text-[#F3793A]" />
                          {newTaskLabelId === "none"
                            ? "Add label"
                            : labels.find(label => label.id === newTaskLabelId)?.name || "Add label"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-64 p-2">
                        <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Add label
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setNewTaskLabelId("none");
                            setLabelMenuOpen(false);
                          }}
                          className="w-full rounded px-2 py-2 text-left text-sm hover:bg-orange-50"
                        >
                          No label
                        </button>
                        {labels.map(label => (
                          <button
                            key={label.id}
                            type="button"
                            onClick={() => {
                              setNewTaskLabelId(label.id);
                              setLabelMenuOpen(false);
                            }}
                            className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm hover:bg-orange-50"
                          >
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: label.color }} />
                            {label.name}
                            {newTaskLabelId === label.id && <Check className="ml-auto h-4 w-4 text-[#147E50]" />}
                          </button>
                        ))}
                        <div className="mt-2 border-t pt-2">
                          <p className="px-2 pb-2 text-xs font-medium text-muted-foreground">
                            Create new label
                          </p>
                          <div className="flex gap-2">
                            <span
                              className="h-6 w-6 shrink-0 self-center rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: newLabelColor }}
                              aria-label={`Selected label color ${newLabelColor}`}
                              role="img"
                            />
                            <Input
                              value={newLabelName}
                              onChange={(event) => setNewLabelName(event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  const label = addLabel(newLabelName, newLabelColor);
                                  if (label) {
                                    setNewTaskLabelId(label.id);
                                    setNewLabelName("");
                                    setNewLabelColor("#F3793A");
                                    setLabelMenuOpen(false);
                                  }
                                }
                              }}
                              placeholder="Label name"
                              className="h-8"
                            />
                            <Button
                              type="button"
                              size="sm"
                              className="btn-primary h-8 px-3"
                              disabled={!newLabelName.trim()}
                              onClick={() => {
                                const label = addLabel(newLabelName, newLabelColor);
                                if (label) {
                                  setNewTaskLabelId(label.id);
                                  setNewLabelName("");
                                  setNewLabelColor("#F3793A");
                                  setLabelMenuOpen(false);
                                }
                              }}
                            >
                              Create
                            </Button>
                          </div>
                          <div className="mt-2 flex items-center gap-1.5 px-1">
                            {LABEL_COLORS.map(color => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => setNewLabelColor(color)}
                                className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
                                  newLabelColor.toLowerCase() === color.toLowerCase()
                                    ? "border-[#41210A] ring-1 ring-white"
                                    : "border-white"
                                }`}
                                style={{ backgroundColor: color }}
                                aria-label={`Use ${color}`}
                                aria-pressed={newLabelColor.toLowerCase() === color.toLowerCase()}
                              />
                            ))}
                            <label
                              className="relative flex h-6 w-6 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110"
                              style={{ backgroundColor: newLabelColor }}
                              title="Choose a custom color"
                            >
                              <Pipette className="h-3.5 w-3.5 text-white drop-shadow" aria-hidden="true" />
                              <span className="sr-only">Choose a custom label color</span>
                              <input
                                type="color"
                                value={newLabelColor}
                                onChange={(event) => setNewLabelColor(event.target.value)}
                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                aria-label="Choose a custom label color"
                              />
                            </label>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-3">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelAddTask}
                  className="h-8 px-3 text-xs"
                >
                  <X className="w-3 h-3" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddTask}
                  className="h-8 px-3 text-xs btn-primary"
                >
                  <Check className="w-3 h-3" />
                  Add Task
                </Button>
              </div>
            </div>
          )}

          {/* Active Task List */}
          <div className="space-y-3">
            {filteredActiveTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <List className="h-12 w-12 mx-auto mb-3 text-orange-300" />
                <p className="text-muted-custom">
                  {activeTasks.length === 0 ? "No active tasks yet. Add your first task above!" : "No tasks match this label."}
                </p>
              </div>
            ) : (
              filteredActiveTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isSelected={selectedTaskId === task.id}
                  onSelect={() => handleSelectTask(task.id)}
                  onUpdate={updateTask}
                  onDelete={deleteTask}
                  onToggleComplete={toggleTaskCompletion}
                  labels={labels}
                  onAddLabel={addLabel}
                />
              ))
            )}
          </div>

          {/* Start Session Button */}
          <div className="pt-6 border-t border-orange-200">
            <Button
              onClick={() => onStartSession(selectedTaskId || undefined)}
              className="btn-primary h-[46px] w-full rounded-[10px] py-0 text-base font-semibold"
              disabled={activeTasks.length === 0}
            >
              <Clock className="h-5 w-5" />
              <span className="ml-2">Start setting up session</span>
            </Button>
          </div>

          {/* Completed Tasks Section */}
          {filteredCompletedTasks.length > 0 && (
            <div className="pt-6 border-t border-orange-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-heading-custom">Completed Tasks</h4>
                <Badge variant="outline" className="text-[#147E50] border-[#147E50] bg-green-50">
                  {filteredCompletedTasks.length} completed
                </Badge>
              </div>
              <div className="space-y-2">
                {filteredCompletedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleTaskCompletion(task.id)}
                        className="task-check-button w-5 h-5 rounded-full flex-shrink-0 transition-colors"
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
                      <div>
                        <span className="text-muted-custom line-through text-sm">{task.text}</span>
                        {task.labelId && labels.find(label => label.id === task.labelId) && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {labels.find(label => label.id === task.labelId)?.name}
                          </Badge>
                        )}
                      </div>
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
          </CardContent>
      </Card>
    </div>

    {/* Calendar and Tips Section - Fixed width */}
    <div className="flex flex-col space-y-6 lg:w-[330px] lg:flex-shrink-0 w-full">
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
            className="display-calendar rounded-md border-0"
            classNames={{
              day_today:
                "bg-accent text-accent-foreground ring-2 ring-[#F3793A] ring-offset-2 ring-offset-background",
            }}
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
            <div className="w-6 h-6 bg-[#147E50] bg-opacity-20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 dark:bg-emerald-500/35">
              <Clock className="h-5 w-5 text-[#147E50] dark:text-emerald-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-heading-custom">Turn on Focus Mode</p>
              <p className="text-xs text-muted-custom">Disable notifications and distractions</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-[#F3793A] bg-opacity-20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 dark:bg-orange-500/40">
              <Coffee className="h-5 w-5 text-[#F3793A] dark:text-orange-200" />
            </div>
            <div>
              <p className="text-sm font-medium text-heading-custom">Prepare Your Drink</p>
              <p className="text-xs text-muted-custom">Have water or coffee ready</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
              <Headphones className="h-5 w-5 text-yellow-600 dark:text-yellow-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-heading-custom">Use Background Music</p>
              <p className="text-xs text-muted-custom">Choose instrumental or nature sounds</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-sky-500/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
              <BroomIcon className="h-5 w-5 text-sky-700 dark:text-sky-300" />
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
