import { useState, useEffect } from "react";
import { Task } from "@shared/schema";
import { storage } from "@/lib/storage";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTasks = () => {
      try {
        const storedTasks = storage.getTasks();
        setTasks(storedTasks);
      } catch (error) {
        console.error("Failed to load tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, []);

  const addTask = (text: string) => {
    try {
      const newTask = storage.addTask(text);
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (error) {
      console.error("Failed to add task:", error);
      throw error;
    }
  };

  const deleteTask = (id: string) => {
    try {
      storage.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (error) {
      console.error("Failed to delete task:", error);
      throw error;
    }
  };

  const toggleTaskCompletion = (id: string) => {
    try {
      storage.toggleTaskCompletion(id);
      
      // Reload tasks from storage to ensure consistency
      const updatedTasks = storage.getTasks();
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Failed to toggle task completion:", error);
      throw error;
    }
  };
  
  return {
    tasks,
    addTask,
    deleteTask,
    toggleTaskCompletion,
    isLoading,
  };
}
