import { NextResponse } from 'next/server';
import { checkHealth } from '@/app/services/palmetto';

// GET /api/palmetto/health
export async function GET() {
  try {
    const health = await checkHealth();
    return NextResponse.json(health);
  } catch {
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}