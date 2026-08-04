import { users, tasks, sessionRecords, type User, type InsertUser, type DatabaseTask, type InsertTask, type DatabaseSessionRecord, type InsertSessionRecord } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";


// Storage interface for all data operations
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Task operations
  getTasks(userId: number): Promise<DatabaseTask[]>;
  createTask(task: InsertTask): Promise<DatabaseTask>;
  updateTask(id: number, updates: Partial<InsertTask>): Promise<DatabaseTask | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Session record operations
  getSessionRecords(userId: number): Promise<DatabaseSessionRecord[]>;
  createSessionRecord(record: InsertSessionRecord): Promise<DatabaseSessionRecord>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getTasks(userId: number): Promise<DatabaseTask[]> {
    return await db.select().from(tasks).where(eq(tasks.userId, userId));
  }

  async createTask(task: InsertTask): Promise<DatabaseTask> {
    const [newTask] = await db
      .insert(tasks)
      .values(task)
      .returning();
    return newTask;
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<DatabaseTask | undefined> {
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

  async getSessionRecords(userId: number): Promise<DatabaseSessionRecord[]> {
    return await db.select().from(sessionRecords).where(eq(sessionRecords.userId, userId));
  }

  async createSessionRecord(record: InsertSessionRecord): Promise<DatabaseSessionRecord> {
    const [newRecord] = await db
      .insert(sessionRecords)
      .values(record)
      .returning();
    return newRecord;
  }
}

export const storage = new DatabaseStorage();
