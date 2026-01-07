import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeHtmlStructure } from './analyzer';
import * as gemini from './gemini';

vi.mock('./gemini', () => ({
  generateText: vi.fn(),
}));

describe('analyzeHtmlStructure', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('correctly maps HTML to metadata using AI', async () => {
    const mockHtml = '<html><body><nav>Home</nav><section>Welcome</section><footer>2024</footer></body></html>';
    const mockResponse = JSON.stringify({
      title: 'Example Page',
      sections: [
        { type: 'header', content: 'Home' },
        { type: 'hero', content: 'Welcome' },
        { type: 'footer', content: '2024' }
      ]
    });

    (gemini.generateText as any).mockResolvedValue(mockResponse);

    const result = await analyzeHtmlStructure(mockHtml);

    expect(result.sections).toHaveLength(3);
    expect(result.sections[0].type).toBe('header');
    expect(gemini.generateText).toHaveBeenCalled();
  });

  it('handles empty or invalid HTML gracefully', async () => {
    const mockResponse = JSON.stringify({
      sections: []
    });
    (gemini.generateText as any).mockResolvedValue(mockResponse);

    const result = await analyzeHtmlStructure('');
    expect(result.sections).toEqual([]);
  });

  it('handles invalid JSON from AI', async () => {
    (gemini.generateText as any).mockResolvedValue('invalid json');
    const result = await analyzeHtmlStructure('<html></html>');
    expect(result.sections).toEqual([]);
  });
});
