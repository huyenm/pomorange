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
    const tasks = this.getTasks();
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    this.saveTasks(updatedTasks);
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
    today.setHours(0, 0, 0, 0);
    
    const todaysRecords = records.filter(record => {
      const recordDate = new Date(record.startTimestamp);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === today.getTime();
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
