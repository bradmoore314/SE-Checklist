import { GoogleGenerativeAI } from "@google/generative-ai";

// Access the API key from environment variables
const API_KEY = process.env.GEMINI_API_KEY;

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(API_KEY!);

// Define the result types
interface AnalysisResult {
  summary: string;
  detailedAnalysis: string;
  recommendations: string[];
  risks: string[];
  timeline: string;
}

interface QuoteReviewAgendaResult {
  introduction: string;
  scopeReview: string;
  pricingBreakdown: string[];
  technicalConsiderations: string[];
  timeline: string;
  nextSteps: string[];
  questionsToAsk: string[];
}

interface TurnoverCallAgendaResult {
  introduction: string;
  projectOverview: string;
  keyDeliverables: string[];
  systemComponents: string[];
  trainingItems: string[];
  supportInformation: string;
  clientResponsibilities: string[];
  questionsToAddress: string[];
}

// Generate quote review meeting agenda
export async function generateQuoteReviewAgenda(projectData: any): Promise<QuoteReviewAgendaResult> {
  try {
    // Create a structured prompt with project data
    const prompt = createQuoteReviewPrompt(projectData);
    console.log("Gemini API: Created quote review agenda prompt");
    
    // Initialize the Gemini client with API key check
    if (!API_KEY) {
      console.error("Gemini API key is missing or undefined");
      throw new Error("Gemini API key is not configured");
    }
    
    // Get the generative model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      systemInstruction: "You are an expert security system consultant specializing in creating professional quote review meeting agendas."
    });
    
    // Generate content with a structured response format
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{
          text: `${prompt}
            
Please create a comprehensive quote review meeting agenda with the following sections:

1. INTRODUCTION: A brief, professional opening paragraph for the meeting that sets the tone.

2. SCOPE REVIEW: A concise overview of the security project scope.

3. PRICING BREAKDOWN: List 3-5 key pricing points or packages to discuss.

4. TECHNICAL CONSIDERATIONS: List 3-5 important technical points that need clarification or emphasis.

5. TIMELINE: A brief overview of implementation timeline to discuss.

6. NEXT STEPS: List 3-5 clear actionable next steps after this meeting.

7. QUESTIONS TO ASK: List 4-6 important questions to ask the client during the meeting.

Format your response using clear headings, bullet points, and organized structure.`
        }]
      }],
      generationConfig: {
        temperature: 0.2, 
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 4096,
      }
    });
    
    const response = result.response;
    const text = response.text();
    console.log("Gemini API: Quote Review Agenda response length:", text.length);
    console.log("Gemini API: Quote Review Agenda preview:", text.substring(0, 200));
    
    try {
      // Extract sections from the response
      const lines = text.split('\n');
      let sections: Record<string, string[]> = {
        introduction: [],
        scopeReview: [],
        pricingBreakdown: [],
        technicalConsiderations: [],
        timeline: [],
        nextSteps: [],
        questionsToAsk: []
      };
      
      let currentSection = '';
      
      for (const line of lines) {
        const lowerLine = line.toLowerCase();
        
        if (lowerLine.includes('introduction') || lowerLine.includes('opening')) {
          currentSection = 'introduction';
          continue;
        } else if (lowerLine.includes('scope review') || lowerLine.match(/scope\s+of\s+work/)) {
          currentSection = 'scopeReview';
          continue;
        } else if (lowerLine.includes('pricing') || lowerLine.includes('cost') || lowerLine.includes('financial')) {
          currentSection = 'pricingBreakdown';
          continue;
        } else if (lowerLine.includes('technical') || lowerLine.includes('specifications')) {
          currentSection = 'technicalConsiderations';
          continue;
        } else if (lowerLine.includes('timeline') || lowerLine.includes('schedule')) {
          currentSection = 'timeline';
          continue;
        } else if (lowerLine.includes('next steps') || lowerLine.includes('action items')) {
          currentSection = 'nextSteps';
          continue;
        } else if (lowerLine.includes('questions') || lowerLine.includes('clarifications')) {
          currentSection = 'questionsToAsk';
          continue;
        }
        
        // If we're in a section, add the line to it
        if (currentSection && currentSection in sections) {
          sections[currentSection].push(line);
        }
      }
      
      // Extract all bullet points from sections that should be arrays
      const pricingBreakdown = sections.pricingBreakdown
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().match(/^\d+\./))
        .map(line => line.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '').trim());
      
      const technicalConsiderations = sections.technicalConsiderations
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().match(/^\d+\./))
        .map(line => line.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '').trim());
      
      const nextSteps = sections.nextSteps
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().match(/^\d+\./))
        .map(line => line.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '').trim());
      
      const questionsToAsk = sections.questionsToAsk
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().match(/^\d+\./))
        .map(line => line.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '').trim());
      
      // If no bullet points found, try to split by sentences
      const finalPricingBreakdown = pricingBreakdown.length > 0 ? 
        pricingBreakdown : 
        sections.pricingBreakdown.join('\n').split('.').filter(s => s.trim().length > 10).map(s => s.trim());
      
      const finalTechnicalConsiderations = technicalConsiderations.length > 0 ? 
        technicalConsiderations : 
        sections.technicalConsiderations.join('\n').split('.').filter(s => s.trim().length > 10).map(s => s.trim());
      
      const finalNextSteps = nextSteps.length > 0 ? 
        nextSteps : 
        sections.nextSteps.join('\n').split('.').filter(s => s.trim().length > 10).map(s => s.trim());
      
      const finalQuestionsToAsk = questionsToAsk.length > 0 ? 
        questionsToAsk : 
        sections.questionsToAsk.join('\n').split('?').filter(s => s.trim().length > 10).map(s => s.trim() + '?');
      
      return {
        introduction: sections.introduction.join('\n').trim() || "Welcome to our quote review meeting. Today we'll discuss the proposed security solution, review pricing and technical details, and determine next steps.",
        scopeReview: sections.scopeReview.join('\n').trim() || "We'll review the proposed security system installation scope, including all equipment, services, and deliverables.",
        pricingBreakdown: finalPricingBreakdown.length > 0 ? finalPricingBreakdown : ["Base system installation", "Equipment costs", "Optional additions and upgrades", "Ongoing monitoring and maintenance"],
        technicalConsiderations: finalTechnicalConsiderations.length > 0 ? finalTechnicalConsiderations : ["System compatibility with existing infrastructure", "Installation requirements", "Network and power requirements", "Integration capabilities"],
        timeline: sections.timeline.join('\n').trim() || "We will discuss key milestones and the expected timeline for installation, configuration, testing, and handover of the system.",
        nextSteps: finalNextSteps.length > 0 ? finalNextSteps : ["Contract finalization", "Scheduling installation", "Resource allocation", "Project kickoff meeting"],
        questionsToAsk: finalQuestionsToAsk.length > 0 ? finalQuestionsToAsk : ["Do you have any concerns about the proposed solution?", "Are there specific budget constraints we should be aware of?", "What is your preferred timeline for implementation?", "Are there any access restrictions or scheduling considerations for installation?"]
      };
    } catch (e) {
      console.error("Error parsing Gemini response for quote review agenda:", e);
      // Return default structure if parsing fails
      return {
        introduction: "Welcome to our quote review meeting. Today we'll discuss the proposed security solution, review pricing and technical details, and determine next steps.",
        scopeReview: "We'll review the proposed security system installation scope, including all equipment, services, and deliverables.",
        pricingBreakdown: ["Base system installation", "Equipment costs", "Optional additions and upgrades", "Ongoing monitoring and maintenance"],
        technicalConsiderations: ["System compatibility with existing infrastructure", "Installation requirements", "Network and power requirements", "Integration capabilities"],
        timeline: "We will discuss key milestones and the expected timeline for installation, configuration, testing, and handover of the system.",
        nextSteps: ["Contract finalization", "Scheduling installation", "Resource allocation", "Project kickoff meeting"],
        questionsToAsk: ["Do you have any concerns about the proposed solution?", "Are there specific budget constraints we should be aware of?", "What is your preferred timeline for implementation?", "Are there any access restrictions or scheduling considerations for installation?"]
      };
    }
  } catch (error) {
    console.error("Error calling Gemini API for quote review agenda:", error);
    throw new Error(`Failed to generate quote review agenda: ${(error as Error).message}`);
  }
}

