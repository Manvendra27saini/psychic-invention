import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface CustomInstructionsProps {
  customPrompt: string;
  onPromptChange: (prompt: string) => void;
}

const QUICK_PROMPTS = [
  {
    label: "Executive Summary",
    prompt: "Summarize in bullet points for executives",
  },
  {
    label: "Action Items Only",
    prompt: "Highlight only action items and deadlines",
  },
  {
    label: "Decisions & Next Steps",
    prompt: "Create key decisions and next steps",
  },
  {
    label: "Topics & Participants",
    prompt: "Extract main topics and participants",
  },
];

export default function CustomInstructions({ customPrompt, onPromptChange }: CustomInstructionsProps) {
  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">2. Custom Instructions</h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="custom-prompt" className="block text-sm font-medium text-gray-700 mb-2">
            How would you like the summary to be formatted?
          </Label>
          <Textarea
            id="custom-prompt"
            rows={3}
            placeholder="e.g., Summarize in bullet points for executives, Highlight only action items and deadlines, Create a brief overview with key decisions..."
            value={customPrompt}
            onChange={(e) => onPromptChange(e.target.value)}
          />
        </div>

        {/* Quick Prompts */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Quick prompts:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((quickPrompt) => (
              <Button
                key={quickPrompt.label}
                type="button"
                variant="secondary"
                size="sm"
                className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => onPromptChange(quickPrompt.prompt)}
              >
                {quickPrompt.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
