import { sql } from "drizzle-orm";
import { text, varchar, timestamp, pgTable, jsonb } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { nanoid } from "@/lib/utils";

export const resources = pgTable("resources", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  content: text("content").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});

// Schema for resources - used to validate API requests
export const insertResourceSchema = createSelectSchema(resources)
  .extend({
    metadata: z.record(z.unknown()).optional(),
  })
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

// Type for resources
export type NewResourceParams = z.infer<typeof insertResourceSchema>;