import { NextResponse } from 'next/server';
import { checkHealth } from '@/app/services/palmetto';

// GET /api/palmetto/health
export async function GET() {
  try {
    const health = await checkHealth();
    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to check Palmetto health: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}