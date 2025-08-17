import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download, Save } from "lucide-react";
import type { Summary } from "@shared/schema";

interface SummaryDisplayProps {
  summary: Summary;
  onSummaryUpdated: (summary: Summary) => void;
}

export default function SummaryDisplay({ summary, onSummaryUpdated }: SummaryDisplayProps) {
  const [editedContent, setEditedContent] = useState(summary.editedSummary || summary.generatedSummary);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const currentContent = summary.editedSummary || summary.generatedSummary;
    if (editedContent !== currentContent) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [editedContent, summary]);

  const updateMutation = useMutation({
    mutationFn: async (editedSummary: string) => {
      const res = await apiRequest("PATCH", `/api/summaries/${summary.id}`, {
        editedSummary,
      });
      return res.json();
    },
    onSuccess: (data: Summary) => {
      onSummaryUpdated(data);
      setHasChanges(false);
      toast({
        title: "Success",
        description: "Summary updated successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (editedContent.trim()) {
      updateMutation.mutate(editedContent.trim());
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedContent);
      toast({
        title: "Copied",
        description: "Summary copied to clipboard!",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([editedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meeting-summary.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: "Summary downloaded successfully!",
    });
  };

  const wordCount = editedContent.trim().split(/\s+/).length;

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">4. Generated Summary</h2>
        <div className="flex space-x-2">
          {hasChanges && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              <Save className="w-3 h-3 mr-1" />
              {updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
          >
            <Copy className="w-3 h-3 mr-1" />
            Copy
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownload}
          >
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>
        </div>
      </div>
      
      {/* Editable Summary */}
      <div className="border border-gray-200 rounded-md">
        <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
          <p className="text-xs text-gray-600">Summary is editable - click to modify</p>
        </div>
        <textarea
          className="w-full p-4 min-h-48 resize-vertical border-0 focus:ring-2 focus:ring-blue-500 focus:ring-inset focus:outline-none"
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          placeholder="Your summary will appear here..."
        />
      </div>
      
      {/* Summary Stats */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>
          Generated on {new Date(summary.createdAt).toLocaleDateString()} at {new Date(summary.createdAt).toLocaleTimeString()}
        </span>
        <span>Word count: {wordCount}</span>
      </div>
    </section>
  );
}
