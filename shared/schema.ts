
import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const pastes = pgTable("pastes", {
  id: text("id").primaryKey(), // We will generate short IDs manually
  content: text("content").notNull(),
  ttlSeconds: integer("ttl_seconds"),
  maxViews: integer("max_views"),
  views: integer("views").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"), // Nullable, calculated on creation
});

// Base schemas
export const insertPasteSchema = createInsertSchema(pastes)
  .pick({
    content: true,
    ttlSeconds: true,
    maxViews: true,
  })
  .extend({
    content: z.string().min(1, "Content cannot be empty"),
    ttlSeconds: z.number().int().min(1).optional(),
    maxViews: z.number().int().min(1).optional(),
  });

export type Paste = typeof pastes.$inferSelect;
export type InsertPaste = z.infer<typeof insertPasteSchema>;
