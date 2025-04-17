import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Language code mapping to full names
const languageMap: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  zh: "Mandarin Chinese",
  hi: "Hindi",
  ar: "Arabic",
  ru: "Russian",
  pt: "Portuguese",
  ja: "Japanese"
};

/**
 * Translates text from one language to another using Gemini API
 * @param text The text to translate
 * @param targetLanguage The target language code (e.g., 'es', 'fr')
 * @param sourceLanguage The source language code (default: 'en')
 * @returns The translated text
 */
export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage: string = 'en'
): Promise<string> {
  try {
    // Get language names from codes
    const sourceLang = languageMap[sourceLanguage] || sourceLanguage;
    const targetLang = languageMap[targetLanguage] || targetLanguage;
    
    // Create model and generate content
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      Translate the following Scope of Work document from ${sourceLang} to ${targetLang}.
      Maintain professional business terminology and formal tone throughout.
      Preserve the original format, including line breaks and paragraphs.
      Only return the translated text without any additional explanations or notes.

      Text to translate:
      ${text}
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text();
    
    return translatedText.trim();
  } catch (error) {
    console.error("Gemini translation error:", error);
    throw new Error(`Translation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}