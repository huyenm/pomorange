import { z } from "zod";
import { pgTable, serial, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

// Drizzle table definitions
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  text: text("text").notNull(),
  notes: text("notes").default(""),
  tags: text("tags").array().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completed: boolean("completed").default(false).notNull(),
});

export const sessionRecords = pgTable("session_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  taskId: integer("task_id").references(() => tasks.id),
  taskName: text("task_name").notNull(),
  startTimestamp: timestamp("start_timestamp").notNull(),
  endTimestamp: timestamp("end_timestamp").notNull(),
  plannedMinutes: integer("planned_minutes").notNull(),
  actualMinutes: integer("actual_minutes").notNull(),
  actualFinishedEarly: boolean("actual_finished_early").notNull(),
  breakDuration: integer("break_duration").notNull(),
  completed: boolean("completed").notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
  sessionRecords: many(sessionRecords),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
  sessionRecords: many(sessionRecords),
}));

export const sessionRecordsRelations = relations(sessionRecords, ({ one }) => ({
  user: one(users, {
    fields: [sessionRecords.userId],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [sessionRecords.taskId],
    references: [tasks.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true });
export const insertSessionRecordSchema = createInsertSchema(sessionRecords).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type DatabaseTask = typeof tasks.$inferSelect;
export type Task = Omit<DatabaseTask, "id" | "userId"> & {
  id: string;
  labelId?: string | null;
  completedAt?: Date | null;
};
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type DatabaseSessionRecord = typeof sessionRecords.$inferSelect;
export type SessionRecord = Omit<DatabaseSessionRecord, "id" | "taskId" | "userId"> & {
  id: string;
  taskId: string;
};
export type InsertSessionRecord = z.infer<typeof insertSessionRecordSchema>;

export type TaskLabel = {
  id: string;
  name: string;
  color: string;
};

// Zod schemas (keeping existing ones for frontend validation, but renamed to avoid conflicts)
export const taskFormSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  text: z.string().min(1, "Task text is required"),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  labelId: z.string().nullable().optional(),
  createdAt: z.date().optional(),
  completed: z.boolean().default(false),
  completedAt: z.date().nullable().optional(),
});

// Session record schema for frontend forms
export const sessionRecordFormSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  taskId: z.union([z.string(), z.number()]),
  taskName: z.string(),
  startTimestamp: z.date(),
  endTimestamp: z.date(),
  plannedMinutes: z.number().min(1),
  actualMinutes: z.number().min(0),
  actualFinishedEarly: z.boolean(),
  breakDuration: z.number().min(1),
  completed: z.boolean(),
});

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
