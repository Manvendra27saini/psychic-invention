import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const transcripts = pgTable("transcripts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  fileName: text("file_name"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const summaries = pgTable("summaries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transcriptId: varchar("transcript_id").references(() => transcripts.id).notNull(),
  customPrompt: text("custom_prompt").notNull(),
  generatedSummary: text("generated_summary").notNull(),
  editedSummary: text("edited_summary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const emailLogs = pgTable("email_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  summaryId: varchar("summary_id").references(() => summaries.id).notNull(),
  recipients: jsonb("recipients").$type<string[]>().notNull(),
  subject: text("subject").notNull(),
  message: text("message"),
  includeOriginal: boolean("include_original").default(false).notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  status: text("status").notNull().default("sent"),
});

// Insert schemas
export const insertTranscriptSchema = createInsertSchema(transcripts).omit({
  id: true,
  uploadedAt: true,
});

export const insertSummarySchema = createInsertSchema(summaries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmailLogSchema = createInsertSchema(emailLogs).omit({
  id: true,
  sentAt: true,
  status: true,
});

export const updateSummarySchema = z.object({
  editedSummary: z.string().min(1),
});

// Types
export type InsertTranscript = z.infer<typeof insertTranscriptSchema>;
export type Transcript = typeof transcripts.$inferSelect;

export type InsertSummary = z.infer<typeof insertSummarySchema>;
export type Summary = typeof summaries.$inferSelect;

export type InsertEmailLog = z.infer<typeof insertEmailLogSchema>;
export type EmailLog = typeof emailLogs.$inferSelect;

export type UpdateSummary = z.infer<typeof updateSummarySchema>;
