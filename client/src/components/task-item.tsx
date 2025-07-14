import { useState, useRef, useEffect } from "react";
import { Check, X, Edit3, Trash2, Hash, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Task } from "@shared/schema";

interface TaskItemProps {
  task: Task;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (id: string, updates: Partial<Pick<Task, 'text' | 'notes' | 'tags'>>) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

export function TaskItem({ 
  task, 
  isSelected, 
  onSelect, 
  onUpdate, 
  onDelete, 
  onToggleComplete 
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [editNotes, setEditNotes] = useState(task.notes || "");
  const [editTags, setEditTags] = useState(task.tags?.join(", ") || "");
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
      const newTags = editTags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      onUpdate(task.id, {
        text: editText.trim(),
        notes: editNotes.trim(),
        tags: newTags,
      });
      setIsEditing(false);
      setShowDetails(false);
    }
  };

  const handleCancelEdit = () => {
    setEditText(task.text);
    setEditNotes(task.notes || "");
    setEditTags(task.tags?.join(", ") || "");
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

  const renderTags = (tags: string[]) => {
    return tags.map((tag, index) => (
      <Badge key={index} variant="secondary" className="text-xs">
        #{tag}
      </Badge>
    ));
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
              
              {/* Tags Section */}
              <Input
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="Add Tags (comma separated)"
                className="text-sm text-blue-500 border-none p-0 focus:ring-0 bg-transparent focus:bg-transparent outline-none focus:outline-none editing-input h-6"
              />
            </div>
          </div>
        </div>
        
        {/* Edit Actions */}
        <div className="flex justify-end space-x-2 pt-1">
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
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(task.id);
          }}
          className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-colors ${
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
        
        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className={`text-base font-medium ${task.completed ? "line-through text-gray-500" : "text-gray-900"}`}>
            {task.text}
          </div>
          
          {/* Show notes and tags when selected or when they exist */}
          {(showDetails || (task.notes && task.notes.length > 0) || (task.tags && task.tags.length > 0)) && (
            <div className="mt-2 space-y-2">
              {task.notes && task.notes.length > 0 && (
                <div className="text-sm text-gray-600">
                  {task.notes}
                </div>
              )}
              
              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {renderTags(task.tags)}
                </div>
              )}
            </div>
          )}
          
          {/* Always show notes and tags placeholders when selected but empty */}
          {showDetails && (!task.notes || task.notes.length === 0) && (
            <div className="mt-2 text-sm text-gray-400">Notes</div>
          )}
          
          {showDetails && (!task.tags || task.tags.length === 0) && (
            <div className="mt-1 text-sm text-gray-400">Add Tags</div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!task.completed && (
            <Button
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
                setShowDetails(true);
              }}
              className="text-gray-500 hover:text-blue-600 w-9 h-9 p-0"
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
            className="text-slate-400 hover:text-red-500 w-9 h-9 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}