// Generate turnover call meeting agenda
export async function generateTurnoverCallAgenda(projectData: any): Promise<TurnoverCallAgendaResult> {
  try {
    // Create a structured prompt with project data
    const prompt = createTurnoverCallPrompt(projectData);
    console.log("Gemini API: Created turnover call agenda prompt");
    
    // Initialize the Gemini client with API key check
    if (!API_KEY) {
      console.error("Gemini API key is missing or undefined");
      throw new Error("Gemini API key is not configured");
    }
    
    // Get the generative model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      systemInstruction: "You are an expert security system consultant specializing in creating professional turnover call meeting agendas for completed security projects."
    });
    
    // Generate content with a structured response format
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{
          text: `${prompt}
          
Please create a comprehensive turnover call meeting agenda with the following sections:

1. INTRODUCTION: A brief, professional opening paragraph for the meeting.

2. PROJECT OVERVIEW: A concise recap of the completed security project.

3. KEY DELIVERABLES: List 3-5 major deliverables that have been completed.

4. SYSTEM COMPONENTS: List 4-6 key components of the installed system that the client should be aware of.

5. TRAINING ITEMS: List 3-5 training points that will be covered during the meeting.

6. SUPPORT INFORMATION: A brief description of ongoing support, including contact information and procedures.

7. CLIENT RESPONSIBILITIES: List 3-5 maintenance or operational tasks that will be the client's responsibility.

8. QUESTIONS TO ADDRESS: List 3-5 common questions to discuss during the meeting.

Format your response using clear headings, bullet points, and organized structure.`
        }]
      }],
      generationConfig: {
        temperature: 0.2, 
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 4096,
      }
    });
    
    const response = result.response;
    const text = response.text();
    console.log("Gemini API: Turnover Call Agenda response length:", text.length);
    console.log("Gemini API: Turnover Call Agenda preview:", text.substring(0, 200));
    
    try {
      // Extract sections from the response
      const lines = text.split('\n');
      let sections: Record<string, string[]> = {
        introduction: [],
        projectOverview: [],
        keyDeliverables: [],
        systemComponents: [],
        trainingItems: [],
        supportInformation: [],
        clientResponsibilities: [],
        questionsToAddress: []
      };
      
      let currentSection = '';
      
      for (const line of lines) {
        const lowerLine = line.toLowerCase();
        
        if (lowerLine.includes('introduction') || lowerLine.includes('opening')) {
          currentSection = 'introduction';
          continue;
        } else if (lowerLine.includes('project overview') || lowerLine.includes('project recap')) {
          currentSection = 'projectOverview';
          continue;
        } else if (lowerLine.includes('key deliverables') || lowerLine.includes('deliverables')) {
          currentSection = 'keyDeliverables';
          continue;
        } else if (lowerLine.includes('system components') || lowerLine.includes('components')) {
          currentSection = 'systemComponents';
          continue;
        } else if (lowerLine.includes('training') || lowerLine.includes('instruction')) {
          currentSection = 'trainingItems';
          continue;
        } else if (lowerLine.includes('support') || lowerLine.includes('assistance')) {
          currentSection = 'supportInformation';
          continue;
        } else if (lowerLine.includes('client responsibilities') || lowerLine.includes('customer responsibilities')) {
          currentSection = 'clientResponsibilities';
          continue;
        } else if (lowerLine.includes('questions') || lowerLine.includes('q&a')) {
          currentSection = 'questionsToAddress';
          continue;
        }
        
        // If we're in a section, add the line to it
        if (currentSection && currentSection in sections) {
          sections[currentSection].push(line);
        }
      }
      
      // Extract all bullet points from sections that should be arrays
      const keyDeliverables = sections.keyDeliverables
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().match(/^\d+\./))
        .map(line => line.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '').trim());
      
      const systemComponents = sections.systemComponents
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().match(/^\d+\./))
        .map(line => line.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '').trim());
      
      const trainingItems = sections.trainingItems
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().match(/^\d+\./))
        .map(line => line.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '').trim());
      
      const clientResponsibilities = sections.clientResponsibilities
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().match(/^\d+\./))
        .map(line => line.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '').trim());
      
      const questionsToAddress = sections.questionsToAddress
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().match(/^\d+\./))
        .map(line => line.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '').trim());
      
      // If no bullet points found, try to split by sentences
      const finalKeyDeliverables = keyDeliverables.length > 0 ? 
        keyDeliverables : 
        sections.keyDeliverables.join('\n').split('.').filter(s => s.trim().length > 10).map(s => s.trim());
      
      const finalSystemComponents = systemComponents.length > 0 ? 
        systemComponents : 
        sections.systemComponents.join('\n').split('.').filter(s => s.trim().length > 10).map(s => s.trim());
      
      const finalTrainingItems = trainingItems.length > 0 ? 
        trainingItems : 
        sections.trainingItems.join('\n').split('.').filter(s => s.trim().length > 10).map(s => s.trim());
      
      const finalClientResponsibilities = clientResponsibilities.length > 0 ? 
        clientResponsibilities : 
        sections.clientResponsibilities.join('\n').split('.').filter(s => s.trim().length > 10).map(s => s.trim());
      
      const finalQuestionsToAddress = questionsToAddress.length > 0 ? 
        questionsToAddress : 
        sections.questionsToAddress.join('\n').split('?').filter(s => s.trim().length > 10).map(s => s.trim() + '?');
      
      return {
        introduction: sections.introduction.join('\n').trim() || "Welcome to our project turnover call. Today we'll review the completed security installation, cover system operation, and ensure you're fully prepared to utilize your new security system.",
        projectOverview: sections.projectOverview.join('\n').trim() || "We'll provide a brief overview of the completed security project, including scope, objectives, and key accomplishments.",
        keyDeliverables: finalKeyDeliverables.length > 0 ? finalKeyDeliverables : ["Fully operational access control system", "Integrated video surveillance system", "Customized security protocols", "System documentation and manuals"],
        systemComponents: finalSystemComponents.length > 0 ? finalSystemComponents : ["Access control readers and controllers", "Security cameras and recording equipment", "Door hardware and locking mechanisms", "System management software", "Reporting and alert systems"],
        trainingItems: finalTrainingItems.length > 0 ? finalTrainingItems : ["System administration basics", "Daily operation procedures", "User management", "Troubleshooting common issues"],
        supportInformation: sections.supportInformation.join('\n').trim() || "We'll provide details on our support services, including emergency contact information, support hours, and the escalation process for technical issues.",
        clientResponsibilities: finalClientResponsibilities.length > 0 ? finalClientResponsibilities : ["Regular system testing", "User account management", "Basic troubleshooting", "Scheduled maintenance coordination"],
        questionsToAddress: finalQuestionsToAddress.length > 0 ? finalQuestionsToAddress : ["How do I add or remove users from the system?", "What should I do if a door isn't working properly?", "How can I access historical reports?", "What's the process for requesting service or support?"]
      };
    } catch (e) {
      console.error("Error parsing Gemini response for turnover call agenda:", e);
      // Return default structure if parsing fails
      return {
        introduction: "Welcome to our project turnover call. Today we'll review the completed security installation, cover system operation, and ensure you're fully prepared to utilize your new security system.",
        projectOverview: "We'll provide a brief overview of the completed security project, including scope, objectives, and key accomplishments.",
        keyDeliverables: ["Fully operational access control system", "Integrated video surveillance system", "Customized security protocols", "System documentation and manuals"],
        systemComponents: ["Access control readers and controllers", "Security cameras and recording equipment", "Door hardware and locking mechanisms", "System management software", "Reporting and alert systems"],
        trainingItems: ["System administration basics", "Daily operation procedures", "User management", "Troubleshooting common issues"],
        supportInformation: "We'll provide details on our support services, including emergency contact information, support hours, and the escalation process for technical issues.",
        clientResponsibilities: ["Regular system testing", "User account management", "Basic troubleshooting", "Scheduled maintenance coordination"],
        questionsToAddress: ["How do I add or remove users from the system?", "What should I do if a door isn't working properly?", "How can I access historical reports?", "What's the process for requesting service or support?"]
      };
    }
  } catch (error) {
    console.error("Error calling Gemini API for turnover call agenda:", error);
    throw new Error(`Failed to generate turnover call agenda: ${(error as Error).message}`);
  }
}

