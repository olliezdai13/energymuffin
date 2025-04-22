interface CustomerCredentialEvent {
  event: string;
  object: {
    id: number;
    [key: string]: any;
  };
  timestamp: Date;
}

class CustomerCredentialStore {
  private events: Map<number, CustomerCredentialEvent> = new Map();

  addEvent(event: CustomerCredentialEvent) {
    // Only store customer_has_filled_credentials events
    if (event.event === 'customer_has_filled_credentials') {
      this.events.set(event.object.id, {
        ...event,
        timestamp: new Date()
      });
    }
  }

  getEvent(customerId: number): CustomerCredentialEvent | undefined {
    return this.events.get(customerId);
  }

  hasFilledCredentials(customerId: number): boolean {
    const event = this.getEvent(customerId);
    return event?.event === 'customer_has_filled_credentials' || false;
  }

  getLastEventTimestamp(customerId: number): Date | undefined {
    return this.getEvent(customerId)?.timestamp;
  }
}

export const customerCredentialStore = new CustomerCredentialStore(); 