import { NextResponse } from 'next/server';
import { customerCredentialStore } from '@/app/services/customerCredentialStore';
import { CustomerCredentialEvent } from '@/app/services/customerCredentialStore';
// god help us

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
    
    // Get the entire credential map
    const credentialMap = Array.from(customerCredentialStore.getEventsMap().entries()).map(([id, event]: [number, CustomerCredentialEvent]) => ({
      customer_id: id,
      event: event.event,
      timestamp: event.timestamp,
      object: event.object
    }));

    return NextResponse.json({
      has_credentials: hasCredentials,
      last_updated: lastEventTimestamp?.toISOString() || null,
      credential_map: credentialMap
    });
  } catch (error) {
    console.error('Error checking credentials:', error);
    return NextResponse.json(
      { error: 'Failed to check credentials status' },
      { status: 500 }
    );
  }
} 