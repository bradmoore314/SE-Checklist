import { generateSiteWalkAnalysis } from "@/services/gemini-service";

// Define the response type for AI analysis
export interface AiAnalysisResponse {
  summary: string;
  technicalAnalysis?: string;
  detailedAnalysis?: string;
  recommendations: string[];
  risks: string[];
  timeline: string;
}

/**
 * Generates an AI analysis for a site walk project
 * @param projectId The ID of the project to analyze
 * @returns The analysis data from the AI
 */
export async function generateAiAnalysis(projectId: number): Promise<AiAnalysisResponse> {
  console.log("Requesting AI Analysis for project", projectId);
  
  try {
    const response = await generateSiteWalkAnalysis(projectId);
    
    if (!response || !response.success) {
      throw new Error(response?.message || "Failed to generate analysis");
    }
    
    // Handle possible field name differences between server and client
    const analysisData = response.analysis;
    
    // Normalize the response to match our frontend interface
    return {
      summary: analysisData.summary,
      technicalAnalysis: analysisData.technicalAnalysis || analysisData.detailedAnalysis,
      detailedAnalysis: analysisData.detailedAnalysis || analysisData.technicalAnalysis,
      recommendations: Array.isArray(analysisData.recommendations) 
        ? analysisData.recommendations 
        : [analysisData.recommendations].filter(Boolean),
      risks: Array.isArray(analysisData.risks) 
        ? analysisData.risks 
        : [analysisData.risks].filter(Boolean),
      timeline: analysisData.timeline || "Implementation timeline not available",
    };
  } catch (error) {
    console.error("Error generating AI analysis:", error);
    throw error;
  }
}