// Configure the model - using Gemini for site walk analysis
export async function generateSiteWalkAnalysis(siteWalkData: any): Promise<AnalysisResult> {
  try {
    // Create a structured prompt with all the site walk data
    const prompt = createAnalysisPrompt(siteWalkData);
    console.log("Gemini API: Created analysis prompt");
    
    // Initialize the Gemini client with API key check
    if (!API_KEY) {
      console.error("Gemini API key is missing or undefined");
      throw new Error("Gemini API key is not configured");
    }
    console.log("Gemini API: API key is configured");
    
    // Get the generative model (Gemini-1.5-pro)
    // Note: gemini-2.0-flash doesn't exist yet, using gemini-1.5-pro instead
    console.log("Gemini API: Initializing model with gemini-1.5-pro");
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      systemInstruction: "You are an expert security system consultant with years of specialized experience in designing and deploying security solutions. You analyze data comprehensively and provide detailed guidance for security projects.",
    });
    
    // Generate content with a structured response format
    console.log("Gemini API: Sending request with temperature: 0.2, topP: 0.9, maxTokens: 4096");
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{
          text: `${prompt}

I need a complete security analysis with these sections:

1. EXECUTIVE SUMMARY: A professional 150-200 word summary of the security project scope, highlighting business value.

2. TECHNICAL ANALYSIS: Detailed technical specifications for installation teams, including requirements, compliance considerations, and best practices. Use sections and bullet points for readability.

3. KEY RECOMMENDATIONS: List 4-6 specific, actionable recommendations to ensure project success.

4. RISK ASSESSMENT: Identify 3-5 potential risks or challenges specific to this project, with detailed mitigation strategies for each.

5. IMPLEMENTATION TIMELINE: A high-level timeline or phasing approach for project execution.

Format your response using clear headings, bullet points, and organized structure.`
        }]
      }],
      generationConfig: {
        temperature: 0.2, 
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 4096,
      }
    });
    
    console.log("Gemini API: Successfully received response");
    
    const response = result.response;
    const text = response.text();
    console.log("Gemini API: Response text length:", text.length);
    
    // Print the first 200 characters of the response for debugging
    console.log("Gemini API: Response preview:", text.substring(0, 200));
    
    try {
      // Use a simpler approach to extract sections by looking for keywords
      const lines = text.split('\n');
      let sections: Record<string, string[]> = {
        summary: [],
        technical: [],
        recommendations: [],
        risks: [],
        timeline: []
      };
      
      let currentSection = '';
      
      for (const line of lines) {
        const lowerLine = line.toLowerCase();
        
        if (lowerLine.includes('executive summary') || lowerLine.includes('executive overview')) {
          currentSection = 'summary';
          continue;
        } else if (lowerLine.includes('technical analysis') || lowerLine.includes('technical details')) {
          currentSection = 'technical';
          continue;
        } else if (lowerLine.includes('key recommendations') || lowerLine.includes('recommendations')) {
          currentSection = 'recommendations';
          continue;
        } else if (lowerLine.includes('risk assessment') || lowerLine.includes('risks')) {
          currentSection = 'risks';
          continue;
        } else if (lowerLine.includes('implementation timeline') || lowerLine.includes('timeline')) {
          currentSection = 'timeline';
          continue;
        }
        
        // If we're in a section, add the line to it
        if (currentSection && currentSection in sections) {
          sections[currentSection].push(line);
        } else if (!currentSection && lowerLine.includes('summary')) {
          // If we're not in a section yet but line contains "summary", assume it's part of the executive summary
          currentSection = 'summary';
          sections[currentSection].push(line);
        }
      }
      
      console.log("Gemini API: Parsed sections", {
        summary: sections.summary.length > 0,
        technical: sections.technical.length > 0,
        recommendations: sections.recommendations.length > 0,
        risks: sections.risks.length > 0,
        timeline: sections.timeline.length > 0
      });
      
      // Extract all bullet points from recommendations section
      const recommendations = sections.recommendations
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().match(/^\d+\./))
        .map(line => line.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '').trim());
      
      // Extract all bullet points from risks section
      const risks = sections.risks
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().match(/^\d+\./))
        .map(line => line.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '').trim());
      
      // If no bullet points found, take everything
      const finalRecommendations = recommendations.length > 0 ? 
        recommendations : 
        sections.recommendations.join('\n').split('.').filter(s => s.trim().length > 10).map(s => s.trim());
      
      const finalRisks = risks.length > 0 ? 
        risks : 
        sections.risks.join('\n').split('.').filter(s => s.trim().length > 10).map(s => s.trim());
      
      return {
        summary: sections.summary.join('\n').trim() || "Executive summary not available",
        detailedAnalysis: sections.technical.join('\n').trim() || "Technical analysis not available",
        recommendations: finalRecommendations.length > 0 ? finalRecommendations : ["No specific recommendations available"],
        risks: finalRisks.length > 0 ? finalRisks : ["No specific risks identified"],
        timeline: sections.timeline.join('\n').trim() || "Timeline information not available"
      };
    } catch (e) {
      console.error("Error parsing Gemini response:", e);
      
      // More sophisticated fallback that attempts to divide the text into relevant sections
      console.log("Gemini API: Using fallback parser");
      const lines = text.split("\n");
      let sections: {
        summary: string[];
        technical: string[];
        recommendations: string[];
        risks: string[];
        timeline: string[];
      } = {
        summary: [],
        technical: [],
        recommendations: [],
        risks: [],
        timeline: []
      };
      
      let currentSection: keyof typeof sections = "summary";
      
      for (const line of lines) {
        if (line.match(/executive\s*summary/i)) {
          currentSection = "summary";
          continue;
        } else if (line.match(/technical\s*analysis/i)) {
          currentSection = "technical";
          continue;
        } else if (line.match(/key\s*recommendations/i)) {
          currentSection = "recommendations";
          continue;
        } else if (line.match(/risk\s*assessment/i)) {
          currentSection = "risks";
          continue;
        } else if (line.match(/implementation\s*timeline/i)) {
          currentSection = "timeline";
          continue;
        }
        
        sections[currentSection].push(line);
      }
      
      // Extract bullet points from recommendations and risks
      const recommendationBullets = sections.recommendations
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
        .map(line => line.replace(/^[-*]\s*/, '').trim());
      
      const riskBullets = sections.risks
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
        .map(line => line.replace(/^[-*]\s*/, '').trim());
      
      return {
        summary: sections.summary.join("\n").trim() || "Executive summary not available",
        detailedAnalysis: sections.technical.join("\n").trim() || "Technical analysis not available",
        recommendations: recommendationBullets.length > 0 ? recommendationBullets : ["No specific recommendations available"],
        risks: riskBullets.length > 0 ? riskBullets : ["No specific risks identified"],
        timeline: sections.timeline.join("\n").trim() || "Timeline information not available"
      };
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error(`Failed to generate site walk analysis: ${(error as Error).message}`);
  }
}

