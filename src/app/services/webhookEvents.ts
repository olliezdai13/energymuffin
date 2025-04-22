import { EventEmitter } from 'events';

export const webhookEvents = new EventEmitter();

// Types for webhook events
export type WebhookEvent = {
  event: string;
  object: any;
};

// Helper function to wait for a specific webhook event
export function waitForWebhookEvent(eventName: string, customerId: number): Promise<WebhookEvent> {
  console.log(`Waiting for webhook event: ${eventName} for customer ${customerId}`);
  
  return new Promise((resolve) => {
    const handler = (event: WebhookEvent) => {
      console.log(`Received webhook event: ${event.event} for customer ${event.object.id}`);
      if (event.object.id === customerId) {
        console.log(`Matched webhook event for customer ${customerId}`);
        webhookEvents.removeListener(eventName, handler);
        resolve(event);
      } else {
        console.log(`Webhook event customer ID (${event.object.id}) does not match expected (${customerId})`);
      }
    };
    
    // Add a timeout to prevent hanging
    const timeout = setTimeout(() => {
      webhookEvents.removeListener(eventName, handler);
      console.error(`Timeout waiting for webhook event: ${eventName} for customer ${customerId}`);
    }, 300000); // 5 minute timeout
    
    webhookEvents.on(eventName, handler);
    
    // Clean up timeout when promise resolves
    Promise.resolve().then(() => clearTimeout(timeout));
  });
} 