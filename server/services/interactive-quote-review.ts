/**
 * Service for handling interactive quote review analysis
 * This allows users to answer questions that couldn't be automatically determined
 * and then generates an AI analysis with that additional information
 */
import { getAzureOpenAIClient } from "../utils/azure-openai";

interface ProjectData {
  project: any;
  equipment?: {
    accessPoints: any[];
    cameras: any[];
    elevators: any[];
    intercoms: any[];
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
 * Generate a list of questions for the quote review that need user input
 */
export function generateQuoteReviewQuestions(): ProjectQuestion[] {
  return [
    {
      id: 1,
      question: "What is the client's timeline for implementation?",
      category: "Project Timeline",
      answerSource: "user input"
    },
    {
      id: 2,
      question: "Are there any specific budget constraints for this project?",
      category: "Budget Considerations",
      answerSource: "user input"
    },
    {
      id: 3,
      question: "What are the primary security concerns at this location?",
      category: "Security Requirements",
      answerSource: "user input"
    },
    {
      id: 4,
      question: "Are there any compliance requirements (e.g., HIPAA, PCI, etc.) relevant to this project?",
      category: "Compliance",
      answerSource: "user input"
    },
    {
      id: 5,
      question: "What is the expected timeline for approvals and decision-making?",
      category: "Project Timeline",
      answerSource: "user input"
    },
    {
      id: 6,
      question: "Are there any existing security systems that need to be integrated?",
      category: "Integration",
      answerSource: "user input"
    },
    {
      id: 7,
      question: "What are the hours of operation for this facility?",
      category: "Operation Details",
      answerSource: "user input"
    },
    {
      id: 8,
      question: "Are there specific areas that require higher security levels?",
      category: "Security Requirements",
      answerSource: "user input"
    },
    {
      id: 9,
      question: "Is there an IT team at the facility that will be involved in the implementation?",
      category: "Implementation",
      answerSource: "user input"
    },
    {
      id: 10,
      question: "Are there any anticipated changes to the building or facility layout in the near future?",
      category: "Future Considerations",
      answerSource: "user input"
    }
  ];
}

/**
 * Generate an interactive quote review analysis by combining project data with user-provided answers
 */
export async function generateInteractiveQuoteReview(
  projectData: ProjectData,
  userAnsweredQuestions: ProjectQuestion[]
): Promise<AIAnalysisResult> {
  console.log("Generating interactive quote review with user-provided answers");
  
  // Get the OpenAI client
  const openai = getAzureOpenAIClient();
  
  // Extract project name and client
  const projectName = projectData.project.name;
  const clientName = projectData.project.client;
  
  // Calculate summary statistics
  const accessPointCount = projectData.equipment?.accessPoints.length || 0;
  const cameraCount = projectData.equipment?.cameras.length || 0;
  const elevatorCount = projectData.equipment?.elevators.length || 0;
  const intercomCount = projectData.equipment?.intercoms.length || 0;
  
  const totalEquipment = accessPointCount + cameraCount + elevatorCount + intercomCount;
  
  // Create context for prompt with the user-answered questions
  const userAnswersContext = userAnsweredQuestions
    .filter(q => q.answered && q.userAnswer)
    .map(q => `Question: ${q.question}\nUser's Answer: ${q.userAnswer}`)
    .join("\n\n");

  // Build prompt
  const prompt = `
You are an expert security systems consultant at Kastle Systems. You're analyzing a project and providing a detailed quote review.

PROJECT INFORMATION:
- Project Name: ${projectName}
- Client: ${clientName}
- Equipment Summary: 
  - Access Points: ${accessPointCount}
  - Cameras: ${cameraCount}
  - Elevators: ${elevatorCount}
  - Intercoms: ${intercomCount}
  - Total Equipment: ${totalEquipment}

ADDITIONAL INFORMATION PROVIDED BY THE USER:
${userAnswersContext}

Based on this information, generate a comprehensive quote review analysis. Include:
1. A warm, personalized introduction that mentions the client by name
2. An initial assessment of the project's scope and complexity
3. Specific recommendations tailored to the information provided
4. Next steps for moving the project forward

Your response should be specifically tailored to the user's answers and the project data. 
Make direct references to the specific details that were provided in the user's answers when making recommendations.
Focus on providing actionable insights and recommendations that will help improve the final quote.

Format your response as a JSON object with the following keys:
- introduction: A warm, personalized introduction paragraph
- initialAssessment: A concise assessment of the project
- recommendations: An array of recommendation strings
- nextSteps: An array of next steps strings

The output must be valid JSON.
`;

  try {
    // Generate response with Azure OpenAI
    const response = await openai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    // Extract content
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from Azure OpenAI");
    }
    
    // Parse the response
    const result = JSON.parse(content);
    
    // Add the questions back to the response
    return {
      ...result,
      questions: userAnsweredQuestions
    };
  } catch (error) {
    console.error("Error generating interactive quote review:", error);
    throw new Error(`Failed to generate quote review analysis: ${(error as Error).message}`);
  }
}