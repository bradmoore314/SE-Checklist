import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { generateContent, isGeminiConfigured } from '@/services/gemini-service';

export function GeminiTest() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'checking' | 'configured' | 'not-configured'>('checking');

  // Check if the Gemini API is configured
  React.useEffect(() => {
    async function checkApiStatus() {
      try {
        setApiStatus('checking');
        const configured = await isGeminiConfigured();
        setApiStatus(configured ? 'configured' : 'not-configured');
      } catch (err) {
        console.error('Error checking Gemini API status:', err);
        setApiStatus('not-configured');
      }
    }
    
    checkApiStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse('');

    try {
      const result = await generateContent(prompt);
      setResponse(result);
    } catch (err) {
      console.error('Error generating content:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Gemini AI Test</CardTitle>
        <CardDescription>
          Test the Gemini AI integration by sending a prompt and getting a response.
        </CardDescription>
        
        {apiStatus === 'checking' && (
          <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <AlertTitle>Checking Gemini API status...</AlertTitle>
          </Alert>
        )}
        
        {apiStatus === 'configured' && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 mr-2" />
            <AlertTitle>Gemini API is properly configured</AlertTitle>
            <AlertDescription>You can now test the AI integration below.</AlertDescription>
          </Alert>
        )}
        
        {apiStatus === 'not-configured' && (
          <Alert className="bg-red-50 text-red-800 border-red-200">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertTitle>Gemini API is not configured</AlertTitle>
            <AlertDescription>
              The GEMINI_API_KEY environment variable may be missing or invalid.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
                Your prompt
              </label>
              <Textarea
                id="prompt"
                placeholder="Enter your prompt here..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-32"
                disabled={isLoading || apiStatus !== 'configured'}
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {response && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Response
                </label>
                <div className="bg-slate-50 p-4 rounded-md border border-slate-200 whitespace-pre-wrap">
                  {response}
                </div>
              </div>
            )}
          </div>
        </form>
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isLoading || apiStatus !== 'configured'}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Generating...
            </>
          ) : (
            'Generate Response'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}