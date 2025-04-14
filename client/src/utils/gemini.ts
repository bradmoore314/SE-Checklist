import { apiRequest } from "@/lib/queryClient";

export interface AiAnalysisResponse {
  summary: string;
  detailedAnalysis: string;
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
    return data.analysis;
  } catch (error) {
    console.error('Error generating AI analysis:', error);
    throw error;
  }
}