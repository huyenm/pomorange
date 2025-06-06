import { z } from "zod";

// Task schema
export const taskSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "Task text is required"),
  createdAt: z.date(),
});

export type Task = z.infer<typeof taskSchema>;

// Session record schema
export const sessionRecordSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  taskName: z.string(),
  startTimestamp: z.date(),
  endTimestamp: z.date(),
  plannedMinutes: z.number().min(1),
  actualMinutes: z.number().min(0),
  actualFinishedEarly: z.boolean(),
  breakDuration: z.number().min(1),
  completed: z.boolean(),
});

export type SessionRecord = z.infer<typeof sessionRecordSchema>;

// Session setup schema
export const sessionSetupSchema = z.object({
  taskId: z.string().min(1, "Please select a task"),
  focusDuration: z.number().min(1).max(120),
  breakDuration: z.number().min(1).max(60),
});

export type SessionSetup = z.infer<typeof sessionSetupSchema>;

// Timer state schema
export const timerStateSchema = z.object({
  isRunning: z.boolean(),
  isPaused: z.boolean(),
  sessionType: z.enum(["focus", "break"]),
  timeRemaining: z.number(),
  totalTime: z.number(),
  startTime: z.date().nullable(),
  finishTime: z.date().nullable(),
});

export type TimerState = z.infer<typeof timerStateSchema>;
