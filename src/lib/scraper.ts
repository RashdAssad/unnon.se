/**
 * Utility to fetch and sanitize content from a given URL.
 */

/**
 * Sanitizes a URL by adding 'https://' if it's missing and verifying its format.
 * @param url The URL string to sanitize.
 * @returns A valid URL string.
 */
export function sanitizeUrl(url: string): string {
  let sanitized = url.trim();
  
  if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
    sanitized = `https://${sanitized}`;
  }

  try {
    new URL(sanitized);
    return sanitized;
  } catch (error) {
    throw new Error('Invalid URL');
  }
}

/**
 * Fetches the HTML content of a URL.
 * @param url The URL to fetch.
 * @returns The HTML content as a string.
 */
export async function fetchUrlContent(url: string): Promise<string> {
  const sanitizedUrl = sanitizeUrl(url);

  const response = await fetch(sanitizedUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }

  return response.text();
}
