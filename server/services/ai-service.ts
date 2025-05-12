/**
 * AI service using Azure OpenAI in Kastle's secure Azure environment
 */
import { AI_CONFIG } from '../config';
import { 
  generateSiteWalkAnalysis as generateAzureSiteWalkAnalysis,
  generateQuoteReviewAgenda as generateAzureQuoteReviewAgenda,
  generateTurnoverCallAgenda as generateAzureTurnoverCallAgenda
} from '../utils/azure-openai';

/**
 * Generate site walk analysis using Kastle's secure Azure OpenAI
 */
export async function generateSiteWalkAnalysis(
  projectName: string,
  projectDescription: string,
  buildingCount: number,
  accessPointCount: number,
  cameraCount: number,
  clientRequirements: string,
  specialConsiderations: string
) {
  // Check if Azure OpenAI is configured
  if (!AI_CONFIG.isAzureConfigured()) {
    throw new Error('Azure OpenAI is not configured');
  }
  
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
}

/**
 * Generate quote review agenda using Kastle's secure Azure OpenAI
 */
export async function generateQuoteReviewAgenda(
  projectName: string,
  projectDescription: string,
  quoteDetails: string,
  clientBackground: string
) {
  // Check if Azure OpenAI is configured
  if (!AI_CONFIG.isAzureConfigured()) {
    throw new Error('Azure OpenAI is not configured');
  }
  
  const result = await generateAzureQuoteReviewAgenda(
    projectName,
    projectDescription,
    quoteDetails,
    clientBackground
  );
  return { ...result, provider: 'azure' };
}

/**
 * Generate turnover call agenda using Kastle's secure Azure OpenAI
 */
export async function generateTurnoverCallAgenda(
  projectName: string,
  projectDescription: string,
  installationDetails: string,
  clientNeeds: string
) {
  // Check if Azure OpenAI is configured
  if (!AI_CONFIG.isAzureConfigured()) {
    throw new Error('Azure OpenAI is not configured');
  }
  
  const result = await generateAzureTurnoverCallAgenda(
    projectName,
    projectDescription,
    installationDetails,
    clientNeeds
  );
  return { ...result, provider: 'azure' };
}