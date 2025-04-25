import { apiRequest } from "@/lib/queryClient";

export interface AiAnalysisResponse {
  summary: string;
  detailedAnalysis: string;
  recommendations: string[];
  risks: string[];
  timeline: string;
}

/**
 * Generates an AI analysis of a site walk using Gemini API
 * 
 * @param projectId The ID of the project/site walk to analyze
 * @returns Promise with the analysis results
 */
export async function generateAiAnalysis(projectId: number): Promise<AiAnalysisResponse> {
  try {
    console.log(`Requesting AI Analysis for project ${projectId}`);
    const response = await apiRequest('POST', `/api/projects/${projectId}/ai-analysis`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('AI Analysis API error:', errorData);
      throw new Error(errorData.message || errorData.error || 'Failed to generate AI analysis');
    }
    
    const data = await response.json();
    console.log('AI Analysis response received:', data);
    
    if (!data.success || !data.analysis) {
      console.error('Malformed AI analysis response:', data);
      throw new Error('Invalid response format from AI analysis API');
    }
    
    // Ensure all fields exist with default values if missing
    const result = {
      summary: data.analysis.summary || "Executive summary not available",
      detailedAnalysis: data.analysis.detailedAnalysis || "Technical analysis not available",
      recommendations: Array.isArray(data.analysis.recommendations) ? data.analysis.recommendations : [],
      risks: Array.isArray(data.analysis.risks) ? data.analysis.risks : [],
      timeline: data.analysis.timeline || "Timeline information not available"
    };
    
    console.log('Processed AI analysis result:', result);
    return result;
  } catch (error) {
    console.error('Error generating AI analysis:', error);
    throw error;
  }
}