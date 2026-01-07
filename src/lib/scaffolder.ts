import { generateText } from './gemini';
import { PageMetadata, SectionMetadata } from './types';

export interface GeneratedComponent {
  name: string;
  code: string;
}

export interface ScaffoldingResult {
  components: GeneratedComponent[];
  pageCode: string;
}

/**
 * Scaffolds a complete Next.js page structure from metadata.
 * @param metadata The metadata extracted from a URL or prompt.
 * @returns A ScaffoldingResult containing component definitions and main page code.
 */
export async function scaffoldPage(metadata: PageMetadata): Promise<ScaffoldingResult> {
  const components: GeneratedComponent[] = [];

  for (const section of metadata.sections) {
    const componentName = section.type.charAt(0).toUpperCase() + section.type.slice(1);
    const code = await generateComponentCode(section, componentName);
    components.push({ name: componentName, code });
  }

  const pageCode = generatePageWrapper(components);

  return { components, pageCode };
}

/**
 * Generates the React component code for a single section using AI.
 */
async function generateComponentCode(section: SectionMetadata, name: string): Promise<string> {
  const prompt = `
    Generate a React component named '${name}' for a Next.js application using Tailwind CSS.
    The section type is '${section.type}' and the content/purpose is: '${section.content}'.
    
    Requirements:
    - Use modern, clean UI (similar to shadcn/ui style).
    - Ensure it is responsive.
    - Return ONLY the TypeScript React code for the component.
    - No external imports except standard React hooks or Lucide icons if needed.
    - Do not include 'import React' (Next.js handles this).
  `;

  const code = await generateText(prompt);
  return code.replace(/```tsx|```jsx|```typescript|```/g, '').trim();
}

/**
 * Generates the main page file code that imports and assembles all components.
 */
function generatePageWrapper(components: GeneratedComponent[]): string {
  const imports = components.map(c => `import { ${c.name} } from './components/${c.name}';`).join('\n');
  const renderedComponents = components.map(c => `      <${c.name} />`).join('\n');

  return `
import React from 'react';
${imports}

export default function GeneratedPage() {
  return (
    <main className="min-h-screen">
${renderedComponents}
    </main>
  );
}
  `.trim();
}
