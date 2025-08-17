import { z } from "zod";

// MongoDB Schema definitions
export interface Transcript {
  _id?: string;
  id: string;
  content: string;
  fileName?: string;
  uploadedAt: Date;
}

export interface Summary {
  _id?: string;
  id: string;
  transcriptId: string;
  customPrompt: string;
  generatedSummary: string;
  editedSummary?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailLog {
  _id?: string;
  id: string;
  summaryId: string;
  recipients: string[];
  subject: string;
  message?: string;
  includeOriginal: boolean;
  sentAt: Date;
  status: string;
}

// Zod schemas for validation
export const insertTranscriptSchema = z.object({
  content: z.string().min(1),
  fileName: z.string().optional(),
});

export const insertSummarySchema = z.object({
  transcriptId: z.string(),
  customPrompt: z.string().min(1),
  generatedSummary: z.string().min(1),
});

export const insertEmailLogSchema = z.object({
  summaryId: z.string(),
  recipients: z.array(z.string().email()).min(1),
  subject: z.string().min(1),
  message: z.string().optional(),
  includeOriginal: z.boolean().default(false),
});

export const updateSummarySchema = z.object({
  editedSummary: z.string().min(1),
});

// Types
export type InsertTranscript = z.infer<typeof insertTranscriptSchema>;
export type InsertSummary = z.infer<typeof insertSummarySchema>;
export type InsertEmailLog = z.infer<typeof insertEmailLogSchema>;
export type UpdateSummary = z.infer<typeof updateSummarySchema>;
