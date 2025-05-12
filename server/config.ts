/**
 * Application configuration settings
 */

/**
 * AI provider configuration
 */
export const AI_CONFIG = {
  // Default AI provider: 'azure' only
  DEFAULT_PROVIDER: 'azure',
  
  // Check if Azure OpenAI API is configured
  isAzureConfigured: () => !!process.env.AZURE_OPENAI_API_KEY,
  
  // Get the active AI provider based on configuration
  getActiveProvider: () => {
    if (AI_CONFIG.isAzureConfigured()) {
      return 'azure';
    } else {
      return null; // No AI provider configured
    }
  }
};