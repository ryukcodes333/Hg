import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const commandsTable = pgTable("commands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  usage: text("usage").notNull(),
  category: text("category").notNull(),
  cooldown: integer("cooldown"),
  premium: boolean("premium").notNull().default(false),
});

export const insertCommandSchema = createInsertSchema(commandsTable).omit({ id: true });
export type InsertCommand = z.infer<typeof insertCommandSchema>;
export type Command = typeof commandsTable.$inferSelect;
