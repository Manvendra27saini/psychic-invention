import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import {
  type Transcript,
  type Summary,
  type EmailLog,
  type InsertTranscript,
  type InsertSummary,
  type InsertEmailLog,
  type UpdateSummary,
  transcripts,
  summaries,
  emailLogs,
} from "@shared/schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

export interface IStorage {
  // Transcript methods
  createTranscript(transcript: InsertTranscript): Promise<Transcript>;
  getTranscript(id: string): Promise<Transcript | undefined>;
  
  // Summary methods
  createSummary(summary: InsertSummary): Promise<Summary>;
  getSummary(id: string): Promise<Summary | undefined>;
  getSummaryWithTranscript(id: string): Promise<(Summary & { transcript: Transcript }) | undefined>;
  updateSummary(id: string, update: UpdateSummary): Promise<Summary | undefined>;
  
  // Email log methods
  createEmailLog(emailLog: InsertEmailLog): Promise<EmailLog>;
  getEmailLogsBySummary(summaryId: string): Promise<EmailLog[]>;
}

export class DatabaseStorage implements IStorage {
  async createTranscript(insertTranscript: InsertTranscript): Promise<Transcript> {
    const [transcript] = await db
      .insert(transcripts)
      .values(insertTranscript)
      .returning();
    return transcript;
  }

  async getTranscript(id: string): Promise<Transcript | undefined> {
    const [transcript] = await db
      .select()
      .from(transcripts)
      .where(eq(transcripts.id, id));
    return transcript;
  }

  async createSummary(insertSummary: InsertSummary): Promise<Summary> {
    const [summary] = await db
      .insert(summaries)
      .values(insertSummary)
      .returning();
    return summary;
  }

  async getSummary(id: string): Promise<Summary | undefined> {
    const [summary] = await db
      .select()
      .from(summaries)
      .where(eq(summaries.id, id));
    return summary;
  }

  async getSummaryWithTranscript(id: string): Promise<(Summary & { transcript: Transcript }) | undefined> {
    const [result] = await db
      .select({
        id: summaries.id,
        transcriptId: summaries.transcriptId,
        customPrompt: summaries.customPrompt,
        generatedSummary: summaries.generatedSummary,
        editedSummary: summaries.editedSummary,
        createdAt: summaries.createdAt,
        updatedAt: summaries.updatedAt,
        transcript: transcripts,
      })
      .from(summaries)
      .innerJoin(transcripts, eq(summaries.transcriptId, transcripts.id))
      .where(eq(summaries.id, id));
    return result;
  }

  async updateSummary(id: string, update: UpdateSummary): Promise<Summary | undefined> {
    const [summary] = await db
      .update(summaries)
      .set({ ...update, updatedAt: new Date() })
      .where(eq(summaries.id, id))
      .returning();
    return summary;
  }

  async createEmailLog(insertEmailLog: InsertEmailLog): Promise<EmailLog> {
    const [emailLog] = await db
      .insert(emailLogs)
      .values({
        ...insertEmailLog,
        recipients: insertEmailLog.recipients as any
      })
      .returning();
    return emailLog;
  }

  async getEmailLogsBySummary(summaryId: string): Promise<EmailLog[]> {
    return await db
      .select()
      .from(emailLogs)
      .where(eq(emailLogs.summaryId, summaryId));
  }
}

export const storage = new DatabaseStorage();
