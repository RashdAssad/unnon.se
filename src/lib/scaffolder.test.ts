import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scaffoldPage } from './scaffolder';
import * as gemini from './gemini';
import { PageMetadata } from './types';

vi.mock('./gemini', () => ({
  generateText: vi.fn(),
}));

describe('scaffoldPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('generates React code for each section in the metadata', async () => {
    const mockMetadata: PageMetadata = {
      title: 'Test Page',
      sections: [
        { type: 'header', content: 'Main Navigation' },
        { type: 'hero', content: 'Hero Section' }
      ]
    };

    (gemini.generateText as any)
      .mockResolvedValueOnce('export function Header() { return <nav>Header</nav>; }')
      .mockResolvedValueOnce('export function Hero() { return <section>Hero</section>; }');

    const result = await scaffoldPage(mockMetadata);

    expect(result.components).toHaveLength(2);
    expect(result.components[0].code).toContain('Header');
    expect(result.components[1].code).toContain('Hero');
    expect(gemini.generateText).toHaveBeenCalledTimes(2);
  });
});
