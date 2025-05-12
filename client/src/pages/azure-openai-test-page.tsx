import React from "react";
import AzureOpenAITest from "@/components/ai/AzureOpenAITest";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AzureOpenAITestPage = () => {
  return (
    <div className="container max-w-4xl mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Azure OpenAI Test</h1>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Test Azure OpenAI API Integration</CardTitle>
          <CardDescription>
            This page allows you to test the Azure OpenAI API integration in Kastle's secure environment with simple prompts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AzureOpenAITest />
        </CardContent>
      </Card>
    </div>
  );
};

export default AzureOpenAITestPage;