// Helper function to create a prompt for quote review meeting agenda
function createQuoteReviewPrompt(data: any): string {
  const { project, summary, equipment, tooltips } = data;
  
  let prompt = `
# Quote Review Meeting Agenda Request

## Project Information
- Project Name: ${project.name || "Unnamed Project"}
- Client: ${project.client || "N/A"}
- Site Address: ${project.site_address || "N/A"}
- Building Count: ${project.building_count || 1}
- SE Name: ${project.se_name || "N/A"}
- BDM Name: ${project.bdm_name || "N/A"}
- Progress: ${project.progress_percentage || 0}%
- Quote Date: ${new Date().toLocaleDateString()}

## Equipment Summary
- Total Access Points: ${summary.accessPointCount} (Interior: ${summary.interiorAccessPointCount}, Perimeter: ${summary.perimeterAccessPointCount})
- Total Cameras: ${summary.cameraCount} (Indoor: ${summary.indoorCameraCount}, Outdoor: ${summary.outdoorCameraCount})
- Total Elevators/Turnstiles: ${summary.elevatorCount} (Banks: ${summary.elevatorBankCount})
- Total Intercoms: ${summary.intercomCount}

## Scope Information
`;

  // Add configuration options
  // Installation/Hardware Scope
  prompt += "\n### Installation/Hardware Scope\n";
  
  if (project.replace_readers) {
    prompt += `- Replace Readers: Yes - ${tooltips.replace_readers}\n`;
  }
  
  if (project.install_locks) {
    prompt += `- Install Locks: Yes - ${tooltips.install_locks}\n`;
  }
  
  if (project.pull_wire) {
    prompt += `- Pull Wire: Yes - ${tooltips.pull_wire}\n`;
  }
  
  if (project.wireless_locks) {
    prompt += `- Wireless Locks: Yes - ${tooltips.wireless_locks}\n`;
  }
  
  if (project.conduit_drawings) {
    prompt += `- Conduit Drawings: Yes - ${tooltips.conduit_drawings}\n`;
  }
  
  // Access Control/Identity Management
  prompt += "\n### Access Control/Identity Management\n";
  
  if (project.need_credentials) {
    prompt += `- Need Credentials: Yes - ${tooltips.need_credentials}\n`;
  }
  
  if (project.photo_id) {
    prompt += `- Photo ID: Yes - ${tooltips.photo_id}\n`;
  }
  
  if (project.photo_badging) {
    prompt += `- Photo Badging: Yes - ${tooltips.photo_badging}\n`;
  }
  
  if (project.ble) {
    prompt += `- BLE (Mobile Credentials): Yes - ${tooltips.ble}\n`;
  }
  
  // Pricing Information (if available)
  prompt += "\n### Estimated Pricing Information\n";
  prompt += "- Base System: Approximately $" + (summary.accessPointCount * 1500 + summary.cameraCount * 1200 + summary.elevatorCount * 3000 + summary.intercomCount * 1000).toLocaleString() + "\n";
  prompt += "- Installation: Approximately $" + (summary.accessPointCount * 500 + summary.cameraCount * 350 + summary.elevatorCount * 1000 + summary.intercomCount * 400).toLocaleString() + "\n";
  prompt += "- Monitoring (Annual): Approximately $" + (summary.accessPointCount * 120 + summary.cameraCount * 180).toLocaleString() + "\n";
  
  return prompt;
}

