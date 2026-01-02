import { NextResponse } from 'next/server';
import { getTailscaleClient } from '@/lib/tailscale';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const client = await getTailscaleClient();

        if (!client.apiKey || !client.tailnet) {
            return NextResponse.json({
                error: 'Not Configured',
                configured: false,
                devices: []
            }, { status: 400 });
        }

        const devices = await client.getDevices();

        // Simplify/Transform data for frontend if needed?
        // Returning raw devices is fine for now, frontend can map.
        return NextResponse.json({
            configured: true,
            devices
        });

    } catch (error) {
        console.error("Tailscale API Error:", error);
        return NextResponse.json({
            error: error.message,
            configured: true
        }, { status: 500 });
    }
}
