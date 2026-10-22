import { NextResponse } from 'next/server';
import { askSmartFarmingAssistant } from '@/lib/ai-assistant';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { prompt, language, userState } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const response = await askSmartFarmingAssistant(prompt, language || 'en', userState);
    return NextResponse.json(response);
  } catch (error) {
    console.error('AI assistant error:', error);
    return NextResponse.json({ error: 'Failed to generate agricultural guidance' }, { status: 500 });
  }
}
