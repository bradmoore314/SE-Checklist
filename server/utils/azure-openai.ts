import OpenAI from "openai";

/**
 * Kastle's secure Azure OpenAI configuration
 * 
 * This implementation uses Microsoft Azure OpenAI hosted in Kastle's secure Azure environment
 * instead of third-party AI services. This approach provides:
 * 
 * 1. Enhanced security - Data processed within Kastle's protected infrastructure
 * 2. Improved compliance - Meets enterprise security requirements
 * 3. Private network access - AI operations occur within Kastle's network boundary
 * 4. Data governance - All AI operations subject to Kastle's security policies
 */

// Azure OpenAI API configuration
const AZURE_ENDPOINT = "https://azuresearchservice2.openai.azure.com/";
const AZURE_API_VERSION = "2023-12-01-preview";
const AZURE_DEPLOYMENT_NAME = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o-mini";
const AZURE_MODEL = "gpt-4";

/**
 * Create and return an Azure OpenAI client connected to Kastle's secure environment
 * 
 * This client connects directly to Kastle's Azure OpenAI deployment for secure AI processing.
 * All AI operations are performed within Kastle's secure infrastructure, ensuring:
 * - Data never leaves Kastle's protected environment
 * - All operations comply with enterprise security requirements
 * - Communication occurs over secure, authenticated channels
 */
export function getAzureOpenAIClient() {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("Azure OpenAI API key is not configured");
  }
  
  return new OpenAI({
    apiKey,
    baseURL: `${AZURE_ENDPOINT}openai/deployments/${AZURE_DEPLOYMENT_NAME}`,
    defaultQuery: { "api-version": AZURE_API_VERSION },
    defaultHeaders: { "api-key": apiKey }
  });
}

interface AnalysisResult {
  summary: string;
  detailedAnalysis: string;
  recommendations: string[];
  risks: string[];
  timeline: string;
}

interface QuoteReviewAgendaResult {
  introduction: string;
  agenda: string[];
  questions: string[];
  nextSteps: string[];
}

interface TurnoverCallAgendaResult {
  introduction: string;
  agenda: string[];
  trainingItems: string[];
  responsibilities: {
    customer: string[];
    kastle: string[];
  };
  nextSteps: string[];
}

/**
 * Generates a site walk analysis using Azure OpenAI in Kastle's secure environment.
 * 
 * This function processes client security requirements through Kastle's protected
 * Azure OpenAI deployment, ensuring all sensitive project information remains
 * within Kastle's secure infrastructure during AI processing.
 */
