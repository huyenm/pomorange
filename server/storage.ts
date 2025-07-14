import { users, tasks, sessionRecords, type User, type UpsertUser, type Task, type InsertTask, type SessionRecord, type InsertSessionRecord } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Storage interface for all data operations
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Task operations
  getTasks(userId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Session record operations
  getSessionRecords(userId: string): Promise<SessionRecord[]>;
  createSessionRecord(record: InsertSessionRecord): Promise<SessionRecord>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getTasks(userId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.userId, userId));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db
      .insert(tasks)
      .values(task)
      .returning();
    return newTask;
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask || undefined;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getSessionRecords(userId: string): Promise<SessionRecord[]> {
    return await db.select().from(sessionRecords).where(eq(sessionRecords.userId, userId));
  }

  async createSessionRecord(record: InsertSessionRecord): Promise<SessionRecord> {
    const [newRecord] = await db
      .insert(sessionRecords)
      .values(record)
      .returning();
    return newRecord;
  }
}

export const storage = new DatabaseStorage();
