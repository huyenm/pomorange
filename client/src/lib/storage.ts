import { Task, SessionRecord, TaskLabel } from "@shared/schema";

const TASKS_KEY = "pomodoro_tasks";
const RECORDS_KEY = "pomodoro_records";
const LABELS_KEY = "pomodoro_labels";

export const storage = {
  // Tasks
  getTasks(): Task[] {
    try {
      const stored = localStorage.getItem(TASKS_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return parsed.map((task: any) => ({
        ...task,
        notes: task.notes || "",
        tags: task.tags || [],
        labelId: task.labelId || null,
        createdAt: new Date(task.createdAt),
        completedAt: task.completedAt ? new Date(task.completedAt) : null,
      }));
    } catch (error) {
      console.error("Error reading tasks from storage:", error);
      return [];
    }
  },

  saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error("Error saving tasks to storage:", error);
    }
  },

  addTask(
    text: string,
    notes: string = "",
    tags: string[] = [],
    labelId: string | null = null,
  ): Task {
    const newTask: Task = {
      id: crypto.randomUUID(),
      text,
      notes,
      tags,
      labelId,
      createdAt: new Date(),
      completed: false,
      completedAt: null,
    };
    
    const tasks = this.getTasks();
    tasks.push(newTask);
    this.saveTasks(tasks);
    return newTask;
  },

  deleteTask(id: string): void {
    const tasks = this.getTasks().filter(task => task.id !== id);
    this.saveTasks(tasks);
  },

  updateTask(id: string, updates: Partial<Pick<Task, 'text' | 'notes' | 'tags' | 'labelId'>>): void {
    try {
      const tasks = this.getTasks();
      const updatedTasks = tasks.map(task => {
        if (task.id === id) {
          return { ...task, ...updates };
        }
        return task;
      });
      this.saveTasks(updatedTasks);
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  },

  // Labels
  getLabels(): TaskLabel[] {
    try {
      const stored = localStorage.getItem(LABELS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error reading labels from storage:", error);
      return [];
    }
  },

  saveLabels(labels: TaskLabel[]): void {
    localStorage.setItem(LABELS_KEY, JSON.stringify(labels));
  },

  addLabel(name: string, color: string): TaskLabel {
    const label = { id: crypto.randomUUID(), name, color };
    this.saveLabels([...this.getLabels(), label]);
    return label;
  },

  updateLabel(id: string, updates: Partial<Pick<TaskLabel, "name" | "color">>): void {
    this.saveLabels(
      this.getLabels().map(label =>
        label.id === id ? { ...label, ...updates } : label,
      ),
    );
  },

  deleteLabel(id: string): void {
    this.saveLabels(this.getLabels().filter(label => label.id !== id));
    this.saveTasks(
      this.getTasks().map(task =>
        task.labelId === id ? { ...task, labelId: null } : task,
      ),
    );
  },

  toggleTaskCompletion(id: string): void {
    try {
      const tasks = this.getTasks();
      
      const updatedTasks = tasks.map(task => {
        if (task.id === id) {
          const completed = !task.completed;
          return {
            ...task,
            completed,
            completedAt: completed ? new Date() : null,
          };
        }
        return task;
      });
      
      this.saveTasks(updatedTasks);
    } catch (error) {
      console.error("Error toggling task completion:", error);
      throw error;
    }
  },

  // Session Records
  getRecords(): SessionRecord[] {
    try {
      const stored = localStorage.getItem(RECORDS_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return parsed.map((record: any) => ({
        ...record,
        startTimestamp: new Date(record.startTimestamp),
        endTimestamp: new Date(record.endTimestamp),
      }));
    } catch (error) {
      console.error("Error reading records from storage:", error);
      return [];
    }
  },

  saveRecords(records: SessionRecord[]): void {
    try {
      localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    } catch (error) {
      console.error("Error saving records to storage:", error);
    }
  },

  addRecord(record: Omit<SessionRecord, "id">): SessionRecord {
    const newRecord: SessionRecord = {
      ...record,
      id: crypto.randomUUID(),
    };
    
    const records = this.getRecords();
    records.push(newRecord);
    this.saveRecords(records);
    return newRecord;
  },

  // Statistics
  getTodaysStats(): {
    totalSessions: number;
    totalFocusTime: number;
    completedTasks: number;
    averageSession: number;
  } {
    const records = this.getRecords();
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    
    const todaysRecords = records.filter(record => {
      const recordDate = new Date(record.startTimestamp);
      return recordDate >= todayStart && recordDate < todayEnd;
    });

    const totalSessions = todaysRecords.length;
    const totalFocusTime = todaysRecords.reduce((sum, record) => sum + record.actualMinutes, 0);
    const completedTasks = todaysRecords.filter(record => record.completed).length;
    const averageSession = totalSessions > 0 ? totalFocusTime / totalSessions : 0;

    return {
      totalSessions,
      totalFocusTime,
      completedTasks,
      averageSession,
    };
  },
};