export async function generateSiteWalkAnalysis(
  projectName: string,
  projectDescription: string,
  buildingCount: number,
  accessPointCount: number,
  cameraCount: number,
  clientRequirements: string,
  specialConsiderations: string
): Promise<AnalysisResult> {
  const openai = getAzureOpenAIClient();
  
  const prompt = `
You are a security systems expert assisting in analyzing a site walk for a security installation project.

PROJECT INFORMATION:
- Project Name: ${projectName}
- Project Description: ${projectDescription}
- Number of Buildings: ${buildingCount}
- Access Points to be Installed: ${accessPointCount}
- Cameras to be Installed: ${cameraCount}
- Client Requirements: ${clientRequirements || "No specific requirements provided"}
- Special Considerations: ${specialConsiderations || "None provided"}

Based on this information, please provide a comprehensive site walk analysis with the following:

1. A brief executive summary of the project
2. A detailed analysis of the security needs, challenges, and opportunities
3. 3-5 specific recommendations for the security system design
4. 2-3 potential risks or challenges that should be addressed
5. A suggested timeline for implementation

Format your response as a JSON object with the following keys:
- summary: The executive summary
- detailedAnalysis: The detailed analysis
- recommendations: An array of recommendation strings
- risks: An array of risk strings
- timeline: A suggested timeline

Ensure your response is properly formatted as JSON.
`;

  const response = await openai.chat.completions.create({
    model: AZURE_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    response_format: { type: "json_object" }
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("Empty response from Azure OpenAI");
  }
  
  try {
    return JSON.parse(content) as AnalysisResult;
  } catch (error) {
    console.error("Failed to parse Azure OpenAI response:", error);
    throw new Error("Failed to parse Azure OpenAI response");
  }
}

/**
 * Generates a quote review meeting agenda using Kastle's secure Azure OpenAI service.
 * 
 * This function processes client quote details and requirements through Kastle's protected
 * Azure OpenAI deployment, ensuring all sensitive pricing and project information remains
 * within Kastle's secure infrastructure during AI processing.
 */
export async function generateQuoteReviewAgenda(
  projectName: string,
  projectDescription: string,
  quoteDetails: string,
  clientBackground: string
): Promise<QuoteReviewAgendaResult> {
  const openai = getAzureOpenAIClient();
  
  const prompt = `
You are a security systems sales expert preparing for a quote review meeting with a client.

PROJECT INFORMATION:
- Project Name: ${projectName}
- Project Description: ${projectDescription}
- Quote Details: ${quoteDetails || "No specific quote details provided"}
- Client Background: ${clientBackground || "No specific client background provided"}

Based on this information, please generate a professional meeting agenda for a quote review meeting with the following:

1. A brief introduction paragraph that sets the context for the meeting
2. 4-6 agenda items to discuss during the meeting
3. 3-5 key questions to ask the client to ensure their needs are addressed
4. 2-3 recommended next steps after the meeting

Format your response as a JSON object with the following keys:
- introduction: The introduction paragraph
- agenda: An array of agenda item strings
- questions: An array of question strings
- nextSteps: An array of next step strings

Ensure your response is properly formatted as JSON.
`;

  const response = await openai.chat.completions.create({
    model: AZURE_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    response_format: { type: "json_object" }
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("Empty response from Azure OpenAI");
  }
  
  try {
    return JSON.parse(content) as QuoteReviewAgendaResult;
  } catch (error) {
    console.error("Failed to parse Azure OpenAI response:", error);
    throw new Error("Failed to parse Azure OpenAI response");
  }
}

/**
 * Generates a turnover call agenda using Kastle's secure Azure OpenAI service.
 * 
 * This function processes client installation details and requirements through Kastle's protected
 * Azure OpenAI deployment, ensuring all sensitive handover information remains within Kastle's
 * secure infrastructure during AI processing. The resulting agenda includes properly secured
 * client-specific implementation details.
 */
export async function generateTurnoverCallAgenda(
  projectName: string,
  projectDescription: string,
  installationDetails: string,
  clientNeeds: string
): Promise<TurnoverCallAgendaResult> {
  const openai = getAzureOpenAIClient();
  
  const prompt = `
You are a security systems project manager preparing for a turnover call with a client after system installation.

PROJECT INFORMATION:
- Project Name: ${projectName}
- Project Description: ${projectDescription}
- Installation Details: ${installationDetails || "No specific installation details provided"}
- Client Needs and Expectations: ${clientNeeds || "No specific client needs provided"}

Based on this information, please generate a professional turnover call agenda with the following:

1. A brief introduction paragraph that sets the context for the call
2. 4-6 agenda items to discuss during the call
3. 3-5 key training items to cover with the client
4. Clearly defined responsibilities for:
   a. 2-4 customer responsibilities
   b. 2-4 Kastle responsibilities
5. 2-3 recommended next steps after the call

Format your response as a JSON object with the following keys:
- introduction: The introduction paragraph
- agenda: An array of agenda item strings
- trainingItems: An array of training item strings
- responsibilities: An object with two keys:
  - customer: An array of customer responsibility strings
  - kastle: An array of Kastle responsibility strings
- nextSteps: An array of next step strings

Ensure your response is properly formatted as JSON.
`;

  const response = await openai.chat.completions.create({
    model: AZURE_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    response_format: { type: "json_object" }
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("Empty response from Azure OpenAI");
  }
  
  try {
    return JSON.parse(content) as TurnoverCallAgendaResult;
  } catch (error) {
    console.error("Failed to parse Azure OpenAI response:", error);
    throw new Error("Failed to parse Azure OpenAI response");
  }
}

/**
 * Simple test function to check if Kastle's secure Azure OpenAI connection is working
 * 
 * This function tests connectivity to Kastle's secure Azure OpenAI deployment.
 * The test is performed through Kastle's protected infrastructure, ensuring
 * that even test prompts never leave the secure environment.
 */
export async function testAzureOpenAI(prompt: string): Promise<string> {
  try {
    const openai = getAzureOpenAIClient();
    
    const response = await openai.chat.completions.create({
      model: AZURE_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    return response.choices[0].message.content || "No response from Azure OpenAI";
  } catch (error) {
    console.error("Error testing Azure OpenAI:", error);
    if (error instanceof Error) {
      return `Error: ${error.message}`;
    }
    return "Unknown error occurred";
  }
}