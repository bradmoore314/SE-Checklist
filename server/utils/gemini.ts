import { GoogleGenerativeAI } from "@google/generative-ai";

// Access the API key from environment variables
const API_KEY = process.env.GEMINI_API_KEY;

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(API_KEY!);

// Configure the model - using Gemini 1.5 Pro for advanced analysis
export async function generateSiteWalkAnalysis(siteWalkData: any): Promise<{summary: string, detailedAnalysis: string}> {
  try {
    // Create a structured prompt with all the site walk data
    const prompt = createAnalysisPrompt(siteWalkData);
    
    // Get the generative model (Gemini-1.5-flash)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });
    
    // Generate content with a structured response format
    const result = await model.generateContent(`
      ${prompt}
      
      Please provide two separate responses:
      1. A concise summary (150-200 words) describing the scope of work for this security project.
      2. A detailed technical analysis with enough specific information that a technician could use it for installation guidance.
      
      Format your response as a JSON object with two properties: "summary" and "detailedAnalysis".
    `);
    
    const response = result.response;
    const text = response.text();
    
    // Parse the JSON from the response
    // Sometimes the model might not perfectly format JSON, so we need to handle that
    try {
      // Try to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const parsedData = JSON.parse(jsonStr);
        return {
          summary: parsedData.summary || "Summary not available",
          detailedAnalysis: parsedData.detailedAnalysis || "Detailed analysis not available"
        };
      } else {
        // If no JSON format is found, try to extract sections manually
        const summaryMatch = text.match(/summary:?\s*([\s\S]*?)(?=detailed|$)/i);
        const detailedMatch = text.match(/detailed\s*analysis:?\s*([\s\S]*)/i);
        
        return {
          summary: summaryMatch ? summaryMatch[1].trim() : "Summary not available",
          detailedAnalysis: detailedMatch ? detailedMatch[1].trim() : "Detailed analysis not available"
        };
      }
    } catch (e) {
      console.error("Error parsing Gemini response:", e);
      
      // Fallback: split the text roughly into summary and details
      const lines = text.split("\n");
      const summaryLines = lines.slice(0, Math.min(10, Math.floor(lines.length / 5)));
      const detailLines = lines.slice(Math.min(10, Math.floor(lines.length / 5)));
      
      return {
        summary: summaryLines.join("\n").trim() || "Summary not available",
        detailedAnalysis: detailLines.join("\n").trim() || "Detailed analysis not available"
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