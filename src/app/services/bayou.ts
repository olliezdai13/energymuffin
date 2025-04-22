import bayou from '@api/bayou';
import { waitForWebhookEvent } from './webhookEvents';

// Re-export waitForWebhookEvent
export { waitForWebhookEvent };

// Initialize Bayou client
function initBayouClient() {
    bayou.auth(process.env.BAYOU_API_KEY || "");
    bayou.server('https://staging.bayou.energy/api/v2');
}

export async function generateSignInLink() {
    try {
        initBayouClient();

        // Create customer with test utility
        const customerData = {
            utility: "speculoos_power"  // Bayou's test utility
        };

        const response = await bayou.postCustomers(customerData);
        const customer = response.data;

        if (!customer.id) {
            throw new Error('Customer ID is missing from response');
        }

        return {
            onboarding_link: customer.onboarding_link,
            customer_id: customer.id,
            message: "Use the following credentials to sign in: email: iamvalid@bayou.energy, password: validpassword"
        };
    } catch (error) {
        console.error('Error generating sign-in link:', error);
        throw error;
    }
}

export async function getCustomerBills(customerId: number) {
    try {
        initBayouClient();
        const response = await bayou.getCustomersCustomer_idBills({
            customer_id: customerId.toString()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching customer bills:', error);
        throw error;
    }
}

export async function getCustomerIntervals(customerId: number) {
    try {
        initBayouClient();
        const response = await bayou.getCustomersCustomer_idIntervals({
            customer_id: customerId.toString()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching customer intervals:', error);
        throw error;
    }
}

export async function quickStart() {
    try {
        // Generate sign-in link and get customer ID
        const { customer_id, onboarding_link, message } = await generateSignInLink();
        
        console.log(`Fill the customer credentials using the following link: ${onboarding_link}
        ${message}`);

        // Wait for customer_has_filled_credentials webhook
        await waitForWebhookEvent('customer_has_filled_credentials', customer_id);
        console.log("Customer has filled credentials. Fetching bills...");

        // Wait for bills_ready webhook
        await waitForWebhookEvent('bills_ready', customer_id);
        console.log("Bills are ready. Fetching bills data...");

        // Get and display bills
        const bills = await getCustomerBills(customer_id);
        console.log("\nFirst 12 bills:\n");
        bills.slice(0, 12).forEach(bill => {
            console.log(bill);
        });

        await new Promise(resolve => setTimeout(resolve, 10000)); // Pause for 10 seconds to allow you to quickly review bill data

        console.log("\nNow we'll wait for intervals to be ready...");

        // Wait for intervals_ready webhook
        await waitForWebhookEvent('intervals_ready', customer_id);
        console.log("Intervals are ready. Fetching intervals data...");

        // Get and display intervals
        const intervals = await getCustomerIntervals(customer_id);
        console.log("\nIntervals for each meter:\n");

        intervals.meters?.forEach(meter => {
            console.log(`\nIntervals for meter ${meter.id}:`);
            meter.intervals?.slice(0, 10).forEach(interval => {
                console.log(interval);
            });
        });

        await new Promise(resolve => setTimeout(resolve, 10000)); // Pause for 10 seconds to allow you to quickly review interval data

        console.log(`Congratulations! 
    
        You're ready to get customer utility data instantly with Bayou. 
    
        As a recommended next step, visit Bayou's documentation for moving from QuickStart to deployment:
    
        https://docs.bayou.energy/docs/merge-customer-code-with-your-project
    
        Want to chat with the Bayou team? Book time here, https://calendly.com/jamesbayouenergy/30min or text James our CEO at +1 504 722 8987.`);

        return {};

    } catch (error) {
        console.error('Error in quickStart:', error);
        throw error;
    }
}