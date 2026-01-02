import { getConfig } from './config';

export class TailscaleClient {
    constructor(config) {
        this.apiKey = config.tailscaleApiKey;
        this.tailnet = config.tailscaleTailnet;
    }

    async getDevices() {
        if (!this.apiKey || !this.tailnet) {
            throw new Error('Tailscale credentials not configured');
        }

        const url = `https://api.tailscale.com/api/v2/tailnet/${this.tailnet}/devices`;
        const res = await fetch(url, {
            headers: {
                'Authorization': 'Basic ' + Buffer.from(this.apiKey + ':').toString('base64'),
            },
            cache: 'no-store',
        });

        if (!res.ok) {
            // Handle 401 Unauthorized, 404 Tailnet not found
            const text = await res.text();
            throw new Error(`Tailscale API Error ${res.status}: ${text}`);
        }

        const json = await res.json();
        return json.devices || [];
    }
}

export async function getTailscaleClient() {
    const config = await getConfig();
    return new TailscaleClient(config);
}
