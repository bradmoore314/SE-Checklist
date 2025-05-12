/**
 * Application configuration settings
 */

/**
 * AI provider configuration
 */
export const AI_CONFIG = {
  // Default AI provider: 'gemini' or 'azure'
  DEFAULT_PROVIDER: 'azure',
  
  // Check if Gemini API is configured
  isGeminiConfigured: () => !!process.env.GEMINI_API_KEY,
  
  // Check if Azure OpenAI API is configured
  isAzureConfigured: () => !!process.env.AZURE_OPENAI_API_KEY,
  
  // Get the active AI provider based on configuration
  getActiveProvider: () => {
    if (AI_CONFIG.DEFAULT_PROVIDER === 'azure' && AI_CONFIG.isAzureConfigured()) {
      return 'azure';
    } else if (AI_CONFIG.isGeminiConfigured()) {
      return 'gemini';
    } else {
      return null; // No AI provider configured
    }
  }
};