import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import * as scraper from '@/lib/scraper';
import * as analyzer from '@/lib/analyzer';
import * as scaffolder from '@/lib/scaffolder';

// Mock dependencies
vi.mock('@/lib/scraper', () => ({
  fetchUrlContent: vi.fn(),
}));
vi.mock('@/lib/analyzer', () => ({
  analyzeHtmlStructure: vi.fn(),
}));
vi.mock('@/lib/scaffolder', () => ({
  scaffoldPage: vi.fn(),
}));

describe('POST /api/replicate', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns generated code for a valid URL', async () => {
    const mockUrl = 'https://example.com';
    const mockHtml = '<html>...</html>';
    const mockMetadata = { sections: [] };
    const mockResult = { components: [], pageCode: 'export default ...' };

    (scraper.fetchUrlContent as any).mockResolvedValue(mockHtml);
    (analyzer.analyzeHtmlStructure as any).mockResolvedValue(mockMetadata);
    (scaffolder.scaffoldPage as any).mockResolvedValue(mockResult);

    const req = new NextRequest('http://localhost/api/replicate', {
      method: 'POST',
      body: JSON.stringify({ url: mockUrl }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.content).toBe(mockResult.pageCode);
    expect(scraper.fetchUrlContent).toHaveBeenCalledWith(mockUrl);
    expect(analyzer.analyzeHtmlStructure).toHaveBeenCalledWith(mockHtml);
    expect(scaffolder.scaffoldPage).toHaveBeenCalledWith(mockMetadata);
  });

  it('returns 400 if URL is missing', async () => {
    const req = new NextRequest('http://localhost/api/replicate', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/url is required/i);
  });

  it('handles errors gracefully', async () => {
    (scraper.fetchUrlContent as any).mockRejectedValue(new Error('Fetch failed'));

    const req = new NextRequest('http://localhost/api/replicate', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://fail.com' }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Fetch failed');
  });

  it('handles unknown errors gracefully', async () => {
    (scraper.fetchUrlContent as any).mockRejectedValue({}); // Error without message

    const req = new NextRequest('http://localhost/api/replicate', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://fail.com' }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('An error occurred during replication');
  });
});
