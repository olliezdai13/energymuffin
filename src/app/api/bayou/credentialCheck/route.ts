import { NextResponse } from 'next/server';
import { customerCredentialStore } from '@/app/services/customerCredentialStore';

export async function POST(request: Request) {
  try {
    const { customer_id } = await request.json();

    if (!customer_id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const hasCredentials = customerCredentialStore.hasFilledCredentials(customer_id);
    const lastEventTimestamp = customerCredentialStore.getLastEventTimestamp(customer_id);

    return NextResponse.json({
      has_credentials: hasCredentials,
      last_updated: lastEventTimestamp?.toISOString() || null
    });
  } catch (error) {
    console.error('Error checking credentials:', error);
    return NextResponse.json(
      { error: 'Failed to check credentials status' },
      { status: 500 }
    );
  }
} 