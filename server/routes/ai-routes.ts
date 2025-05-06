import { Router } from 'express';
import { storage } from '../storage';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Mock AI response function - in production this would connect to Google's Gemini API
const generateAIResponse = async (
  message: string, 
  history: ChatMessage[], 
  projectId?: number
): Promise<string> => {
  console.log('Generating AI response for:', message);
  console.log('Project ID:', projectId);
  console.log('Message history:', history);
  
  // This is a simulation - in production we would call the Gemini API
  // Sample responses based on keywords in the message
  const keywords = {
    camera: [
      "For camera placement in the lobby, I recommend installing a 4K dome camera with 360° coverage to monitor all entrance points. Would you like to place this camera on the ceiling or wall?",
      "Based on the floor plan, a PTZ camera would work well in that area. It can provide both wide-angle views and detailed zoom capabilities when needed. What specific areas need coverage?"
    ],
    access: [
      "For access control, I suggest using an HID reader with dual authentication. Where would you like to place this access point?",
      "An electromagnetic lock would be appropriate for this door. Would you prefer a surface-mounted or concealed installation?"
    ],
    intercom: [
      "For the intercom system, I recommend a cloud-based VoIP intercom with video capabilities. This would allow remote access and monitoring. Does that meet your requirements?",
      "A wall-mounted intercom panel with access control integration would work well at the main entrance. Would you like it to include a camera as well?"
    ],
    elevator: [
      "I suggest adding an elevator control unit that integrates with your access control system. This would restrict floor access based on credentials. Which floors need restricted access?",
      "For elevator security, we could implement a card reader inside each elevator cab with destination dispatch capabilities. Would that meet your requirements?"
    ]
  };
  
  // Find matching keywords and generate responses
  let response = "I'll help you configure that security equipment. Could you provide more details about what you need?";
  
  for (const [keyword, responses] of Object.entries(keywords)) {
    if (message.toLowerCase().includes(keyword)) {
      response = responses[Math.floor(Math.random() * responses.length)];
      break;
    }
  }
  
  // If this is the first message, provide a more comprehensive introduction
  if (history.length <= 1) {
    response = `Thanks for your question about ${message.toLowerCase().includes('camera') ? 'cameras' : 'security equipment'}. ${response} I can help you configure all types of security equipment including cameras, access points, intercoms, and elevator controls. Would you like me to explain more about any specific type?`;
  }
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return response;
};

export function setupAIRoutes(router: Router) {
  // Chat endpoint for AI assistant
  router.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, history, projectId } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }
      
      // Generate AI response
      const response = await generateAIResponse(message, history || [], projectId);
      
      return res.json({ response });
    } catch (error) {
      console.error('Error in AI chat endpoint:', error);
      return res.status(500).json({ error: 'Failed to generate AI response' });
    }
  });
  
  // Endpoint for speech recognition (for demo purposes)
  router.post('/api/ai/speech-to-text', async (req, res) => {
    try {
      // In a real implementation, this would process audio data
      // and return the transcribed text using Google Cloud Speech API
      const { audio } = req.body;
      
      if (!audio) {
        return res.status(400).json({ error: 'Audio data is required' });
      }
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demonstration, return a simulated transcript
      return res.json({ 
        transcript: "I need to add a camera in the lobby area near the front entrance."
      });
    } catch (error) {
      console.error('Error in speech-to-text endpoint:', error);
      return res.status(500).json({ error: 'Failed to process speech' });
    }
  });
  
  // Add equipment based on AI recommendation
  router.post('/api/ai/add-equipment', async (req, res) => {
    try {
      const { equipmentType, properties, projectId, floorplanId } = req.body;
      
      if (!equipmentType || !projectId) {
        return res.status(400).json({ error: 'Equipment type and project ID are required' });
      }
      
      // In production, this would add the equipment to the database
      console.log(`Adding ${equipmentType} to project ${projectId}:`, properties);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Return success response with simulated ID
      return res.json({ 
        success: true, 
        message: `Added ${equipmentType} successfully`,
        equipmentId: Math.floor(Math.random() * 10000) // Simulated ID
      });
    } catch (error) {
      console.error('Error in add-equipment endpoint:', error);
      return res.status(500).json({ error: 'Failed to add equipment' });
    }
  });
}