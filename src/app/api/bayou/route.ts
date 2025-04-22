import { NextResponse } from 'next/server';
import { quickStart } from '@/app/services/bayou';

// GET /api/bayou
// this is a demo endpoint to quickly start the customer onboarding process
export async function POST() {
  try {
    const response = await quickStart();
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to create customer: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

