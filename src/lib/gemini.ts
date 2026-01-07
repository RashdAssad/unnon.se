import { GoogleGenerativeAI } from '@google/generative-ai'

let geminiClient: GoogleGenerativeAI | null = null

export const getGeminiClient = (): GoogleGenerativeAI => {
  if (geminiClient) {
    return geminiClient
  }

  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables.')
  }

  geminiClient = new GoogleGenerativeAI(apiKey)
  return geminiClient
}

/**
 * Generates text from a prompt using Gemini.
 * @param prompt The prompt to send to the AI.
 * @returns The generated text response.
 */
export async function generateText(prompt: string): Promise<string> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
