import { Task, SessionRecord } from "@shared/schema";

const TASKS_KEY = "pomodoro_tasks";
const RECORDS_KEY = "pomodoro_records";

export const storage = {
  // Tasks
  getTasks(): Task[] {
    try {
      const stored = localStorage.getItem(TASKS_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return parsed.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
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

  addTask(text: string): Task {
    const newTask: Task = {
      id: crypto.randomUUID(),
      text,
      createdAt: new Date(),
      completed: false,
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

  toggleTaskCompletion(id: string): void {
    try {
      const tasks = this.getTasks();
      console.log("Debug - Storage: Current tasks before toggle:", tasks);
      console.log("Debug - Storage: Toggling task with ID:", id);
      
      const updatedTasks = tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      );
      console.log("Debug - Storage: Tasks after toggle:", updatedTasks);
      
      this.saveTasks(updatedTasks);
      console.log("Debug - Storage: Tasks saved to localStorage");
      
      // Verify the save worked
      const verifyTasks = this.getTasks();
      console.log("Debug - Storage: Verification read from localStorage:", verifyTasks);
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
