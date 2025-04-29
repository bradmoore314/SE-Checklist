import React from "react";
import GeminiTest from "@/components/ai/GeminiTest";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const GeminiTestPage = () => {
  return (
    <div className="container max-w-4xl mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Gemini AI Test</h1>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Test Gemini API Integration</CardTitle>
          <CardDescription>
            This page allows you to test the Gemini AI API integration with simple prompts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GeminiTest />
        </CardContent>
      </Card>
    </div>
  );
};

export default GeminiTestPage;