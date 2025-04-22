import { z } from 'zod';

// Create the Zod schema for ForecastResponseRecord
export const ForecastResponseRecordSchema = z.object({
    month_year: z.string(),
    baseline_cost: z.number(),
    action_cost: z.number(),
    action_savings: z.number()
});

// Create the TypeScript type from the schema
export type ForecastResponseRecord = z.infer<typeof ForecastResponseRecordSchema>;

// Create the Zod schema for ConsumptionResponse
export const ConsumptionResponseSchema = z.object({
    monthly_forecasts: z.array(ForecastResponseRecordSchema)
});

// Create the TypeScript type from the schema
export type ConsumptionResponse = z.infer<typeof ConsumptionResponseSchema>;

// Helper function to create a ForecastResponseRecord
export function createForecastResponseRecord(
    monthYear: string,
    baselineCost: number,
    actionCost: number,
    actionSavings: number
): ForecastResponseRecord {
    return {
        month_year: monthYear,
        baseline_cost: baselineCost,
        action_cost: actionCost,
        action_savings: actionSavings
    };
}

// Helper function to create a ConsumptionResponse
export function createConsumptionResponse(
    monthlyForecasts: ForecastResponseRecord[]
): ConsumptionResponse {
    return {
        monthly_forecasts: monthlyForecasts
    };
} 