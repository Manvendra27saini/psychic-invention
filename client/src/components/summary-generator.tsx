import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Loader2 } from "lucide-react";
import type { Transcript, Summary } from "@shared/schema";

interface SummaryGeneratorProps {
  transcript: Transcript | null;
  customPrompt: string;
  onSummaryGenerated: (summary: Summary) => void;
}

export default function SummaryGenerator({ transcript, customPrompt, onSummaryGenerated }: SummaryGeneratorProps) {
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!transcript || !customPrompt.trim()) {
        throw new Error("Transcript and custom prompt are required");
      }

      const res = await apiRequest("POST", "/api/summaries", {
        transcriptId: transcript.id,
        customPrompt: customPrompt.trim(),
      });
      return res.json();
    },
    onSuccess: (data: Summary) => {
      onSummaryGenerated(data);
      toast({
        title: "Success",
        description: "Summary generated successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const canGenerate = transcript && customPrompt.trim() && !generateMutation.isPending;

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">3. Generate Summary</h2>
      
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Ready to generate your AI-powered summary</p>
        <Button
          onClick={() => generateMutation.mutate()}
          disabled={!canGenerate}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {generateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {generateMutation.isPending ? "Generating..." : "Generate Summary"}
        </Button>
      </div>
      
      {/* Error message area */}
      {generateMutation.error && (
        <div className="mt-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">
                  {generateMutation.error.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Requirements message */}
      {(!transcript || !customPrompt.trim()) && (
        <div className="mt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-amber-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-amber-800">
                  Please upload a transcript and provide custom instructions before generating a summary.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