// Helper function to create a prompt for turnover call meeting agenda
function createTurnoverCallPrompt(data: any): string {
  const { project, summary, equipment, tooltips } = data;
  
  let prompt = `
# Turnover Call Meeting Agenda Request

## Project Information
- Project Name: ${project.name || "Unnamed Project"}
- Client: ${project.client || "N/A"}
- Site Address: ${project.site_address || "N/A"}
- Building Count: ${project.building_count || 1}
- SE Name: ${project.se_name || "N/A"}
- BDM Name: ${project.bdm_name || "N/A"}
- Progress: ${project.progress_percentage || 0}%
- Completion Date: ${new Date().toLocaleDateString()}

## Installed Equipment Summary
- Total Access Points: ${summary.accessPointCount} (Interior: ${summary.interiorAccessPointCount}, Perimeter: ${summary.perimeterAccessPointCount})
- Total Cameras: ${summary.cameraCount} (Indoor: ${summary.indoorCameraCount}, Outdoor: ${summary.outdoorCameraCount})
- Total Elevators/Turnstiles: ${summary.elevatorCount} (Banks: ${summary.elevatorBankCount})
- Total Intercoms: ${summary.intercomCount}

## System Features
`;

  // Add configuration options
  if (project.replace_readers) {
    prompt += `- New Readers: ${tooltips.replace_readers}\n`;
  }
  
  if (project.wireless_locks) {
    prompt += `- Wireless Locks: ${tooltips.wireless_locks}\n`;
  }
  
  if (project.need_credentials) {
    prompt += `- Credentials System: ${tooltips.need_credentials}\n`;
  }
  
  if (project.photo_id) {
    prompt += `- Photo ID System: ${tooltips.photo_id}\n`;
  }
  
  if (project.photo_badging) {
    prompt += `- Photo Badging: ${tooltips.photo_badging}\n`;
  }
  
  if (project.ble) {
    prompt += `- Mobile Credentials: ${tooltips.ble}\n`;
  }
  
  if (project.visitor) {
    prompt += `- Visitor Management: ${tooltips.visitor}\n`;
  }
  
  // Support Information
  prompt += "\n### Support Information\n";
  prompt += "- Support Contact: Security Systems Support Team\n";
  prompt += "- Support Phone: (800) 555-1234\n";
  prompt += "- Support Email: support@securitysystem.com\n";
  prompt += "- Support Hours: 24/7 for emergencies, 8am-6pm ET for non-emergency support\n";
  
  return prompt;
}

