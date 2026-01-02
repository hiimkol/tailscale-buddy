import { NextResponse } from 'next/server';
import { getProxmoxClient } from '@/lib/proxmox';

// FORCE DYNAMIC: Prevent Next.js from caching this route at build time
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const client = await getProxmoxClient();

        // Check if configured
        if (!client.url || !client.user || !client.tokenId) {
            return NextResponse.json({
                error: 'Not Configured',
                configured: false,
                resources: []
            }, { status: 400 }); // Or 200 with flag
        }

        const resources = await client.getResources();
        return NextResponse.json({
            configured: true,
            resources
        });
    } catch (error) {
        console.error("Proxmox API Error:", error);
        return NextResponse.json({
            error: error.message,
            configured: true // Configured but failed
        }, { status: 500 });
    }
}
