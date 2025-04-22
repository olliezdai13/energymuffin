import { NextResponse } from 'next/server';
import { createCustomer } from '@/app/services/bayou';

// GET /api/bayou
export async function POST() {
  try {
    const response = await createCustomer();
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to create customer: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}