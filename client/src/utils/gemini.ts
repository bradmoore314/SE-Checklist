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
    const response = await apiRequest('POST', `/api/projects/${projectId}/ai-analysis`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate AI analysis');
    }
    
    const data = await response.json();
    
    // Ensure all fields exist with default values if missing
    return {
      summary: data.analysis.summary || "Executive summary not available",
      detailedAnalysis: data.analysis.detailedAnalysis || "Technical analysis not available",
      recommendations: data.analysis.recommendations || [],
      risks: data.analysis.risks || [],
      timeline: data.analysis.timeline || "Timeline information not available"
    };
  } catch (error) {
    console.error('Error generating AI analysis:', error);
    throw error;
  }
}