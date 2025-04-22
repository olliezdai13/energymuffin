import { NextResponse } from 'next/server';
import { webhookEvents } from '@/app/services/webhookEvents';

// Verify webhook signature
function verifyWebhookSignature(signature: string, payload: string) {
  // TODO: Implement signature verification
  // This should verify that the webhook is actually from Bayou
  return true;
}

export async function POST(request: Request) {
  try {
    console.log('=== Webhook Received ===');
    
    // Get the webhook payload
    const payload = await request.json();

    // Emit the webhook event
    console.log(`Emitting webhook event: ${payload.event}`);
    webhookEvents.emit(payload.event, payload);

    // Return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
} 