import { NextResponse } from 'next/server';
import { getProxmoxClient } from '@/lib/proxmox';

export async function POST(request) {
    try {
        const { node, type, vmid, action } = await request.json();

        if (!node || !type || !vmid || !action) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const client = await getProxmoxClient();
        const result = await client.setPowerState(node, type, vmid, action);

        return NextResponse.json({ result });
    } catch (error) {
        console.error("Proxmox Control Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
