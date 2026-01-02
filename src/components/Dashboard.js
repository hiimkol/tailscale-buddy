'use client';

import { useState, useEffect } from 'react';
import ResourceCard from './ResourceCard';
import { Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [configured, setConfigured] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch concurrently
            const [proxmoxRes, tailscaleRes] = await Promise.all([
                fetch('/api/proxmox/nodes').then(r => r.json()),
                fetch('/api/tailscale').then(r => r.json())
            ]);

            if (proxmoxRes.error === 'Not Configured') {
                setConfigured(false);
                setLoading(false);
                return;
            }

            setConfigured(true);

            const proxmoxData = proxmoxRes.resources || [];
            const tailscaleData = tailscaleRes.devices || [];

            // Merge Data
            const merged = proxmoxData.map(node => {
                const match = tailscaleData.find(ts =>
                    ts.hostname.toLowerCase() === node.name.toLowerCase()
                );
                return { ...node, tailscaleDevice: match };
            });

            setResources(merged);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handlePowerAction = async (node, type, vmid, action) => {
        // Optimistic update? Or loading state?
        // simple implementation: just call and refresh
        try {
            await fetch('/api/proxmox/control', {
                method: 'POST',
                body: JSON.stringify({ node, type, vmid, action })
            });
            // Refresh after short delay
            setTimeout(fetchData, 2000);
        } catch (e) {
            alert('Action failed: ' + e.message);
        }
    };

    if (!configured) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-full mb-4">
                    <AlertCircle size={32} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Setup Required</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                    Please configure your Proxmox and Tailscale API credentials to start managing your resources.
                </p>
                <Link href="/settings" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                    Go to Settings
                </Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-center py-10">{error}</div>;
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Resources</h1>
                <button
                    onClick={fetchData}
                    className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1"
                >
                    <Loader2 size={14} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {resources.length === 0 ? (
                <div className="text-center text-gray-500 py-10">No resources found.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.map((res) => (
                        <ResourceCard
                            key={res.vmid}
                            resource={res}
                            onPowerAction={handlePowerAction}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
