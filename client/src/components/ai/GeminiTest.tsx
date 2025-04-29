import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import { testGeminiApi } from "@/services/gemini-service";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export default function GeminiTest() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a prompt to get a response from Gemini AI.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await testGeminiApi(prompt);
      setResponse(result);
    } catch (err) {
      console.error("Error testing Gemini API:", err);
      setError(err instanceof Error ? err.message : "Failed to get response from Gemini AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here... (e.g., 'Tell me about security systems')"
            className="min-h-[120px] resize-none"
            disabled={loading}
          />
        </div>
        <Button 
          type="submit" 
          disabled={loading || !prompt.trim()} 
          className="w-full flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-0 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send to Gemini AI
            </>
          )}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {response && !error && (
        <>
          <Separator />
          <Card className="border-blue-100 bg-blue-50">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2 text-blue-700">Gemini AI Response:</h3>
              <div className="whitespace-pre-wrap prose max-w-none">
                {response}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <div className="text-sm text-gray-500 mt-4">
        <h4 className="font-medium mb-1">About this test:</h4>
        <p>This page helps test the integration with Google's Gemini AI API. It sends your prompt directly to the Gemini model and displays the raw response.</p>
      </div>
    </div>
  );
}