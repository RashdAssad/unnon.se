import { NextRequest, NextResponse } from 'next/server';
import { fetchUrlContent } from '@/lib/scraper';
import { analyzeHtmlStructure } from '@/lib/analyzer';
import { scaffoldPage } from '@/lib/scaffolder';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // 1. Fetch HTML content
    const html = await fetchUrlContent(url);

    // 2. Analyze structure using AI
    const metadata = await analyzeHtmlStructure(html);

    // 3. Scaffold Next.js code
    const result = await scaffoldPage(metadata);

    return NextResponse.json({ content: result.pageCode });
  } catch (error: any) {
    console.error('Replication Error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred during replication' }, { status: 500 });
  }
}
