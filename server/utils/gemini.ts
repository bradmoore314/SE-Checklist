import fetch from 'node-fetch';

// Access the API key from environment variables
const API_KEY = process.env.GEMINI_API_KEY;

// Define the API endpoint with the correct model
const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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

// Generate site walk analysis
export async function generateSiteWalkAnalysis(projectData: any): Promise<AnalysisResult> {
  try {
    // Create a structured prompt with project data
    const prompt = createSiteWalkAnalysisPrompt(projectData);
    console.log("Gemini API: Created site walk analysis prompt");
    
    // Initialize the Gemini client with API key check
    if (!API_KEY) {
      console.error("Gemini API key is missing or undefined");
      throw new Error("Gemini API key is not configured");
    }
    
    // Create the API request with the provided URL and API key
    const url = `${API_ENDPOINT}?key=${API_KEY}`;
    
    // Build the request payload
    const payload = {
      contents: [{
        parts: [{
          text: `You are an expert security system consultant specializing in analyzing site walk data.
          
          Please provide a comprehensive analysis of the following project data:
          
          ${prompt}
          
          IMPORTANT: Your analysis MUST accurately describe ONLY the equipment that is actually listed in the data above. If the data shows specific access points, cameras, or other equipment, acknowledge their presence and analyze them accordingly.
          
          Structure your response as a JSON object with the following keys:
          {
            "summary": "A concise executive summary of the security system setup that accurately reflects the equipment shown in the data",
            "detailedAnalysis": "Detailed technical analysis of the existing system components and integration",
            "recommendations": ["A list of key recommendations for improving the system"], 
            "risks": ["A list of potential risks or vulnerabilities"],
            "timeline": "A suggested implementation timeline"
          }
          
          Be thorough but concise in your analysis. Ensure you mention exactly how many access points, cameras, elevators, and intercoms are in the data.`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192
      }
    };
    
    console.log("Gemini API: Sending site walk analysis request");
    
    // Make the API request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    // Process the response
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      throw new Error(`Failed to generate site walk analysis: Gemini API returned status ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log("Gemini API: Received site walk analysis response");
    
    // Extract and parse the JSON content from the response
    const content = responseData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!content) {
      throw new Error("Empty response from Gemini API");
    }
    
    // Try to parse the JSON response
    try {
      // Find JSON content in the response (it might be embedded in other text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON content found in the response");
      }
      
      const jsonContent = jsonMatch[0];
      return JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
      throw new Error("Failed to parse Gemini response as JSON");
    }
  } catch (error) {
    console.error("Error generating site walk analysis:", error);
    throw error;
  }
}

// Helper function to create a structured prompt for site walk analysis
function createSiteWalkAnalysisPrompt(projectData: any): string {
  // Log the structure of the data to help debug
  console.log("Gemini API: Analyzing project data structure", {
    hasProject: !!projectData.project,
    hasEquipment: !!projectData.equipment,
    hasSummary: !!projectData.summary,
    accessPointCount: projectData.summary?.accessPointCount,
    cameraCount: projectData.summary?.cameraCount
  });
  
  return `
    Project Information:
    - Project Name: ${projectData.project?.name || 'Not specified'}
    - Client: ${projectData.project?.client || 'Not specified'}
    - Location: ${projectData.project?.site_address || 'Not specified'}
    
    Equipment Summary:
    - Access Points: ${projectData.summary?.accessPointCount || 0} (Interior: ${projectData.summary?.interiorAccessPointCount || 0}, Perimeter: ${projectData.summary?.perimeterAccessPointCount || 0})
    - Cameras: ${projectData.summary?.cameraCount || 0} (Indoor: ${projectData.summary?.indoorCameraCount || 0}, Outdoor: ${projectData.summary?.outdoorCameraCount || 0})
    - Elevators/Turnstiles: ${projectData.summary?.elevatorCount || 0}
    - Intercoms: ${projectData.summary?.intercomCount || 0}
    - Total Equipment: ${projectData.summary?.totalEquipmentCount || 0}
    
    Access Points: ${projectData.equipment?.accessPoints?.length || 0}
    ${projectData.equipment?.accessPoints?.map((ap: any, index: number) => `
      ${index + 1}. ${ap.location || 'Unknown location'}
      - Reader Type: ${ap.reader_type || 'Not specified'}
      - Lock Type: ${ap.lock_type || 'Not specified'}
      - Monitoring Type: ${ap.monitoring_type || 'Not specified'}
      - Takeover: ${ap.takeover || 'No'}
    `).join('') || 'No access points specified'}
    
    Cameras: ${projectData.equipment?.cameras?.length || 0}
    ${projectData.equipment?.cameras?.map((cam: any, index: number) => `
      ${index + 1}. ${cam.location || 'Unknown location'}
      - Camera Type: ${cam.camera_type || 'Not specified'}
      - Resolution: ${cam.resolution || 'Not specified'}
      - Mounting: ${cam.mounting || 'Not specified'}
    `).join('') || 'No cameras specified'}
    
    Elevators: ${projectData.equipment?.elevators?.length || 0}
    ${projectData.equipment?.elevators?.map((el: any, index: number) => `
      ${index + 1}. ${el.location || 'Unknown location'}
      - Elevator Type: ${el.elevator_type || 'Not specified'}
      - Floor Count: ${el.floor_count || 'Not specified'}
    `).join('') || 'No elevators specified'}
    
    Intercoms: ${projectData.equipment?.intercoms?.length || 0}
    ${projectData.equipment?.intercoms?.map((ic: any, index: number) => `
      ${index + 1}. ${ic.location || 'Unknown location'}
      - Intercom Type: ${ic.intercom_type || 'Not specified'}
    `).join('') || 'No intercoms specified'}
  `;
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
    
    // Create the API request with the provided URL and API key
    const url = `${API_ENDPOINT}?key=${API_KEY}`;
    
    // Build the request payload
    const payload = {
      contents: [{
        parts: [{
          text: `You are an expert security system consultant specializing in creating professional quote review meeting agendas.
          
${prompt}
            
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
        maxOutputTokens: 4096
      }
    };
    
    // Make the API request
    console.log("Calling Gemini API endpoint:", API_ENDPOINT);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API error:", errorData);
      throw new Error(`Gemini API returned status ${response.status}: ${errorData}`);
    }
    
    const result = await response.json();
    
    // Extract the text from the response
    const text = result.candidates[0].content.parts[0].text;
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
    
    // Create the API request with the provided URL and API key
    const url = `${API_ENDPOINT}?key=${API_KEY}`;
    
    // Build the request payload
    const payload = {
      contents: [{
        parts: [{
          text: `You are an expert security system consultant specializing in creating professional turnover call meeting agendas.
          
${prompt}
            
Please create a comprehensive turnover call meeting agenda with the following sections:

1. INTRODUCTION: A brief, professional opening paragraph for the meeting that sets the tone.

2. PROJECT OVERVIEW: A concise overview of the completed security project.

3. KEY DELIVERABLES: List 3-5 key deliverables that have been installed or configured.

4. SYSTEM COMPONENTS: List 3-5 main components of the security system to discuss.

5. TRAINING ITEMS: List 3-5 specific training topics to cover during the call.

6. SUPPORT INFORMATION: Provide contact information and hours for support.

7. CLIENT RESPONSIBILITIES: List 3-5 ongoing responsibilities for the client.

8. QUESTIONS TO ADDRESS: List 4-6 common questions to proactively address with the client.

Format your response using clear headings, bullet points, and organized structure.`
        }]
      }],
      generationConfig: {
        temperature: 0.2,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 4096
      }
    };
    
    // Make the API request
    console.log("Calling Gemini API endpoint:", API_ENDPOINT);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API error:", errorData);
      throw new Error(`Gemini API returned status ${response.status}: ${errorData}`);
    }
    
    const result = await response.json();
    
    // Extract the text from the response
    const text = result.candidates[0].content.parts[0].text;
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
        } else if (lowerLine.includes('project overview') || lowerLine.match(/overview\s+of\s+project/)) {
          currentSection = 'projectOverview';
          continue;
        } else if (lowerLine.includes('key deliverables') || lowerLine.includes('deliverables')) {
          currentSection = 'keyDeliverables';
          continue;
        } else if (lowerLine.includes('system components') || lowerLine.includes('components')) {
          currentSection = 'systemComponents';
          continue;
        } else if (lowerLine.includes('training')) {
          currentSection = 'trainingItems';
          continue;
        } else if (lowerLine.includes('support')) {
          currentSection = 'supportInformation';
          continue;
        } else if (lowerLine.includes('client responsibilities') || lowerLine.includes('responsibilities')) {
          currentSection = 'clientResponsibilities';
          continue;
        } else if (lowerLine.includes('questions') || lowerLine.includes('address')) {
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
        introduction: sections.introduction.join('\n').trim() || "Welcome to our turnover call. Today we'll review the completed security system installation, provide training on key components, and answer any questions you may have.",
        projectOverview: sections.projectOverview.join('\n').trim() || "We have successfully completed the installation of your security system according to the agreed specifications.",
        keyDeliverables: finalKeyDeliverables.length > 0 ? finalKeyDeliverables : ["Access control system", "Video surveillance system", "Intercom system", "System documentation and user guides"],
        systemComponents: finalSystemComponents.length > 0 ? finalSystemComponents : ["Card readers and electronic locks", "IP cameras and NVR", "Control panels and processors", "Management software"],
        trainingItems: finalTrainingItems.length > 0 ? finalTrainingItems : ["User management and access levels", "Video footage review and export", "System administration", "Routine maintenance procedures"],
        supportInformation: sections.supportInformation.join('\n').trim() || "Our technical support team is available 24/7. Please contact us at support@example.com or call 1-800-555-0123 for assistance.",
        clientResponsibilities: finalClientResponsibilities.length > 0 ? finalClientResponsibilities : ["Regular system testing", "User management", "Backup procedures", "Reporting issues promptly"],
        questionsToAddress: finalQuestionsToAddress.length > 0 ? finalQuestionsToAddress : ["What happens if there's a power outage?", "How do we add or remove users?", "What maintenance is required?", "How do we request service or support?"]
      };
    } catch (e) {
      console.error("Error parsing Gemini response for turnover call agenda:", e);
      // Return default structure if parsing fails
      return {
        introduction: "Welcome to our turnover call. Today we'll review the completed security system installation, provide training on key components, and answer any questions you may have.",
        projectOverview: "We have successfully completed the installation of your security system according to the agreed specifications.",
        keyDeliverables: ["Access control system", "Video surveillance system", "Intercom system", "System documentation and user guides"],
        systemComponents: ["Card readers and electronic locks", "IP cameras and NVR", "Control panels and processors", "Management software"],
        trainingItems: ["User management and access levels", "Video footage review and export", "System administration", "Routine maintenance procedures"],
        supportInformation: "Our technical support team is available 24/7. Please contact us at support@example.com or call 1-800-555-0123 for assistance.",
        clientResponsibilities: ["Regular system testing", "User management", "Backup procedures", "Reporting issues promptly"],
        questionsToAddress: ["What happens if there's a power outage?", "How do we add or remove users?", "What maintenance is required?", "How do we request service or support?"]
      };
    }
  } catch (error) {
    console.error("Error calling Gemini API for turnover call agenda:", error);
    throw new Error(`Failed to generate turnover call agenda: ${(error as Error).message}`);
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

## Configuration Information
`;

  // Add configuration options
  // Installation/Hardware Scope
  prompt += "\n### Installation/Hardware Details\n";
  
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
  
  // Site Conditions
  prompt += "\n### Site Conditions & Special Considerations\n";
  
  if (project.kastle_connect) {
    prompt += `- Kastle Connect: Yes - ${tooltips.kastle_connect}\n`;
  }
  
  if (project.on_site_security) {
    prompt += `- On-site Security: Yes - ${tooltips.on_site_security}\n`;
  }
  
  if (project.takeover) {
    prompt += `- Takeover Project: Yes - ${tooltips.takeover}\n`;
  }
  
  return prompt;
}