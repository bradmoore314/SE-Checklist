import { apiRequest } from "@/lib/queryClient";

/**
 * Sends a test prompt to Azure OpenAI through Kastle's secure server proxy
 * @param prompt The prompt to send to Azure OpenAI
 * @returns The response text from Azure OpenAI
 */
export async function testAzureOpenAI(prompt: string): Promise<string> {
  try {
    const response = await apiRequest("POST", "/api/azure/test", { prompt });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to get response from Azure OpenAI");
    }
    
    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error("Error in Azure OpenAI API request:", error);
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

/**
 * Get Azure OpenAI service status
 * @returns Status information about the Azure OpenAI service
 */
export async function getAzureOpenAIStatus() {
  try {
    const response = await apiRequest("GET", "/api/azure/status");
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to get Azure OpenAI status");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error checking Azure OpenAI status:", error);
    throw error;
  }
}

/**
 * Sends a chat message to Azure OpenAI
 * @param messages Array of chat messages
 * @returns Response from Azure OpenAI
 */
export async function sendChatMessage(messages: { role: string, content: string }[]) {
  try {
    const response = await apiRequest("POST", "/api/azure/chat", { messages });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to get response from Azure OpenAI chat");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error in Azure OpenAI chat request:", error);
    throw error;
  }
}

/**
 * Gets equipment recommendations based on project requirements
 * @param projectId The ID of the project
 * @param query The query describing project requirements
 * @returns Recommended equipment configurations
 */
export async function getEquipmentRecommendations(projectId: number, query: string) {
  try {
    const response = await apiRequest("POST", "/api/azure/chat/recommendations", { 
      projectId, 
      query 
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to get equipment recommendations");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error getting equipment recommendations:", error);
    throw error;
  }
}