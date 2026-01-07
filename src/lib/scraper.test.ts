import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchUrlContent } from './scraper';

describe('fetchUrlContent', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('successfully fetches content from a valid URL', async () => {
    const mockHtml = '<html><body><h1>Hello World</h1></body></html>';
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockHtml),
    });

    const result = await fetchUrlContent('https://example.com');
    expect(result).toBe(mockHtml);
    expect(global.fetch).toHaveBeenCalledWith('https://example.com');
  });

  it('throws an error for invalid URLs', async () => {
    await expect(fetchUrlContent('  ')).rejects.toThrow('Invalid URL');
  });

  it('throws an error when the fetch fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    await expect(fetchUrlContent('https://example.com/404')).rejects.toThrow('Failed to fetch URL: 404');
  });

  it('sanitizes the URL (e.g., adds https if missing)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('ok'),
    });

    await fetchUrlContent('example.com');
    expect(global.fetch).toHaveBeenCalledWith('https://example.com');
  });
});
