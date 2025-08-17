import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import type { Summary } from "@shared/schema";

interface EmailSharingProps {
  summary: Summary;
}

export default function EmailSharing({ summary }: EmailSharingProps) {
  const [emailRecipients, setEmailRecipients] = useState("");
  const [emailSubject, setEmailSubject] = useState("Meeting Summary");
  const [emailMessage, setEmailMessage] = useState("");
  const [includeOriginal, setIncludeOriginal] = useState(false);
  const { toast } = useToast();

  const sendEmailMutation = useMutation({
    mutationFn: async () => {
      const recipients = emailRecipients
        .split(",")
        .map(email => email.trim())
        .filter(email => email.length > 0);

      if (recipients.length === 0) {
        throw new Error("At least one email address is required");
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = recipients.filter(email => !emailRegex.test(email));
      if (invalidEmails.length > 0) {
        throw new Error(`Invalid email addresses: ${invalidEmails.join(", ")}`);
      }

      const res = await apiRequest("POST", `/api/summaries/${summary.id}/email`, {
        recipients,
        subject: emailSubject.trim(),
        message: emailMessage.trim() || undefined,
        includeOriginal,
      });
      return res.json();
    },
    onSuccess: (data: { recipientCount: number }) => {
      toast({
        title: "Email Sent",
        description: `Summary sent successfully to ${data.recipientCount} recipient${data.recipientCount === 1 ? '' : 's'}!`,
      });
      // Clear form
      setEmailRecipients("");
      setEmailMessage("");
    },
    onError: (error: Error) => {
      toast({
        title: "Send Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const canSend = emailRecipients.trim() && emailSubject.trim() && !sendEmailMutation.isPending;

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">5. Share Summary</h2>
      
      <div className="space-y-4">
        {/* Email Recipients */}
        <div>
          <Label htmlFor="email-recipients" className="block text-sm font-medium text-gray-700 mb-2">
            Email addresses (comma-separated)
          </Label>
          <Input
            type="email"
            id="email-recipients"
            placeholder="john@company.com, sarah@company.com"
            value={emailRecipients}
            onChange={(e) => setEmailRecipients(e.target.value)}
            disabled={sendEmailMutation.isPending}
          />
        </div>
        
        {/* Email Subject */}
        <div>
          <Label htmlFor="email-subject" className="block text-sm font-medium text-gray-700 mb-2">
            Subject line
          </Label>
          <Input
            type="text"
            id="email-subject"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            disabled={sendEmailMutation.isPending}
          />
        </div>
        
        {/* Email Message */}
        <div>
          <Label htmlFor="email-message" className="block text-sm font-medium text-gray-700 mb-2">
            Additional message (optional)
          </Label>
          <Textarea
            id="email-message"
            rows={3}
            placeholder="Hi team, please find the meeting summary attached..."
            value={emailMessage}
            onChange={(e) => setEmailMessage(e.target.value)}
            disabled={sendEmailMutation.isPending}
          />
        </div>
        
        {/* Send Options */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-original"
              checked={includeOriginal}
              onCheckedChange={(checked) => setIncludeOriginal(checked as boolean)}
              disabled={sendEmailMutation.isPending}
            />
            <Label htmlFor="include-original" className="text-sm text-gray-700">
              Include original transcript
            </Label>
          </div>
          
          <Button
            onClick={() => sendEmailMutation.mutate()}
            disabled={!canSend}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {sendEmailMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {sendEmailMutation.isPending ? "Sending..." : "Send Email"}
          </Button>
        </div>
        
        {/* Success Message */}
        {sendEmailMutation.isSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Email sent successfully!
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {sendEmailMutation.error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">
                  {sendEmailMutation.error.message}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
