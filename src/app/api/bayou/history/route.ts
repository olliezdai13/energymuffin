import { ConsumptionRecord, createConsumptionRecord, createForecastRequest, ForecastRequest } from '@/app/models/palmettoRequest';
import { getCustomerBillHistory } from '@/app/services/bayou';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const THERMS_TO_KWH = 29.3001;
const ADDRESS = '123 Main St, Anytown, USA';

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

        const bills = await getCustomerBillHistory(customerId, months);

        // filter bills by ones with billing_period_from, billing_period_to
        const billsWithDates = bills.filter(bill => bill.billing_period_from && bill.billing_period_to);

        // map bills to a list of ConsumptionRecord
        const consumptionRecords: ConsumptionRecord[] = billsWithDates.map(bill => createConsumptionRecord(
            new Date(bill.billing_period_from || ""),
            new Date(bill.billing_period_to || ""),
            'consumption.electricity',
            bill.electricity_consumption || 0 + ((bill.gas_consumption || 0) * THERMS_TO_KWH)
        ));

        const forecastRequest: ForecastRequest = createForecastRequest(
            ADDRESS,
            new Date(),
            new Date(new Date().setMonth(new Date().getMonth() + 12)),
            'month'
        );

        console.log("DEBUG starting palmetto requests");
        console.log("forecastRequest");
        console.log(forecastRequest);
        console.log("consumptionRecords");
        console.log(consumptionRecords);

        // Call energymuffin-data-api POST /consumption
        /*
        body: { forecast: forecastRequest, consumption_records: consumptionRecords }
        */

        return NextResponse.json({
            forecast: forecastRequest,
            consumption_records: consumptionRecords
        });
    } catch (error) {
        return NextResponse.json(
            { error: `Failed to fetch bill history: ${error instanceof Error ? error.message : 'Unknown error'}` },
            { status: 500 }
        );
    }
}