import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, CheckCircle } from "lucide-react";
import type { Transcript } from "@shared/schema";

interface TranscriptUploadProps {
  onTranscriptUploaded: (transcript: Transcript) => void;
  transcript: Transcript | null;
}

export default function TranscriptUpload({ onTranscriptUploaded, transcript }: TranscriptUploadProps) {
  const [transcriptText, setTranscriptText] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (data: FormData | { content: string }) => {
      if (data instanceof FormData) {
        const res = await apiRequest("POST", "/api/transcripts", data);
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/transcripts", data);
        return res.json();
      }
    },
    onSuccess: (data: Transcript) => {
      onTranscriptUploaded(data);
      toast({
        title: "Success",
        description: data.fileName ? `${data.fileName} uploaded successfully` : "Transcript uploaded successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = useCallback((files: FileList) => {
    const file = files[0];
    if (!file) return;

    if (!file.type.includes('text/plain')) {
      toast({
        title: "Invalid File Type",
        description: "Only plain text files are currently supported.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File must be smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    uploadMutation.mutate(formData);
  }, [uploadMutation, toast]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  const handleTextUpload = () => {
    if (!transcriptText.trim()) {
      toast({
        title: "Empty Content",
        description: "Please enter some transcript text.",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate({ content: transcriptText });
  };

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Upload Transcript</h2>
      
      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          dragActive 
            ? "border-blue-400 bg-blue-50" 
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <div className="space-y-2">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="text-sm text-gray-600">
            <Label htmlFor="file-upload" className="cursor-pointer">
              <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span>
              <span> or drag and drop</span>
            </Label>
            <input
              id="file-upload"
              type="file"
              className="sr-only"
              accept=".txt"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              disabled={uploadMutation.isPending}
            />
          </div>
          <p className="text-xs text-gray-500">TXT files up to 10MB</p>
        </div>
      </div>

      {/* Success message for uploaded file */}
      {transcript && (
        <div className="mt-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  {transcript.fileName || "Transcript"} uploaded successfully
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Or Text Input */}
      <div className="mt-6">
        <div className="text-center mb-4">
          <span className="bg-gray-50 px-3 py-1 text-sm text-gray-500">OR</span>
        </div>
        <Label htmlFor="transcript-text" className="block text-sm font-medium text-gray-700 mb-2">
          Paste transcript text directly
        </Label>
        <Textarea
          id="transcript-text"
          rows={8}
          className="resize-vertical"
          placeholder="Paste your meeting transcript here..."
          value={transcriptText}
          onChange={(e) => setTranscriptText(e.target.value)}
          disabled={uploadMutation.isPending}
        />
        {transcriptText && (
          <Button
            onClick={handleTextUpload}
            disabled={uploadMutation.isPending || !transcriptText.trim()}
            className="mt-3"
          >
            {uploadMutation.isPending ? "Uploading..." : "Upload Text"}
          </Button>
        )}
      </div>
    </section>
  );
}
