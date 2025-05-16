/**
 * Service for handling interactive quote review analysis
 * This allows users to answer questions that couldn't be automatically determined
 * and then generates an AI analysis with that additional information
 */

import { Project, AccessPoint, Camera, Elevator, Intercom } from "@shared/schema";
import { generateCompletionWithAzureOpenAI } from "../utils/azure-openai";
import { AI_CONFIG } from "../config";

interface ProjectData {
  project: Project;
  equipment?: {
    accessPoints: AccessPoint[];
    cameras: Camera[];
    elevators: Elevator[];
    intercoms: Intercom[];
  };
}

interface ProjectQuestion {
  id: number;
  question: string;
  category: string;
  answerSource: string;
  userAnswer?: string;
  answered?: boolean;
  skipped?: boolean;
}

interface AIAnalysisResult {
  introduction: string;
  initialAssessment: string;
  recommendations: string[];
  questions: ProjectQuestion[];
  nextSteps: string[];
}

/**
 * Generate an interactive quote review analysis by combining project data with user-provided answers
 */
export async function generateInteractiveQuoteReview(
  projectData: ProjectData,
  userAnsweredQuestions: ProjectQuestion[]
): Promise<AIAnalysisResult> {
  // Check if Azure OpenAI is configured
  if (!AI_CONFIG.isAzureConfigured()) {
    throw new Error('Azure OpenAI is not configured');
  }

  const { project, equipment } = projectData;
  
  // Get the count of different equipment types
  const accessPointCount = equipment?.accessPoints?.length || 0;
  const cameraCount = equipment?.cameras?.length || 0;
  const elevatorCount = equipment?.elevators?.length || 0;
  const intercomCount = equipment?.intercoms?.length || 0;
  
  // Format the user's answers for the AI
  const userAnswerText = userAnsweredQuestions
    .filter(q => q.userAnswer && !q.skipped)
    .map(q => `Question: ${q.question}\nAnswer: ${q.userAnswer}`)
    .join('\n\n');
  
  // Structure our prompt
  const prompt = `
As a security system project analyst, I need you to create a comprehensive interactive quote review for this project based on the provided information and user answers to specific questions.

PROJECT DETAILS:
- Project Name: ${project.name}
- Client: ${project.client}
- Site Address: ${project.site_address || 'Not specified'}
- Building Count: ${project.building_count || 'Not specified'}

EQUIPMENT SUMMARY:
- Access Points: ${accessPointCount}
- Cameras: ${cameraCount}
- Elevators: ${elevatorCount}
- Intercoms: ${intercomCount}

ADDITIONAL PROJECT INFORMATION:
${project.notes || 'No additional notes'}

USER-PROVIDED ANSWERS TO SPECIFIC QUESTIONS:
${userAnswerText || 'No user answers provided yet'}

Based on the information above, please provide:
1. An introduction that summarizes the project and its scope.
2. An initial assessment of the project based on the provided information.
3. 3-5 specific recommendations regarding the quote and project scope.
4. A list of next steps for finalizing the quote and moving forward.

Format your response as a JSON object with the following structure:
{
  "introduction": "A concise paragraph summarizing the project...",
  "initialAssessment": "A detailed assessment of the project based on the available information...",
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "nextSteps": ["Next step 1", "Next step 2", "Next step 3"]
}

Make your analysis detailed, professional, and actionable, focusing on the security aspects of the project.
`;

  try {
    const result = await generateCompletionWithAzureOpenAI(prompt, "json_object");
    
    // Parse the response and ensure it has the right format
    const parsedResult = JSON.parse(result);
    
    // Add the questions back to the response
    return {
      ...parsedResult,
      questions: userAnsweredQuestions
    };
  } catch (error) {
    console.error("Error generating interactive quote review:", error);
    throw new Error(`Failed to generate quote review analysis: ${(error as Error).message}`);
  }
}

/**
 * Generate a list of questions for the quote review that need user input
 */
export function generateQuoteReviewQuestions(): ProjectQuestion[] {
  // Common questions that are often not automatically determinable
  const questions: ProjectQuestion[] = [
    {
      id: 1,
      question: "What is the client's budget range for this security project?",
      category: "Budget & Pricing",
      answerSource: "client input"
    },
    {
      id: 2,
      question: "Are there any specific security compliance requirements that must be met?",
      category: "Compliance & Regulations",
      answerSource: "client input"
    },
    {
      id: 3,
      question: "Does the client have existing security systems that need to be integrated?",
      category: "System Integration",
      answerSource: "site assessment"
    },
    {
      id: 4,
      question: "What is the client's preferred timeline for project completion?",
      category: "Timeline",
      answerSource: "client input"
    },
    {
      id: 5,
      question: "Are there specific hours when installation work can be performed?",
      category: "Installation",
      answerSource: "client input"
    },
    {
      id: 6,
      question: "Does the client require phased implementation or a full deployment?",
      category: "Implementation",
      answerSource: "client input"
    },
    {
      id: 7,
      question: "Are there any specific security threats or incidents that occurred that prompted this project?",
      category: "Risk Assessment",
      answerSource: "client input"
    },
    {
      id: 8,
      question: "What level of ongoing support and maintenance is expected after installation?",
      category: "Maintenance & Support",
      answerSource: "client input"
    },
    {
      id: 9,
      question: "Are there any aesthetic requirements for visible security equipment?",
      category: "Design & Aesthetics",
      answerSource: "client input"
    },
    {
      id: 10,
      question: "Who are the key stakeholders that need to be involved in the quote review meeting?",
      category: "Stakeholders",
      answerSource: "client input"
    },
    {
      id: 11,
      question: "What are the client's primary security concerns for this location?",
      category: "Risk Assessment",
      answerSource: "client input"
    },
    {
      id: 12,
      question: "Are there any future expansion plans that should be considered in the system design?",
      category: "Future Planning",
      answerSource: "client input"
    }
  ];
  
  return questions;
}