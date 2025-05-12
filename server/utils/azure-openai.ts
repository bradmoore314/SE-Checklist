import { OpenAI } from 'openai';

// Access the API key from environment variables
const API_KEY = process.env.AZURE_OPENAI_API_KEY;
const AZURE_ENDPOINT = 'https://azuresearchservice2.openai.azure.com/';
const API_VERSION = '2024-02-15-preview';
const DEPLOYMENT_NAME = 'gpt-4';

// Initialize the Azure OpenAI client
export function getAzureOpenAIClient() {
  if (!API_KEY) {
    throw new Error('AZURE_OPENAI_API_KEY environment variable is not set');
  }

  return new OpenAI({
    apiKey: API_KEY,
    baseURL: `${AZURE_ENDPOINT}openai/deployments/${DEPLOYMENT_NAME}`,
    defaultQuery: { 'api-version': API_VERSION },
    defaultHeaders: { 'api-key': API_KEY },
  });
}

// Define the result types (keeping the same interfaces as the Gemini implementation)
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
 * Generates a site walk analysis using Azure OpenAI.
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
    You are a professional security systems analyst creating a site walk analysis report.
    
    PROJECT DETAILS:
    - Project Name: ${projectName}
    - Project Description: ${projectDescription}
    - Building Count: ${buildingCount}
    - Access Point Count: ${accessPointCount}
    - Camera Count: ${cameraCount}
    - Client Requirements: ${clientRequirements}
    - Special Considerations: ${specialConsiderations}
    
    Please provide a comprehensive analysis with the following sections:
    
    1. EXECUTIVE SUMMARY: A high-level overview of the project and key findings.
    2. DETAILED ANALYSIS: In-depth assessment of the security requirements and site conditions.
    3. RECOMMENDATIONS: List specific actionable recommendations (at least 5).
    4. RISKS: Identify potential risks and challenges (at least 3).
    5. TIMELINE: Suggested implementation timeline with key milestones.
    
    Format your response as a valid JSON object with the following structure:
    {
      "summary": "Executive summary text",
      "detailedAnalysis": "Detailed analysis text",
      "recommendations": ["Recommendation 1", "Recommendation 2", ...],
      "risks": ["Risk 1", "Risk 2", ...],
      "timeline": "Timeline text"
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: DEPLOYMENT_NAME,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in response');
    }

    return JSON.parse(content) as AnalysisResult;
  } catch (error) {
    console.error('Error generating site walk analysis:', error);
    throw new Error('Failed to generate site walk analysis');
  }
}

/**
 * Generates a quote review meeting agenda.
 */
export async function generateQuoteReviewAgenda(
  projectName: string,
  projectDescription: string,
  quoteDetails: string,
  clientBackground: string
): Promise<QuoteReviewAgendaResult> {
  const openai = getAzureOpenAIClient();
  
  const prompt = `
    You are a professional security systems consultant preparing for a quote review meeting.
    
    PROJECT DETAILS:
    - Project Name: ${projectName}
    - Project Description: ${projectDescription}
    - Quote Details: ${quoteDetails}
    - Client Background: ${clientBackground}
    
    Please create a comprehensive meeting agenda with the following sections:
    
    1. INTRODUCTION: Brief introduction for the meeting.
    2. AGENDA ITEMS: List 4-6 specific agenda items to cover during the meeting.
    3. QUESTIONS: 3-5 important questions to ask the client during the review.
    4. NEXT STEPS: 2-3 action items to propose at the end of the meeting.
    
    Format your response as a valid JSON object with the following structure:
    {
      "introduction": "Introduction text",
      "agenda": ["Agenda item 1", "Agenda item 2", ...],
      "questions": ["Question 1", "Question 2", ...],
      "nextSteps": ["Next step 1", "Next step 2", ...]
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: DEPLOYMENT_NAME,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in response');
    }

    return JSON.parse(content) as QuoteReviewAgendaResult;
  } catch (error) {
    console.error('Error generating quote review agenda:', error);
    throw new Error('Failed to generate quote review agenda');
  }
}

/**
 * Generates a turnover call agenda.
 */
export async function generateTurnoverCallAgenda(
  projectName: string, 
  projectDescription: string, 
  installationDetails: string, 
  clientNeeds: string
): Promise<TurnoverCallAgendaResult> {
  const openai = getAzureOpenAIClient();
  
  const prompt = `
    You are a professional security systems project manager preparing for a turnover call.
    
    PROJECT DETAILS:
    - Project Name: ${projectName}
    - Project Description: ${projectDescription}
    - Installation Details: ${installationDetails}
    - Client Needs: ${clientNeeds}
    
    Please create a comprehensive turnover call agenda with the following sections:
    
    1. INTRODUCTION: Brief introduction for the call.
    2. AGENDA ITEMS: List 4-6 specific agenda items to cover during the call.
    3. TRAINING ITEMS: List 3-5 specific training topics to cover during the call.
    4. RESPONSIBILITIES:
       - List 3-4 client responsibilities after the turnover.
       - List 3-4 Kastle responsibilities after the turnover.
    5. NEXT STEPS: 2-3 action items to propose at the end of the call.
    
    Format your response as a valid JSON object with the following structure:
    {
      "introduction": "Introduction text",
      "agenda": ["Agenda item 1", "Agenda item 2", ...],
      "trainingItems": ["Training item 1", "Training item 2", ...],
      "responsibilities": {
        "customer": ["Customer responsibility 1", "Customer responsibility 2", ...],
        "kastle": ["Kastle responsibility 1", "Kastle responsibility 2", ...]
      },
      "nextSteps": ["Next step 1", "Next step 2", ...]
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: DEPLOYMENT_NAME,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in response');
    }

    return JSON.parse(content) as TurnoverCallAgendaResult;
  } catch (error) {
    console.error('Error generating turnover call agenda:', error);
    throw new Error('Failed to generate turnover call agenda');
  }
}

/**
 * Simple test function to check if the Azure OpenAI API is working
 */
export async function testAzureOpenAI(prompt: string): Promise<string> {
  try {
    const openai = getAzureOpenAIClient();
    const response = await openai.chat.completions.create({
      model: DEPLOYMENT_NAME,
      messages: [{ role: 'user', content: prompt }],
    });
    
    return response.choices[0]?.message?.content || 'No response';
  } catch (error) {
    console.error('Error testing Azure OpenAI:', error);
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
}