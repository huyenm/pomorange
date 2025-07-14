import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { Task } from '@shared/schema';
import { isUnauthorizedError } from '@/lib/authUtils';
import { useToast } from '@/hooks/use-toast';

export function useTasks() {
  const { toast } = useToast();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['/api/tasks'],
    retry: false,
  });

  const addTaskMutation = useMutation({
    mutationFn: async (taskData: { text: string; notes?: string; tags?: string[] }) => {
      return await apiRequest('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Task> }) => {
      return await apiRequest(`/api/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    },
  });

  const addTask = (text: string, notes: string = "", tags: string[] = []) => {
    addTaskMutation.mutate({ text, notes, tags });
  };

  const deleteTask = (id: string) => {
    deleteTaskMutation.mutate(parseInt(id));
  };

  const updateTask = (id: string, updates: Partial<Pick<Task, 'text' | 'notes' | 'tags'>>) => {
    updateTaskMutation.mutate({ id: parseInt(id), updates });
  };

  const toggleTaskCompletion = (id: string) => {
    const task = tasks.find((t: Task) => t.id.toString() === id);
    if (task) {
      updateTaskMutation.mutate({ 
        id: parseInt(id), 
        updates: { completed: !task.completed } 
      });
    }
  };

  return {
    tasks,
    addTask,
    deleteTask,
    updateTask,
    toggleTaskCompletion,
    isLoading,
  };
}
