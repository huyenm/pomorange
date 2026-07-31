import { useState, useRef, useEffect } from "react";
import { Check, X, Trash2, Edit, Plus, Tags, Pipette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Task, TaskLabel } from "@shared/schema";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LABEL_COLORS } from "@/hooks/use-labels";

interface TaskItemProps {
  task: Task;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (id: string, updates: Partial<Pick<Task, 'text' | 'notes' | 'tags' | 'labelId'>>) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  labels: TaskLabel[];
  onAddLabel: (name: string, color?: string) => TaskLabel | null;
}

export function TaskItem({ 
  task, 
  isSelected, 
  onSelect, 
  onUpdate, 
  onDelete, 
  onToggleComplete,
  labels,
  onAddLabel,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [editNotes, setEditNotes] = useState(task.notes || "");
  const [editLabelId, setEditLabelId] = useState(task.labelId || "none");
  const [labelMenuOpen, setLabelMenuOpen] = useState(false);
  const [creatingLabel, setCreatingLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#F3793A");
  const [showDetails, setShowDetails] = useState(false);
  
  const textInputRef = useRef<HTMLInputElement>(null);
  const notesInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textInputRef.current) {
      textInputRef.current.focus();
      textInputRef.current.select();
    }
  }, [isEditing]);

  const handleSaveEdit = () => {
    if (editText.trim()) {
      onUpdate(task.id, {
        text: editText.trim(),
        notes: editNotes.trim(),
        labelId: editLabelId === "none" ? null : editLabelId,
      });
      setIsEditing(false);
      setShowDetails(false);
    }
  };

  const handleCancelEdit = () => {
    setEditText(task.text);
    setEditNotes(task.notes || "");
    setEditLabelId(task.labelId || "none");
    setIsEditing(false);
    setShowDetails(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleTaskClick = () => {
    if (!isEditing) {
      if (isSelected) {
        setShowDetails(!showDetails);
      } else {
        onSelect();
      }
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setShowDetails(true);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setShowDetails(true);
  };

  if (isEditing) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 min-h-[72px]">
        {/* Task Title Edit */}
        <div className="flex items-start space-x-3">
          <div 
            className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 ${
              task.completed 
                ? "" 
                : "border-gray-300 hover:border-orange-400"
            }`}
            style={task.completed ? { backgroundColor: 'rgb(20, 126, 80)', borderColor: 'rgb(20, 126, 80)' } : {}}
          >
            {task.completed && <Check className="w-3 h-3 text-white m-auto" />}
          </div>
          
          <div className="flex-1 space-y-2">
            <Input
              ref={textInputRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyPress}
              className="text-base border-none p-0 focus:ring-0 font-medium bg-transparent focus:bg-transparent outline-none focus:outline-none editing-input h-6"
              placeholder="Task title..."
            />
            
            {/* Notes Section */}
            <div className="space-y-1">
              <Textarea
                ref={notesInputRef}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Notes"
                className="text-sm text-gray-600 border-none p-0 resize-none focus:ring-0 min-h-6 bg-transparent focus:bg-transparent outline-none focus:outline-none editing-input overflow-hidden"
                rows={1}
              />
              
              <Popover open={labelMenuOpen} onOpenChange={setLabelMenuOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 w-full justify-start bg-white text-sm font-normal"
                  >
                    <Tags className="mr-2 h-4 w-4 text-[#F3793A]" />
                    {editLabelId === "none"
                      ? "Add label"
                      : labels.find(label => label.id === editLabelId)?.name || "Add label"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-64 p-2">
                  {!creatingLabel ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setEditLabelId("none");
                          setLabelMenuOpen(false);
                        }}
                        className="flex w-full items-center rounded px-2 py-2 text-left text-sm hover:bg-orange-50"
                      >
                        No label
                        {editLabelId === "none" && <Check className="ml-auto h-4 w-4 text-[#147E50]" />}
                      </button>
                      {labels.map(label => (
                        <button
                          key={label.id}
                          type="button"
                          onClick={() => {
                            setEditLabelId(label.id);
                            setLabelMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm hover:bg-orange-50"
                        >
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: label.color }} />
                          {label.name}
                          {editLabelId === label.id && <Check className="ml-auto h-4 w-4 text-[#147E50]" />}
                        </button>
                      ))}
                      <div className="mt-1 border-t p-1 pt-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-[#F3793A] hover:bg-orange-50"
                          onClick={() => setCreatingLabel(true)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add new label
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3 p-1">
                      <p className="text-sm font-medium text-[#41210A]">Create new label</p>
                      <div className="flex items-center gap-2">
                        <span
                          className="h-6 w-6 shrink-0 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: newLabelColor }}
                          aria-label={`Selected label color ${newLabelColor}`}
                          role="img"
                        />
                        <Input
                          value={newLabelName}
                          onChange={(event) => setNewLabelName(event.target.value)}
                          placeholder="Label name"
                          className="h-9"
                          autoFocus
                        />
                      </div>
                      <div className="flex items-center gap-2">
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
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCreatingLabel(false);
                            setNewLabelName("");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="btn-primary"
                          disabled={!newLabelName.trim()}
                          onClick={() => {
                            const label = onAddLabel(newLabelName, newLabelColor);
                            if (label) {
                              setEditLabelId(label.id);
                              setNewLabelName("");
                              setNewLabelColor("#F3793A");
                              setCreatingLabel(false);
                              setLabelMenuOpen(false);
                            }
                          }}
                        >
                          Create
                        </Button>
                      </div>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        
        {/* Edit Actions */}
        <div className="flex justify-end space-x-2 pt-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancelEdit}
            className="h-7 px-3 text-xs"
          >
            <X className="w-3 h-3" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSaveEdit}
            className="h-7 px-3 text-xs btn-primary"
          >
            <Check className="w-3 h-3" />
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`group border rounded-lg cursor-pointer transition-all duration-200 ${
        task.completed ? "p-4" : "p-4"
      } ${
        isSelected 
          ? "bg-orange-50 border-orange-200 shadow-sm" 
          : "bg-white border-gray-200 hover:border-orange-200 hover:shadow-sm"
      } ${task.completed ? "opacity-75" : ""}`}
      onClick={handleTaskClick}
      onDoubleClick={handleDoubleClick}
    >
      <div className="flex items-start space-x-3">
        {/* Completion Circle */}
        <div className="h-6 flex items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(task.id);
            }}
            className={`task-check-button w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${
              task.completed 
                ? "" 
                : "border-gray-300 hover:border-orange-400"
            }`}
            style={task.completed ? { backgroundColor: 'rgb(20, 126, 80)', borderColor: 'rgb(20, 126, 80)' } : {}}
            onMouseEnter={task.completed ? (e) => {
              e.currentTarget.style.backgroundColor = 'rgb(16, 100, 64)';
              e.currentTarget.style.borderColor = 'rgb(16, 100, 64)';
            } : undefined}
            onMouseLeave={task.completed ? (e) => {
              e.currentTarget.style.backgroundColor = 'rgb(20, 126, 80)';
              e.currentTarget.style.borderColor = 'rgb(20, 126, 80)';
            } : undefined}
          >
            {task.completed && <Check className="w-3 h-3 text-white m-auto" />}
          </button>
        </div>
        
        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="h-6 flex items-center">
            <div className={`text-base font-medium leading-5 ${task.completed ? "line-through text-gray-500" : "text-gray-900"}`}>
              {task.text}
            </div>
            {task.labelId && labels.find(label => label.id === task.labelId) && (
              <Badge
                variant="outline"
                className="ml-2 gap-1 text-xs"
                style={{
                  borderColor: labels.find(label => label.id === task.labelId)?.color,
                  color: labels.find(label => label.id === task.labelId)?.color,
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: labels.find(label => label.id === task.labelId)?.color }}
                />
                {labels.find(label => label.id === task.labelId)?.name}
              </Badge>
            )}
          </div>
          
          {/* Show notes when selected or when they exist */}
          {(showDetails || (task.notes && task.notes.length > 0)) && (
            <div className="mt-2 space-y-2">
              {task.notes && task.notes.length > 0 && (
                <div className="text-sm text-gray-600">
                  {task.notes}
                </div>
              )}
              
            </div>
          )}
          
          {/* Always show the notes placeholder when selected but empty */}
          {showDetails && (!task.notes || task.notes.length === 0) && (
            <div className="mt-2 text-sm text-gray-400">Notes</div>
          )}
          
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 items-center">
          {!task.completed && (
            <Button
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
                setShowDetails(true);
              }}
              className="text-gray-500 hover:text-blue-600 w-7 h-7 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="text-gray-500 hover:text-red-500 w-7 h-7 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