// Helper function to create a comprehensive prompt with all site walk data
function createAnalysisPrompt(data: any): string {
  const { project, summary, equipment, tooltips } = data;
  
  let prompt = `
# Site Walk Analysis Request

## Project Information
- Project Name: ${project.name || "Unnamed Project"}
- Client: ${project.client || "N/A"}
- Site Address: ${project.site_address || "N/A"}
- Building Count: ${project.building_count || 1}
- SE Name: ${project.se_name || "N/A"}
- BDM Name: ${project.bdm_name || "N/A"}
- Progress: ${project.progress_percentage || 0}%
- Notes: ${project.progress_notes || "N/A"}

## Equipment Summary
- Total Access Points: ${summary.accessPointCount} (Interior: ${summary.interiorAccessPointCount}, Perimeter: ${summary.perimeterAccessPointCount})
- Total Cameras: ${summary.cameraCount} (Indoor: ${summary.indoorCameraCount}, Outdoor: ${summary.outdoorCameraCount})
- Total Elevators/Turnstiles: ${summary.elevatorCount} (Banks: ${summary.elevatorBankCount})
- Total Intercoms: ${summary.intercomCount}

## Scope Information
`;

  // Add configuration options
  // Installation/Hardware Scope
  prompt += "\n### Installation/Hardware Scope\n";
  
  if (project.replace_readers) {
    prompt += `- Replace Readers: Yes - ${tooltips.replace_readers}\n`;
  }
  
  if (project.install_locks) {
    prompt += `- Install Locks: Yes - ${tooltips.install_locks}\n`;
  }
  
  if (project.pull_wire) {
    prompt += `- Pull Wire: Yes - ${tooltips.pull_wire}\n`;
  }
  
  if (project.wireless_locks) {
    prompt += `- Wireless Locks: Yes - ${tooltips.wireless_locks}\n`;
  }
  
  if (project.conduit_drawings) {
    prompt += `- Conduit Drawings: Yes - ${tooltips.conduit_drawings}\n`;
  }
  
  // Access Control/Identity Management
  prompt += "\n### Access Control/Identity Management\n";
  
  if (project.need_credentials) {
    prompt += `- Need Credentials: Yes - ${tooltips.need_credentials}\n`;
  }
  
  if (project.photo_id) {
    prompt += `- Photo ID: Yes - ${tooltips.photo_id}\n`;
  }
  
  if (project.photo_badging) {
    prompt += `- Photo Badging: Yes - ${tooltips.photo_badging}\n`;
  }
  
  if (project.ble) {
    prompt += `- BLE (Mobile Credentials): Yes - ${tooltips.ble}\n`;
  }
  
  if (project.test_card) {
    prompt += `- Test Card: Yes - ${tooltips.test_card}\n`;
  }
  
  if (project.visitor) {
    prompt += `- Visitor Management: Yes - ${tooltips.visitor}\n`;
  }
  
  if (project.guard_controls) {
    prompt += `- Guard Controls: Yes - ${tooltips.guard_controls}\n`;
  }
  
  // Site Conditions/Project Planning
  prompt += "\n### Site Conditions/Project Planning\n";
  
  if (project.floorplan) {
    prompt += `- Floorplan Available: Yes - ${tooltips.floorplan}\n`;
  }
  
  if (project.reports_available) {
    prompt += `- Reports Available: Yes - ${tooltips.reports_available}\n`;
  }
  
  if (project.kastle_connect) {
    prompt += `- Kastle Connect: Yes - ${tooltips.kastle_connect}\n`;
  }
  
  if (project.on_site_security) {
    prompt += `- On-site Security: Yes - ${tooltips.on_site_security}\n`;
  }
  
  if (project.takeover) {
    prompt += `- Takeover Project: Yes - ${tooltips.takeover}\n`;
  }
  
  if (project.rush) {
    prompt += `- Rush Project: Yes - ${tooltips.rush}\n`;
  }
  
  if (project.ppi_quote_needed) {
    prompt += `- PPI Quote Needed: Yes - ${tooltips.ppi_quote_needed}\n`;
  }
  
  // Detailed equipment information
  if (equipment?.accessPoints?.length > 0) {
    prompt += "\n## Access Points Details\n";
    equipment.accessPoints.forEach((ap: any, index: number) => {
      prompt += `
### Access Point ${index + 1}: ${ap.location}
- Quick Config: ${ap.quick_config || "N/A"}
- Reader Type: ${ap.reader_type || "N/A"}
- Lock Type: ${ap.lock_type || "N/A"}
- Monitoring Type: ${ap.monitoring_type || "N/A"}
- Lock Provider: ${ap.lock_provider || "N/A"}
- Takeover: ${ap.takeover || "N/A"}
- Interior/Perimeter: ${ap.interior_perimeter || "N/A"}
- Noisy Prop: ${ap.noisy_prop || "N/A"}
- Crashbars: ${ap.crashbars || "N/A"}
- Real Lock Type: ${ap.real_lock_type || "N/A"}
- Existing Panel Location: ${ap.exst_panel_location || "N/A"}
- Existing Panel Type: ${ap.exst_panel_type || "N/A"}
- Existing Reader Type: ${ap.exst_reader_type || "N/A"}
- New Panel Location: ${ap.new_panel_location || "N/A"}
- New Panel Type: ${ap.new_panel_type || "N/A"}
- New Reader Type: ${ap.new_reader_type || "N/A"}
- Notes: ${ap.notes || "N/A"}
`;
    });
  }
  
  if (equipment?.cameras?.length > 0) {
    prompt += "\n## Cameras Details\n";
    equipment.cameras.forEach((camera: any, index: number) => {
      prompt += `
### Camera ${index + 1}: ${camera.location}
- Camera Type: ${camera.camera_type || "N/A"}
- Mounting Type: ${camera.mounting_type || "N/A"}
- Resolution: ${camera.resolution || "N/A"}
- Field of View: ${camera.field_of_view || "N/A"}
- Notes: ${camera.notes || "N/A"}
`;
    });
  }
  
  if (equipment?.elevators?.length > 0) {
    prompt += "\n## Elevators & Turnstiles Details\n";
    equipment.elevators.forEach((elevator: any, index: number) => {
      prompt += `
### Elevator/Turnstile ${index + 1}: ${elevator.location}
- Type: ${elevator.elevator_type || "N/A"}
- Floor Count: ${elevator.floor_count || "N/A"}
- Notes: ${elevator.notes || "N/A"}
`;
    });
  }
  
  if (equipment?.intercoms?.length > 0) {
    prompt += "\n## Intercoms Details\n";
    equipment.intercoms.forEach((intercom: any, index: number) => {
      prompt += `
### Intercom ${index + 1}: ${intercom.location}
- Type: ${intercom.intercom_type || "N/A"}
- Notes: ${intercom.notes || "N/A"}
`;
    });
  }
  
  // Instructions for the AI
  prompt += `
## Analysis Instructions
1. Analyze this security installation project and provide insights
2. Consider the scope, equipment types, and specific configuration requirements
3. Identify potential challenges based on the site conditions
4. Provide installation guidance and recommendations for the technician team
5. Highlight any special requirements based on configuration options
`;

  return prompt;
}