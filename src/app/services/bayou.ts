import bayou from '@api/bayou';
import { waitForWebhookEvent } from './webhookEvents';

export async function createCustomer() {
    try {
        bayou.auth(process.env.BAYOU_API_KEY || "");
        bayou.server('https://staging.bayou.energy/api/v2');

        const customerData = {
            utility: "speculoos_power"
        };

        const response = await bayou.postCustomers(customerData);
        let customer = response.data;

        if (!customer.id) {
            throw new Error('Customer ID is missing from response');
        }

        console.log(`Fill the customer credentials using the following link: ${customer.onboarding_link}
        For credentials: The email is iamvalid@bayou.energy and the password is validpassword. We'll wait while you complete the form!`);

        // Wait for customer_has_filled_credentials webhook
        await waitForWebhookEvent('customer_has_filled_credentials', customer.id);
        console.log("Customer has filled credentials. Fetching bills...");

        // Wait for bills_ready webhook
        await waitForWebhookEvent('bills_ready', customer.id);
        console.log("Bills are ready. Fetching bills data...");

        // Get all bills for a specific customer
        const billResponse = await bayou.getCustomersCustomer_idBills({
            customer_id: customer.id.toString()
        });
        const bills = billResponse.data;

        console.log("\nFirst 12 bills:\n");
        bills.slice(0, 12).forEach(bill => {
            console.log(bill);
        });

        await new Promise(resolve => setTimeout(resolve, 10000)); // Pause for 10 seconds to allow you to quickly review bill data

        console.log("\nNow we'll wait for intervals to be ready...");

        // Wait for intervals_ready webhook
        await waitForWebhookEvent('intervals_ready', customer.id);
        console.log("Intervals are ready. Fetching intervals data...");

        // Get all intervals for a specific customer
        const intervalsResponse = await bayou.getCustomersCustomer_idIntervals({
            customer_id: customer.id.toString()
        });
        const intervals = intervalsResponse.data;

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
        console.error('Error creating customer:', error);
        throw error;
    }
}