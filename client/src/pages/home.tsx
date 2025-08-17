import { useState } from "react";
import TranscriptUpload from "@/components/transcript-upload";
import CustomInstructions from "@/components/custom-instructions";
import SummaryGenerator from "@/components/summary-generator";
import SummaryDisplay from "@/components/summary-display";
import EmailSharing from "@/components/email-sharing";
import type { Transcript, Summary } from "@shared/schema";

export default function Home() {
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [summary, setSummary] = useState<Summary | null>(null);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">AI Meeting Notes Summarizer</h1>
          <p className="text-sm text-gray-600 mt-1">Upload transcripts, add custom instructions, and generate AI-powered summaries</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Transcript Upload Section */}
        <TranscriptUpload 
          onTranscriptUploaded={setTranscript}
          transcript={transcript}
        />

        {/* Custom Instructions Section */}
        <CustomInstructions 
          customPrompt={customPrompt}
          onPromptChange={setCustomPrompt}
        />

        {/* Generate Summary Section */}
        <SummaryGenerator
          transcript={transcript}
          customPrompt={customPrompt}
          onSummaryGenerated={setSummary}
        />

        {/* Summary Display Section */}
        {summary && (
          <SummaryDisplay
            summary={summary}
            onSummaryUpdated={setSummary}
          />
        )}

        {/* Email Sharing Section */}
        {summary && (
          <EmailSharing summary={summary} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-500">
            AI Meeting Notes Summarizer - Powered by Groq API
          </p>
        </div>
      </footer>
    </div>
  );
}
