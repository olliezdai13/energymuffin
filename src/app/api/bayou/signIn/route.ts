import { NextResponse } from 'next/server';
import { generateSignInLink } from '@/app/services/bayou';

export async function POST() {
    try {
        // Generate sign-in link and get customer ID
        const { customer_id, onboarding_link, message } = await generateSignInLink();
        
        return NextResponse.json({
            onboarding_link,
            customer_id,
            message
        });

    } catch (error) {
        console.error('Error generating sign-in link:', error);
        return NextResponse.json(
            { error: `Failed to generate sign-in link: ${error instanceof Error ? error.message : 'Unknown error'}` },
            { status: 500 }
        );
    }
} 