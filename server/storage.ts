
import { db } from "./db";
import { pastes, type Paste, type InsertPaste } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { randomBytes } from "crypto";

export interface IStorage {
  createPaste(paste: InsertPaste): Promise<Paste>;
  getPaste(id: string): Promise<Paste | undefined>;
  incrementView(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Helper to generate short IDs
  private generateId(): string {
    return randomBytes(4).toString("hex"); // 8 chars
  }

  async createPaste(insertPaste: InsertPaste): Promise<Paste> {
    const id = this.generateId();
    const now = new Date();
    
    let expiresAt: Date | null = null;
    if (insertPaste.ttlSeconds) {
      expiresAt = new Date(now.getTime() + insertPaste.ttlSeconds * 1000);
    }

    const [paste] = await db
      .insert(pastes)
      .values({
        ...insertPaste,
        id,
        createdAt: now,
        expiresAt,
        views: 0,
      })
      .returning();
    return paste;
  }

  async getPaste(id: string): Promise<Paste | undefined> {
    const [paste] = await db.select().from(pastes).where(eq(pastes.id, id));
    return paste;
  }

  async incrementView(id: string): Promise<void> {
    await db
      .update(pastes)
      .set({ views: sql`${pastes.views} + 1` })
      .where(eq(pastes.id, id));
  }
}

export const storage = new DatabaseStorage();
