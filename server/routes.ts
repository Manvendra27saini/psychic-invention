import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { z } from "zod";
import { storage } from "./storage";
import { generateSummary } from "./services/groq";
import { sendSummaryEmail } from "./services/email";
import {
  insertTranscriptSchema,
  insertSummarySchema,
  insertEmailLogSchema,
  updateSummarySchema,
} from "@shared/schema";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only TXT, PDF, and DOCX files are allowed.'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Upload transcript endpoint
  app.post("/api/transcripts", upload.single('file'), async (req, res) => {
    try {
      let content: string;
      let fileName: string | undefined;

      if (req.file) {
        // Handle file upload
        fileName = req.file.originalname;
        if (req.file.mimetype === 'text/plain') {
          content = req.file.buffer.toString('utf-8');
        } else {
          // For now, only support plain text files
          // In production, you'd want to add PDF and DOCX parsing
          return res.status(400).json({ message: "Only plain text files are currently supported" });
        }
      } else if (req.body.content) {
        // Handle direct text input
        content = req.body.content;
      } else {
        return res.status(400).json({ message: "Either file or content is required" });
      }

      if (!content.trim()) {
        return res.status(400).json({ message: "Transcript content cannot be empty" });
      }

      const transcriptData = insertTranscriptSchema.parse({
        content: content.trim(),
        fileName,
      });

      const transcript = await storage.createTranscript(transcriptData);
      res.json(transcript);
    } catch (error) {
      console.error("Error uploading transcript:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transcript data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to upload transcript" });
    }
  });

  // Get transcript endpoint
  app.get("/api/transcripts/:id", async (req, res) => {
    try {
      const transcript = await storage.getTranscript(req.params.id);
      if (!transcript) {
        return res.status(404).json({ message: "Transcript not found" });
      }
      res.json(transcript);
    } catch (error) {
      console.error("Error fetching transcript:", error);
      res.status(500).json({ message: "Failed to fetch transcript" });
    }
  });

  // Generate summary endpoint
  app.post("/api/summaries", async (req, res) => {
    try {
      const requestSchema = z.object({
        transcriptId: z.string(),
        customPrompt: z.string().min(1),
      });
      
      const { transcriptId, customPrompt } = requestSchema.parse(req.body);
      
      // Get the transcript
      const transcript = await storage.getTranscript(transcriptId);
      if (!transcript) {
        return res.status(404).json({ message: "Transcript not found" });
      }

      // Generate summary using Groq
      const generatedSummary = await generateSummary(
        transcript.content,
        customPrompt
      );

      const summary = await storage.createSummary({
        transcriptId,
        customPrompt,
        generatedSummary,
      });

      res.json(summary);
    } catch (error) {
      console.error("Error generating summary:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid summary data", errors: error.errors });
      }
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to generate summary" });
    }
  });

  // Get summary with transcript endpoint
  app.get("/api/summaries/:id", async (req, res) => {
    try {
      const summary = await storage.getSummaryWithTranscript(req.params.id);
      if (!summary) {
        return res.status(404).json({ message: "Summary not found" });
      }
      res.json(summary);
    } catch (error) {
      console.error("Error fetching summary:", error);
      res.status(500).json({ message: "Failed to fetch summary" });
    }
  });

  // Update summary endpoint
  app.patch("/api/summaries/:id", async (req, res) => {
    try {
      const updateData = updateSummarySchema.parse(req.body);
      const summary = await storage.updateSummary(req.params.id, updateData);
      if (!summary) {
        return res.status(404).json({ message: "Summary not found" });
      }
      res.json(summary);
    } catch (error) {
      console.error("Error updating summary:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid update data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update summary" });
    }
  });

  // Send email endpoint
  app.post("/api/summaries/:id/email", async (req, res) => {
    try {
      const emailSchema = z.object({
        recipients: z.array(z.string().email()).min(1),
        subject: z.string().min(1),
        message: z.string().optional(),
        includeOriginal: z.boolean().default(false),
      });

      const emailData = emailSchema.parse(req.body);
      
      // Get summary with transcript
      const summaryWithTranscript = await storage.getSummaryWithTranscript(req.params.id);
      if (!summaryWithTranscript) {
        return res.status(404).json({ message: "Summary not found" });
      }

      // Send email
      await sendSummaryEmail({
        recipients: emailData.recipients,
        subject: emailData.subject,
        message: emailData.message,
        summary: summaryWithTranscript,
        transcript: emailData.includeOriginal ? summaryWithTranscript.transcript : undefined,
        includeOriginal: emailData.includeOriginal,
      });

      // Log the email
      const emailLogData = insertEmailLogSchema.parse({
        summaryId: req.params.id,
        recipients: emailData.recipients,
        subject: emailData.subject,
        message: emailData.message,
        includeOriginal: emailData.includeOriginal,
      });

      await storage.createEmailLog(emailLogData);

      res.json({ message: "Email sent successfully", recipientCount: emailData.recipients.length });
    } catch (error) {
      console.error("Error sending email:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid email data", errors: error.errors });
      }
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to send email" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
