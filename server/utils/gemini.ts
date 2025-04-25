import { GoogleGenerativeAI } from "@google/generative-ai";

// Access the API key from environment variables
const API_KEY = process.env.GEMINI_API_KEY;

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(API_KEY!);

// Configure the model - using Gemini 1.5 Pro for advanced analysis
export async function generateSiteWalkAnalysis(siteWalkData: any): Promise<{summary: string, detailedAnalysis: string, recommendations: string[], risks: string[], timeline: string}> {
  try {
    // Create a structured prompt with all the site walk data
    const prompt = createAnalysisPrompt(siteWalkData);
    
    // Get the generative model (Gemini-1.5-flash)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });
    
    // Generate content with a structured response format
    const result = await model.generateContent(
      {
        contents: [{
          role: "user",
          parts: [{
            text: `${prompt}
            
You are an expert security system consultant with years of specialized experience in designing and deploying security solutions. Please analyze the given project data comprehensively.

I need a complete, well-structured analysis with the following sections:

1. EXECUTIVE SUMMARY: Write a crisp, professional 150-200 word summary describing the scope of the security project, focused on business value.

2. TECHNICAL ANALYSIS: Create a detailed technical analysis that would help an installation team successfully implement this project. Include specific requirements, standards compliance considerations, and best practices for installation. Structure this with clear sections and bullet points for better readability.

3. KEY RECOMMENDATIONS: Provide 4-6 concrete, actionable recommendations to ensure project success.

4. RISK ASSESSMENT: Identify 3-5 potential risks or challenges specific to this project, with mitigation strategies for each.

5. IMPLEMENTATION TIMELINE: Suggest a high-level timeline or phasing approach for the project.

Format your response using Markdown for proper structure with headings, bullet points, and emphasis where appropriate.`
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 4096,
        }
      }
    );
    
    const response = result.response;
    const text = response.text();
    
    try {
      // Extract each section using regex patterns
      const execSummaryMatch = text.match(/#+\s*EXECUTIVE\s*SUMMARY\s*\n+([\s\S]*?)(?=#+\s*TECHNICAL|$)/i);
      const technicalMatch = text.match(/#+\s*TECHNICAL\s*ANALYSIS\s*\n+([\s\S]*?)(?=#+\s*KEY\s*RECOMMENDATIONS|$)/i);
      const recommendationsMatch = text.match(/#+\s*KEY\s*RECOMMENDATIONS\s*\n+([\s\S]*?)(?=#+\s*RISK|$)/i);
      const risksMatch = text.match(/#+\s*RISK\s*ASSESSMENT\s*\n+([\s\S]*?)(?=#+\s*IMPLEMENTATION|$)/i);
      const timelineMatch = text.match(/#+\s*IMPLEMENTATION\s*TIMELINE\s*\n+([\s\S]*?)(?=$)/i);
      
      // Extract recommendations as array of bullet points
      const recommendationsText = recommendationsMatch ? recommendationsMatch[1].trim() : "";
      const recommendations = recommendationsText.split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
        .map(line => line.replace(/^[-*]\s*/, '').trim());
      
      // Extract risks as array of bullet points
      const risksText = risksMatch ? risksMatch[1].trim() : "";
      const risks = risksText.split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
        .map(line => line.replace(/^[-*]\s*/, '').trim());
      
      return {
        summary: execSummaryMatch ? execSummaryMatch[1].trim() : "Executive summary not available",
        detailedAnalysis: technicalMatch ? technicalMatch[1].trim() : "Technical analysis not available",
        recommendations: recommendations.length > 0 ? recommendations : ["No specific recommendations available"],
        risks: risks.length > 0 ? risks : ["No specific risks identified"],
        timeline: timelineMatch ? timelineMatch[1].trim() : "Timeline information not available"
      };
    } catch (e) {
      console.error("Error parsing Gemini response:", e);
      
      // More sophisticated fallback that attempts to divide the text into relevant sections
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
    throw new Error("Failed to generate site walk analysis");
  }
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