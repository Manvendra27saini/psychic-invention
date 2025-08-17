import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import {
  type Transcript,
  type Summary,
  type EmailLog,
  type InsertTranscript,
  type InsertSummary,
  type InsertEmailLog,
  type UpdateSummary,
} from "@shared/schema";

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.DATABASE_URL || "", {
        dbName: "meeting_notes_ai"
      });
      console.log("MongoDB connected successfully");
    }
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

// MongoDB Schemas
const transcriptSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  content: { type: String, required: true },
  fileName: { type: String },
  uploadedAt: { type: Date, default: Date.now }
});

const summarySchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  transcriptId: { type: String, required: true },
  customPrompt: { type: String, required: true },
  generatedSummary: { type: String, required: true },
  editedSummary: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const emailLogSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  summaryId: { type: String, required: true },
  recipients: [{ type: String, required: true }],
  subject: { type: String, required: true },
  message: { type: String },
  includeOriginal: { type: Boolean, default: false },
  sentAt: { type: Date, default: Date.now },
  status: { type: String, default: "sent" }
});

// Models
const TranscriptModel = mongoose.model("Transcript", transcriptSchema);
const SummaryModel = mongoose.model("Summary", summarySchema);
const EmailLogModel = mongoose.model("EmailLog", emailLogSchema);

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

export class MongoDBStorage implements IStorage {
  constructor() {
    connectDB();
  }

  async createTranscript(insertTranscript: InsertTranscript): Promise<Transcript> {
    const transcript = new TranscriptModel({
      id: uuidv4(),
      ...insertTranscript,
    });
    
    const saved = await transcript.save();
    return {
      id: saved.id,
      content: saved.content,
      fileName: saved.fileName || undefined,
      uploadedAt: saved.uploadedAt,
    };
  }

  async getTranscript(id: string): Promise<Transcript | undefined> {
    const transcript = await TranscriptModel.findOne({ id });
    if (!transcript) return undefined;
    
    return {
      id: transcript.id,
      content: transcript.content,
      fileName: transcript.fileName || undefined,
      uploadedAt: transcript.uploadedAt,
    };
  }

  async createSummary(insertSummary: InsertSummary): Promise<Summary> {
    const summary = new SummaryModel({
      id: uuidv4(),
      ...insertSummary,
    });
    
    const saved = await summary.save();
    return {
      id: saved.id,
      transcriptId: saved.transcriptId,
      customPrompt: saved.customPrompt,
      generatedSummary: saved.generatedSummary,
      editedSummary: saved.editedSummary || undefined,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }

  async getSummary(id: string): Promise<Summary | undefined> {
    const summary = await SummaryModel.findOne({ id });
    if (!summary) return undefined;
    
    return {
      id: summary.id,
      transcriptId: summary.transcriptId,
      customPrompt: summary.customPrompt,
      generatedSummary: summary.generatedSummary,
      editedSummary: summary.editedSummary || undefined,
      createdAt: summary.createdAt,
      updatedAt: summary.updatedAt,
    };
  }

  async getSummaryWithTranscript(id: string): Promise<(Summary & { transcript: Transcript }) | undefined> {
    const summary = await this.getSummary(id);
    if (!summary) return undefined;
    
    const transcript = await this.getTranscript(summary.transcriptId);
    if (!transcript) return undefined;
    
    return {
      ...summary,
      transcript,
    };
  }

  async updateSummary(id: string, update: UpdateSummary): Promise<Summary | undefined> {
    const summary = await SummaryModel.findOneAndUpdate(
      { id },
      { ...update, updatedAt: new Date() },
      { new: true }
    );
    
    if (!summary) return undefined;
    
    return {
      id: summary.id,
      transcriptId: summary.transcriptId,
      customPrompt: summary.customPrompt,
      generatedSummary: summary.generatedSummary,
      editedSummary: summary.editedSummary || undefined,
      createdAt: summary.createdAt,
      updatedAt: summary.updatedAt,
    };
  }

  async createEmailLog(insertEmailLog: InsertEmailLog): Promise<EmailLog> {
    const emailLog = new EmailLogModel({
      id: uuidv4(),
      ...insertEmailLog,
    });
    
    const saved = await emailLog.save();
    return {
      id: saved.id,
      summaryId: saved.summaryId,
      recipients: saved.recipients,
      subject: saved.subject,
      message: saved.message || undefined,
      includeOriginal: saved.includeOriginal,
      sentAt: saved.sentAt,
      status: saved.status,
    };
  }

  async getEmailLogsBySummary(summaryId: string): Promise<EmailLog[]> {
    const logs = await EmailLogModel.find({ summaryId });
    return logs.map(log => ({
      id: log.id,
      summaryId: log.summaryId,
      recipients: log.recipients,
      subject: log.subject,
      message: log.message || undefined,
      includeOriginal: log.includeOriginal,
      sentAt: log.sentAt,
      status: log.status,
    }));
  }
}

// In-memory storage for immediate testing while MongoDB connection issues are resolved
class InMemoryStorage implements IStorage {
  private transcripts: Map<string, Transcript> = new Map();
  private summaries: Map<string, Summary> = new Map();
  private emailLogs: Map<string, EmailLog[]> = new Map();

  async createTranscript(insertTranscript: InsertTranscript): Promise<Transcript> {
    const transcript: Transcript = {
      id: uuidv4(),
      ...insertTranscript,
      uploadedAt: new Date(),
    };
    this.transcripts.set(transcript.id, transcript);
    return transcript;
  }

  async getTranscript(id: string): Promise<Transcript | undefined> {
    return this.transcripts.get(id);
  }

  async createSummary(insertSummary: InsertSummary): Promise<Summary> {
    const summary: Summary = {
      id: uuidv4(),
      ...insertSummary,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.summaries.set(summary.id, summary);
    return summary;
  }

  async getSummary(id: string): Promise<Summary | undefined> {
    return this.summaries.get(id);
  }

  async getSummaryWithTranscript(id: string): Promise<(Summary & { transcript: Transcript }) | undefined> {
    const summary = this.summaries.get(id);
    if (!summary) return undefined;
    
    const transcript = this.transcripts.get(summary.transcriptId);
    if (!transcript) return undefined;
    
    return { ...summary, transcript };
  }

  async updateSummary(id: string, update: UpdateSummary): Promise<Summary | undefined> {
    const summary = this.summaries.get(id);
    if (!summary) return undefined;
    
    const updated = {
      ...summary,
      ...update,
      updatedAt: new Date(),
    };
    this.summaries.set(id, updated);
    return updated;
  }

  async createEmailLog(insertEmailLog: InsertEmailLog): Promise<EmailLog> {
    const emailLog: EmailLog = {
      id: uuidv4(),
      ...insertEmailLog,
      sentAt: new Date(),
      status: "sent",
    };
    
    const logs = this.emailLogs.get(insertEmailLog.summaryId) || [];
    logs.push(emailLog);
    this.emailLogs.set(insertEmailLog.summaryId, logs);
    
    return emailLog;
  }

  async getEmailLogsBySummary(summaryId: string): Promise<EmailLog[]> {
    return this.emailLogs.get(summaryId) || [];
  }
}

// Use in-memory storage for now to demonstrate functionality
// Switch back to MongoDB when connection is stable
export const storage = new InMemoryStorage();
