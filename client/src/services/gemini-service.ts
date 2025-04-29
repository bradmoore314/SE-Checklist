import { apiRequest } from "@/lib/queryClient";

/**
 * Sends a test prompt to the Gemini API through our server proxy
 * @param prompt The prompt to send to Gemini
 * @returns The response text from Gemini
 */
export async function testGeminiApi(prompt: string): Promise<string> {
  try {
    const response = await apiRequest("POST", "/api/gemini/test", { prompt });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to get response from Gemini API");
    }
    
    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error("Error in Gemini API request:", error);
    throw error;
  }
}

/**
 * Generates an AI analysis of the site walk data for a specific project
 * @param projectId The ID of the project to analyze
 * @returns The analysis object with summary, technical details, recommendations, and risks
 */
export async function generateSiteWalkAnalysis(projectId: number) {
  try {
    const response = await apiRequest("POST", `/api/projects/${projectId}/ai-analysis`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to generate site walk analysis");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error generating AI analysis:", error);
    throw error;
  }
}

/**
 * Generates a quote review meeting agenda for a specific project
 * @param projectId The ID of the project
 * @returns The meeting agenda text
 */
export async function generateQuoteReviewAgenda(projectId: number) {
  try {
    const response = await apiRequest("POST", `/api/projects/${projectId}/quote-review-agenda`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to generate quote review agenda");
    }
    
    const data = await response.json();
    return data.agenda;
  } catch (error) {
    console.error("Error generating quote review agenda:", error);
    throw error;
  }
}

/**
 * Generates a turnover call meeting agenda for a specific project
 * @param projectId The ID of the project
 * @returns The meeting agenda text
 */
export async function generateTurnoverCallAgenda(projectId: number) {
  try {
    const response = await apiRequest("POST", `/api/projects/${projectId}/turnover-call-agenda`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to generate turnover call agenda");
    }
    
    const data = await response.json();
    return data.agenda;
  } catch (error) {
    console.error("Error generating turnover call agenda:", error);
    throw error;
  }
}