/**
 * Smart AI service that uses the configured provider (Gemini or Azure OpenAI)
 */
import { AI_CONFIG } from '../config';
import { 
  generateSiteWalkAnalysis as generateGeminiSiteWalkAnalysis,
  generateQuoteReviewAgenda as generateGeminiQuoteReviewAgenda,
  generateTurnoverCallAgenda as generateGeminiTurnoverCallAgenda
} from '../utils/gemini';
import { 
  generateSiteWalkAnalysis as generateAzureSiteWalkAnalysis,
  generateQuoteReviewAgenda as generateAzureQuoteReviewAgenda,
  generateTurnoverCallAgenda as generateAzureTurnoverCallAgenda
} from '../utils/azure-openai';

/**
 * Generate site walk analysis using the preferred AI provider
 */
export async function generateSiteWalkAnalysis(
  projectName: string,
  projectDescription: string,
  buildingCount: number,
  accessPointCount: number,
  cameraCount: number,
  clientRequirements: string,
  specialConsiderations: string,
  forceProvider?: 'azure' | 'gemini' // Optional parameter to force a specific provider
) {
  // Determine which provider to use
  const provider = forceProvider || AI_CONFIG.getActiveProvider();
  
  if (provider === 'azure' && AI_CONFIG.isAzureConfigured()) {
    const result = await generateAzureSiteWalkAnalysis(
      projectName,
      projectDescription,
      buildingCount,
      accessPointCount,
      cameraCount,
      clientRequirements,
      specialConsiderations
    );
    return { ...result, provider: 'azure' };
  } else if (provider === 'gemini' && AI_CONFIG.isGeminiConfigured()) {
    const result = await generateGeminiSiteWalkAnalysis(
      projectName,
      projectDescription,
      buildingCount,
      accessPointCount,
      cameraCount,
      clientRequirements,
      specialConsiderations
    );
    return { ...result, provider: 'gemini' };
  } else {
    throw new Error('No AI provider configured');
  }
}

/**
 * Generate quote review agenda using the preferred AI provider
 */
export async function generateQuoteReviewAgenda(
  projectName: string,
  projectDescription: string,
  quoteDetails: string,
  clientBackground: string,
  forceProvider?: 'azure' | 'gemini' // Optional parameter to force a specific provider
) {
  // Determine which provider to use
  const provider = forceProvider || AI_CONFIG.getActiveProvider();
  
  if (provider === 'azure' && AI_CONFIG.isAzureConfigured()) {
    const result = await generateAzureQuoteReviewAgenda(
      projectName,
      projectDescription,
      quoteDetails,
      clientBackground
    );
    return { ...result, provider: 'azure' };
  } else if (provider === 'gemini' && AI_CONFIG.isGeminiConfigured()) {
    const result = await generateGeminiQuoteReviewAgenda(
      projectName,
      projectDescription,
      quoteDetails,
      clientBackground
    );
    return { ...result, provider: 'gemini' };
  } else {
    throw new Error('No AI provider configured');
  }
}

/**
 * Generate turnover call agenda using the preferred AI provider
 */
export async function generateTurnoverCallAgenda(
  projectName: string,
  projectDescription: string,
  installationDetails: string,
  clientNeeds: string,
  forceProvider?: 'azure' | 'gemini' // Optional parameter to force a specific provider
) {
  // Determine which provider to use
  const provider = forceProvider || AI_CONFIG.getActiveProvider();
  
  if (provider === 'azure' && AI_CONFIG.isAzureConfigured()) {
    const result = await generateAzureTurnoverCallAgenda(
      projectName,
      projectDescription,
      installationDetails,
      clientNeeds
    );
    return { ...result, provider: 'azure' };
  } else if (provider === 'gemini' && AI_CONFIG.isGeminiConfigured()) {
    const result = await generateGeminiTurnoverCallAgenda(
      projectName,
      projectDescription,
      installationDetails,
      clientNeeds
    );
    return { ...result, provider: 'gemini' };
  } else {
    throw new Error('No AI provider configured');
  }
}