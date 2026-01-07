import { generateText } from './gemini';
import { PageMetadata } from './types';

/**
 * Analyzes HTML content and extracts structural metadata using AI.
 * @param html The HTML string to analyze.
 * @returns A promise that resolves to PageMetadata.
 */
export async function analyzeHtmlStructure(html: string): Promise<PageMetadata> {
  if (!html || html.trim() === '') {
    return { sections: [] };
  }

  const prompt = `
    Analyze the following HTML content and extract its high-level structure.
    Identify the main sections (e.g., header, hero, features, footer, etc.).
    For each section, provide the type and a brief summary of its content.

    Return the result strictly as a JSON object matching this structure:
    {
      "title": "Page Title",
      "description": "Short description",
      "sections": [
        { "type": "header|hero|features|about|services|pricing|testimonials|cta|footer|unknown", "content": "Summary of content" }
      ]
    }

    HTML Content:
    ${html.substring(0, 10000)} // Limiting to first 10k chars for prompt efficiency
  `;

  const response = await generateText(prompt);
  
  try {
    // Clean response in case AI includes markdown code blocks
    const cleanedResponse = response.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanedResponse) as PageMetadata;
  } catch (error) {
    console.error('Failed to parse AI response as JSON:', response);
    return { sections: [] };
  }
}
