import { z } from 'zod';

// Define the variable type as a union of literal strings
export type ConsumptionVariable = 'consumption.electricity' | 'consumption.fossil_fuel';

// Create the Zod schema for validation
export const ConsumptionRecordSchema = z.object({
    from_datetime: z.string().datetime(), // Zod will validate ISO string format
    to_datetime: z.string().datetime(),
    variable: z.enum(['consumption.electricity', 'consumption.fossil_fuel']),
    value: z.number()
});

// Create the TypeScript type from the schema
export type ConsumptionRecord = z.infer<typeof ConsumptionRecordSchema>;

// Helper function to create a ConsumptionRecord
export function createConsumptionRecord(
    fromDatetime: Date,
    toDatetime: Date,
    variable: ConsumptionVariable,
    value: number
): ConsumptionRecord {
    return {
        from_datetime: fromDatetime.toISOString(),
        to_datetime: toDatetime.toISOString(),
        variable,
        value
    };
}

// Define granularity type
export type Granularity = 'hour' | 'day' | 'month';

// Create the Zod schema for ForecastRequest
export const ForecastRequestSchema = z.object({
    address: z.string(),
    from_datetime: z.string().datetime(),
    to_datetime: z.string().datetime(),
    granularity: z.enum(['hour', 'day', 'month']).optional().default('hour')
});

// Create the TypeScript type from the schema
export type ForecastRequest = z.infer<typeof ForecastRequestSchema>;

// Helper function to create a ForecastRequest
export function createForecastRequest(
    address: string,
    fromDatetime: Date,
    toDatetime: Date,
    granularity: Granularity = 'hour'
): ForecastRequest {
    return {
        address,
        from_datetime: fromDatetime.toISOString(),
        to_datetime: toDatetime.toISOString(),
        granularity
    };
}
