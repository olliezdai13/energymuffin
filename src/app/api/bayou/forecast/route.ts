import { createConsumptionRecord } from '@/app/models/palmettoRequest';
import { getCustomerBillHistory } from '@/app/services/bayou';
import { NextRequest, NextResponse } from 'next/server';

const THERMS_TO_KWH = 29.3001;

export async function POST(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const customerId = parseInt(searchParams.get('customerId') || '0', 10);
        const monthsBefore = parseInt(searchParams.get('monthsBefore') || '12', 10);
        const monthsAfter = parseInt(searchParams.get('months') || '12', 10);

        if (!customerId) {
            return NextResponse.json(
                { error: 'Invalid customerId parameter' },
                { status: 400 }
            );
        }

        if (isNaN(monthsBefore) || monthsBefore <= 0) {
            return NextResponse.json(
                { error: 'Invalid monthsBefore parameter' },
                { status: 400 }
            );
        }

        if (isNaN(monthsAfter) || monthsAfter <= 0) {
            return NextResponse.json(
                { error: 'Invalid monthsAfter parameter' },
                { status: 400 }
            );
        }

        console.log(`Fetching bill history for customer ${customerId} for ${monthsBefore} months before and ${monthsAfter} months after`);
        const bills = await getCustomerBillHistory(customerId, monthsBefore);

        // filter bills by ones with billing_period_from, billing_period_to
        const billsWithDates = bills.filter(bill => bill.billing_period_from && bill.billing_period_to);
        console.log(`Found ${billsWithDates.length} bills with dates`);

        // map bills to a list of ConsumptionRecord
        const consumptionRecords = billsWithDates.map(bill => createConsumptionRecord(
            new Date(bill.billing_period_from || ""),
            new Date(bill.billing_period_to || ""),
            'consumption.electricity',
            bill.electricity_consumption || 0 + ((bill.gas_consumption || 0) * THERMS_TO_KWH)
        ));
        console.log(`Created ${consumptionRecords.length} consumption records`);

        // Create forecast request for the same time period
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + monthsAfter);
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - monthsBefore);

        // random address for now (until we have a way to get the customer's address via creating a new Bayou customer and intaking address field)
        const customerAddress = "3048 Partridge Ave, Oakland, CA 94605"; // await formatCustomerAddress(customerId);

        const forecastRequest = {
            address: customerAddress,
            from_datetime: startDate.toISOString().split('T')[0],
            to_datetime: endDate.toISOString().split('T')[0],
            granularity: 'month'
        };

        console.log('Calling data API with:', {
            url: `${process.env.DATA_API_URL}/consumption`,
            forecastRequest,
            consumptionRecordsCount: consumptionRecords.length
        });

        // Call data API
        const response = await fetch(`${process.env.DATA_API_URL}/consumption`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                forecast: forecastRequest,
                consumption_records: consumptionRecords,
                HVAC_info: [{variable: "heating", start_time: 12, duration: 3, setpoint: 21}]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Data API error response:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText
            });
            throw new Error(`Data API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Data API response:', data);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in /api/bayou/forecast:', error);
        return NextResponse.json(
            { error: `Failed to generate forecast: ${error instanceof Error ? error.message : 'Unknown error'}` },
            { status: 500 }
        );
    }
} 