import bayou from '@api/bayou';

export async function createCustomer() {
    try {
        bayou.auth(process.env.BAYOU_API_KEY || "");
        bayou.server('https://staging.bayou.energy/api/v2');
        
        const customerData = {
            utility: "speculoos_power"
        };

        const response = await bayou.postCustomers(customerData);
        return response.data;
    } catch (error) {
        console.error('Error creating customer:', error);
        throw error;
    }
}