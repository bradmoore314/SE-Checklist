import { getAzureOpenAIClient } from '../utils/azure-openai';

export interface QuoteReviewAgendaResult {
  introduction: string;
  scopeReview: string;
  pricingBreakdown: string[];
  technicalConsiderations: string[];
  timeline: string;
  nextSteps: string[];
  questionsToAsk: string[];
}

/**
 * Generates a quote review meeting agenda using Kastle's secure Azure OpenAI service.
 * 
 * This function processes project data through Kastle's protected Azure OpenAI deployment,
 * ensuring all sensitive pricing and project information remains within Kastle's
 * secure infrastructure during AI processing.
 */
export async function generateQuoteReviewAgenda(projectData: any): Promise<QuoteReviewAgendaResult> {
  try {
    const openai = getAzureOpenAIClient();
    
    // Extract relevant project information
    const projectName = projectData.project?.name || "Security Project";
    const projectDescription = projectData.project?.description || "";
    
    // Create summary of equipment
    const equipmentSummary = createEquipmentSummary(projectData);
    
    // Create the prompt with detailed project information
    const prompt = `
You are an expert security system consultant specialized in creating professional quote review meeting agendas.

PROJECT INFORMATION:
- Project Name: ${projectName}
- Project Description: ${projectDescription}
${equipmentSummary}

Please create a comprehensive quote review meeting agenda for this security project with the following sections:

1. INTRODUCTION: A brief, professional opening paragraph for the meeting that sets the tone.

2. SCOPE REVIEW: A concise overview of the security project scope.

3. PRICING BREAKDOWN: List 3-5 key pricing points or packages to discuss.

4. TECHNICAL CONSIDERATIONS: List 3-5 important technical points that need clarification or emphasis.

5. TIMELINE: A brief overview of implementation timeline to discuss.

6. NEXT STEPS: List 3-5 clear actionable next steps after this meeting.

7. QUESTIONS TO ASK: List 3-5 important questions to ask the client during the meeting.

Format your response as a JSON object with the following structure:
{
  "introduction": "string",
  "scopeReview": "string",
  "pricingBreakdown": ["string", "string", ...],
  "technicalConsiderations": ["string", "string", ...],
  "timeline": "string",
  "nextSteps": ["string", "string", ...],
  "questionsToAsk": ["string", "string", ...]
}
`;

    // Call Azure OpenAI API to generate agenda
    const response = await openai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2048,
      response_format: { type: "json_object" }
    });

    // Get the response content
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content in Azure OpenAI response");
    }

    // Parse the JSON response
    const agendaData = JSON.parse(content);
    
    // Ensure all required fields are present
    const result: QuoteReviewAgendaResult = {
      introduction: agendaData.introduction || "Welcome to our quote review meeting. We will discuss the proposed security solution for your facility.",
      scopeReview: agendaData.scopeReview || "Review of the proposed security system scope including access control, video surveillance, and other security elements.",
      pricingBreakdown: Array.isArray(agendaData.pricingBreakdown) ? agendaData.pricingBreakdown : ["Equipment costs", "Installation fees", "Ongoing maintenance and support"],
      technicalConsiderations: Array.isArray(agendaData.technicalConsiderations) ? agendaData.technicalConsiderations : ["System architecture and integration", "Network requirements", "Security protocols"],
      timeline: agendaData.timeline || "Proposed implementation timeline from contract signing to final commissioning.",
      nextSteps: Array.isArray(agendaData.nextSteps) ? agendaData.nextSteps : ["Contract finalization", "Schedule site survey", "Installation planning"],
      questionsToAsk: Array.isArray(agendaData.questionsToAsk) ? agendaData.questionsToAsk : ["Are there any specific budget constraints?", "Who will be the main point of contact during installation?", "Are there any access restrictions we should be aware of?"]
    };

    return result;
  } catch (error) {
    console.error("Error generating quote review agenda with Azure OpenAI:", error);
    throw new Error(`Failed to generate quote review agenda: ${(error as Error).message}`);
  }
}

/**
 * Creates a summary of the equipment for the prompt
 */
function createEquipmentSummary(projectData: any): string {
  let summary = "\nEQUIPMENT SUMMARY:";
  
  const equipment = projectData.equipment || {};
  const accessPoints = equipment.accessPoints || [];
  const cameras = equipment.cameras || [];
  const elevators = equipment.elevators || [];
  const intercoms = equipment.intercoms || [];
  
  if (accessPoints.length > 0) {
    summary += `\n- Access Control: ${accessPoints.length} access points`;
    
    // Add details about interior vs perimeter
    const interior = accessPoints.filter((ap: any) => ap.interior_perimeter === "Interior").length;
    const perimeter = accessPoints.filter((ap: any) => ap.interior_perimeter === "Perimeter").length;
    if (interior > 0 || perimeter > 0) {
      summary += ` (${interior} interior, ${perimeter} perimeter)`;
    }
  }
  
  if (cameras.length > 0) {
    summary += `\n- Video Surveillance: ${cameras.length} cameras`;
    
    // Add details about indoor vs outdoor
    const indoor = cameras.filter((cam: any) => cam.is_indoor === true).length;
    const outdoor = cameras.filter((cam: any) => cam.is_indoor === false).length;
    if (indoor > 0 || outdoor > 0) {
      summary += ` (${indoor} indoor, ${outdoor} outdoor)`;
    }
  }
  
  if (elevators.length > 0) {
    summary += `\n- Elevator Control: ${elevators.length} elevators`;
  }
  
  if (intercoms.length > 0) {
    summary += `\n- Intercoms: ${intercoms.length} intercom units`;
  }
  
  // Add summary stats if available
  const stats = projectData.summary || {};
  if (stats.accessPointCount || stats.cameraCount || stats.elevatorCount || stats.intercomCount) {
    summary += "\n\nADDITIONAL DETAILS:";
    
    if (stats.elevatorBankCount) {
      summary += `\n- ${stats.elevatorBankCount} elevator banks`;
    }
    
    if (stats.indoorCameraCount && stats.outdoorCameraCount) {
      summary += `\n- Camera breakdown: ${stats.indoorCameraCount} indoor, ${stats.outdoorCameraCount} outdoor`;
    }
  }
  
  return summary;
}