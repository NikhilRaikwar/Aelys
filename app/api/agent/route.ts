import { NextRequest, NextResponse } from 'next/server';
import { askAelysAgent } from '@/lib/agent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, history } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const response = await askAelysAgent(query, history);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
