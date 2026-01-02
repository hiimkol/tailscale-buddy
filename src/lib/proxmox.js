import { getConfig } from './config';

export class ProxmoxClient {
    constructor(config) {
        this.url = config.proxmoxUrl;
        this.user = config.proxmoxUser;
        this.tokenId = config.proxmoxTokenId;
        this.tokenSecret = config.proxmoxTokenSecret;
    }

    get headers() {
        return {
            'Authorization': `PVEAPIToken=${this.user}!${this.tokenId}=${this.tokenSecret}`,
            'Content-Type': 'application/json',
        };
    }

    async request(method, endpoint, body = null) {
        if (!this.url || !this.user || !this.tokenId) {
            throw new Error('Proxmox credentials not configured');
        }

        // Handle trailing slash in URL
        const baseUrl = this.url.replace(/\/$/, '');
        const apiUrl = `${baseUrl}/api2/json${endpoint}`;

        const options = {
            method,
            headers: this.headers,
            cache: 'no-store', // Next.js caching skip
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        // Proxmox usually has self-signed certs. In Dev, we might need to ignore SSL.
        // For Production, user should have valid certs or we allow insecure.
        // Start with strict, but maybe add an option logic later.
        // nodeJS fetch doesn't easily support insecure (requires agent). 
        // Next.js (Edge/Node) fetch.
        // Hack for self-signed: process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; (Dangerous)
        // We'll manage this via a specialized agent if needed, but for now standard fetch.

        // Actually, 'fetch' in Next.js extends standard fetch.
        // If user has https with self-signed, it will fail.
        // We should probably allow insecure for local IPs.
        // I'll add a lightweight agent handling if needed, but keeping it simple first.

        try {
            const res = await fetch(apiUrl, options);
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Proxmox API Error ${res.status}: ${errorText}`);
            }
            const json = await res.json();
            return json.data;
        } catch (e) {
            // If it's an SSL error
            if (e.cause?.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' || e.cause?.code === 'DEPTH_ZERO_SELF_SIGNED_CERT') {
                console.error("SSL Error - Consider using a valid certificate or configuring the app to ignore SSL errors.");
            }
            throw e;
        }
    }

    async getNodes() {
        return this.request('GET', '/nodes');
    }

    async getLxcs(node) {
        return this.request('GET', `/nodes/${node}/lxc`);
    }

    async getVms(node) {
        return this.request('GET', `/nodes/${node}/qemu`);
    }

    async getResources() {
        // Get nodes, then get all LXCs/VMs for each node
        // This aggregates everything into a flat list
        const nodes = await this.getNodes();
        let allResources = [];

        for (const node of nodes) {
            const [lxcs, vms] = await Promise.all([
                this.getLxcs(node.node).catch(() => []),
                this.getVms(node.node).catch(() => [])
            ]);

            // Add type and node info
            const lxcsMapped = lxcs.map(r => ({ ...r, type: 'lxc', node: node.node }));
            const vmsMapped = vms.map(r => ({ ...r, type: 'qemu', node: node.node }));
            allResources = [...allResources, ...lxcsMapped, ...vmsMapped];
        }
        return allResources;
    }

    async setPowerState(node, type, vmid, action) {
        // action: start, stop, shutdown, reboot
        // endpoint: /nodes/{node}/{type}/{vmid}/status/{action}
        // type param is 'lxc' or 'qemu'

        // Map 'vm' to 'qemu' if needed, but verify usage.
        return this.request('POST', `/nodes/${node}/${type}/${vmid}/status/${action}`);
    }

    async execQemu(node, vmid, command) {
        // command is array of strings e.g. ['ls', '-l']
        // Join with space? API expects string if not array?
        // Actually, Qemu Agent Exec 'command' parameter takes "The command as a list of program and arguments."
        // We should format it correctly. If we pass string "curl ...", it might fail if args are needed.
        // shell wrap: ['sh', '-c', 'curl ... | sh']

        // PVE API for agent/exec behaves like this:
        // command: "program arg1 arg2" (if simple?) or array?
        // It's safest to wrap in a shell to support pipes.
        // command: ['sh', '-c', command]

        // But wait, user passes string? 
        // Let's assume input 'command' is a string line like "curl ... | sh".
        // We'll wrap it.
        const wrappedCmd = ['/bin/sh', '-c', command];

        return this.request('POST', `/nodes/${node}/qemu/${vmid}/agent/exec`, { command: wrappedCmd });
    }
}

export async function getProxmoxClient() {
    const config = await getConfig();
    return new ProxmoxClient(config);
}
