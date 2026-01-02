import { NextResponse } from 'next/server';
import { getProxmoxClient } from '@/lib/proxmox';
import { getConfig } from '@/lib/config';

export async function POST(request) {
    try {
        const { node, type, vmid } = await request.json();

        // Only support Qemu for now (Needs Guest Agent)
        if (type !== 'qemu') {
            return NextResponse.json({ error: 'Installation only supported on VMs with QEMU Guest Agent' }, { status: 400 });
        }

        const config = await getConfig();
        if (!config.tailscaleAuthKey) {
            return NextResponse.json({ error: 'Tailscale Auth Key not configured in Settings' }, { status: 400 });
        }

        const client = await getProxmoxClient();

        // 1. Check if agent is running? (API /agent/ping) - Optional, assume user knows.
        // 2. Run Install Script
        // "curl -fsSL https://tailscale.com/install.sh | sh"
        console.log(`Starting Tailscale install on VM ${vmid}...`);

        // Step 1: Install
        // We fire and forget? Or wait? 
        // Agent exec returns PID.
        await client.execQemu(node, vmid, 'curl -fsSL https://tailscale.com/install.sh | sh');

        // Wait for install to likely finish? (It takes seconds).
        // We can't easily wait without polling pid.
        // We'll proceed optimistically after a delay?
        // Or chain commands? "curl ... | sh && tailscale up ..."

        const cmd = `curl -fsSL https://tailscale.com/install.sh | sh && tailscale up --authkey ${config.tailscaleAuthKey} --reset`;
        const result = await client.execQemu(node, vmid, cmd);

        return NextResponse.json({ success: true, result, message: 'Installation command sent. Check dashboard in a few minutes.' });

    } catch (error) {
        console.error("Install Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
