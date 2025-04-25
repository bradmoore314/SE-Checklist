// Test script for Gemini API functionality
import { generateSiteWalkAnalysis } from '../utils/gemini';

// Sample data that mimics what the API would receive
const sampleData = {
  project: {
    id: 1,
    name: "Test Project",
    client: "Test Client",
    site_address: "123 Test St",
    building_count: 2,
    se_name: "Test SE",
    bdm_name: "Test BDM",
    progress_percentage: 50,
    progress_notes: "In progress",
    replace_readers: true,
    install_locks: true,
    pull_wire: false,
    wireless_locks: false,
    conduit_drawings: true
  },
  summary: {
    accessPointCount: 3,
    interiorAccessPointCount: 2,
    perimeterAccessPointCount: 1,
    cameraCount: 3,
    indoorCameraCount: 2,
    outdoorCameraCount: 1,
    elevatorCount: 1,
    elevatorBankCount: 1,
    intercomCount: 1,
    totalEquipmentCount: 8
  },
  equipment: {
    accessPoints: [
      { id: 1, project_id: 1, location: "Main Entrance", quick_config: "Standard", reader_type: "KR-RP40", lock_type: "Magnetic", monitoring_type: "Standard", interior_perimeter: "Perimeter" },
      { id: 2, project_id: 1, location: "Office Door", quick_config: "Standard", reader_type: "KR-RP40", lock_type: "Electric Strike", monitoring_type: "Standard", interior_perimeter: "Interior" },
      { id: 3, project_id: 1, location: "Server Room", quick_config: "Standard", reader_type: "KR-RP40", lock_type: "Electric Strike", monitoring_type: "Standard", interior_perimeter: "Interior" }
    ],
    cameras: [
      { id: 1, project_id: 1, location: "Front Entrance", camera_type: "Fixed Dome", mounting_type: "Indoor Wall Mount", resolution: "4MP" },
      { id: 2, project_id: 1, location: "Parking Lot", camera_type: "PTZ", mounting_type: "Outdoor Pole Mount", resolution: "8MP" },
      { id: 3, project_id: 1, location: "Hallway", camera_type: "Fixed Dome", mounting_type: "Indoor Ceiling Mount", resolution: "4MP" }
    ],
    elevators: [
      { id: 1, project_id: 1, location: "Main Elevator", elevator_type: "Destination Dispatch", floor_count: 10 }
    ],
    intercoms: [
      { id: 1, project_id: 1, location: "Front Gate", intercom_type: "Audio/Video" }
    ]
  },
  tooltips: {
    replace_readers: "Installation/Hardware Scope: Existing readers are being swapped out. Consider compatibility with existing wiring and backboxes.",
    install_locks: "Installation/Hardware Scope: New locks are being installed as part of the project.",
    pull_wire: "Installation/Hardware Scope: New wiring is required for some or all devices.",
    wireless_locks: "Installation/Hardware Scope: Project includes wireless locks that communicate via gateway.",
    conduit_drawings: "Installation/Hardware Scope: Project requires identification of conduit pathways."
  }
};

// Test function
async function testGeminiAPI() {
  console.log("============ GEMINI API TEST ============");
  
  // Check if API key is configured
  if (!process.env.GEMINI_API_KEY) {
    console.error("ERROR: GEMINI_API_KEY is not defined in environment variables");
    return;
  }
  
  console.log("API Key is configured ✓");
  console.log("Making test request to Gemini API...");
  
  try {
    const startTime = Date.now();
    console.log("Request started at:", new Date(startTime).toISOString());
    
    // Call the API with our sample data
    const result = await generateSiteWalkAnalysis(sampleData);
    
    const endTime = Date.now();
    console.log("Request completed at:", new Date(endTime).toISOString());
    console.log("Total time:", (endTime - startTime) / 1000, "seconds");
    
    // Check response structure
    console.log("\nResponse structure check:");
    console.log("- summary:", typeof result.summary === 'string' ? "✓" : "✗");
    console.log("- detailedAnalysis:", typeof result.detailedAnalysis === 'string' ? "✓" : "✗");
    console.log("- recommendations:", Array.isArray(result.recommendations) ? "✓" : "✗");
    console.log("- risks:", Array.isArray(result.risks) ? "✓" : "✗");
    console.log("- timeline:", typeof result.timeline === 'string' ? "✓" : "✗");
    
    // Check content length
    console.log("\nContent length check:");
    console.log("- summary:", result.summary.length, "chars");
    console.log("- detailedAnalysis:", result.detailedAnalysis.length, "chars");
    console.log("- recommendations:", result.recommendations.length, "items");
    console.log("- risks:", result.risks.length, "items");
    console.log("- timeline:", result.timeline.length, "chars");
    
    // Check for default values
    console.log("\nChecking for default values:");
    const hasDefaultSummary = result.summary === "Executive summary not available";
    const hasDefaultAnalysis = result.detailedAnalysis === "Technical analysis not available";
    const hasDefaultRecs = result.recommendations.length === 1 && result.recommendations[0] === "No specific recommendations available";
    const hasDefaultRisks = result.risks.length === 1 && result.risks[0] === "No specific risks identified";
    const hasDefaultTimeline = result.timeline === "Timeline information not available";
    
    console.log("- Using default summary:", hasDefaultSummary ? "YES ⚠️" : "NO ✓");
    console.log("- Using default analysis:", hasDefaultAnalysis ? "YES ⚠️" : "NO ✓");
    console.log("- Using default recommendations:", hasDefaultRecs ? "YES ⚠️" : "NO ✓");
    console.log("- Using default risks:", hasDefaultRisks ? "YES ⚠️" : "NO ✓");
    console.log("- Using default timeline:", hasDefaultTimeline ? "YES ⚠️" : "NO ✓");
    
    // Show sample of actual response content
    console.log("\nSample of response content:");
    console.log("--- SUMMARY EXCERPT ---");
    console.log(result.summary.substring(0, 200) + "...");
    
    console.log("\n--- RECOMMENDATIONS SAMPLE ---");
    for (let i = 0; i < Math.min(2, result.recommendations.length); i++) {
      console.log(`${i+1}. ${result.recommendations[i]}`);
    }
    
    // Determine if test passed
    const testPassed = !hasDefaultSummary && !hasDefaultAnalysis && !hasDefaultRecs && !hasDefaultRisks && !hasDefaultTimeline;
    console.log("\n==================================");
    console.log(testPassed ? "✅ TEST PASSED: Gemini API returned real content" : "❌ TEST FAILED: Gemini API returned default placeholders");
    console.log("==================================\n");
    
  } catch (error) {
    console.error("❌ ERROR in Gemini API test:", error);
    console.log("\n==================================");
    console.log("❌ TEST FAILED: Exception occurred");
    console.log("==================================\n");
  }
}

// Run the test
testGeminiAPI().catch(console.error);