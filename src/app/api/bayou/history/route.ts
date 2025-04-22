import { ConsumptionRecord, createConsumptionRecord } from '@/app/models/palmettoRequest';
import { getCustomerBillHistory } from '@/app/services/bayou';
import { NextRequest, NextResponse } from 'next/server';

const THERMS_TO_KWH = 29.3001;

// fetches a 12 month history of bills 
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const customerId = parseInt(searchParams.get('customerId') || '0', 10);
        const months = parseInt(searchParams.get('months') || '12', 10);

        if (isNaN(months) || months <= 0) {
            return NextResponse.json(
                { error: 'Invalid months parameter' },
                { status: 400 }
            );
        }

        if (!customerId) {
            return NextResponse.json(
                { error: 'Invalid customerId parameter' },
                { status: 400 }
            );
        }

        console.log(`Fetching bill history for customer ${customerId} for ${months} months`);
        const bills = await getCustomerBillHistory(customerId, months);

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

        return NextResponse.json(consumptionRecords);
    } catch (error) {
        console.error('Error in /api/bayou/history:', error);
        return NextResponse.json(
            { error: `Failed to fetch bill history: ${error instanceof Error ? error.message : 'Unknown error'}` },
            { status: 500 }
        );
    }
}