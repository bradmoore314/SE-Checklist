import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GeminiTest } from '@/components/ai/GeminiTest';

const GeminiTestPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Link href="/projects">
          <Button variant="outline" className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Gemini AI Test</h1>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="shadow-md border-gray-200">
          <CardHeader>
            <CardTitle>Gemini AI Integration</CardTitle>
            <CardDescription>
              Test the Gemini AI integration with the provided API key. This page allows you to try out
              the AI features by sending prompts and receiving responses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GeminiTest />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GeminiTestPage;