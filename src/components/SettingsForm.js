'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';

export default function SettingsForm() {
    const [formData, setFormData] = useState({
        proxmoxUrl: '',
        proxmoxUser: '',
        proxmoxTokenId: '',
        proxmoxTokenSecret: '',
        tailscaleApiKey: '',
        tailscaleTailnet: '',
        tailscaleAuthKey: '',
    });
    const [status, setStatus] = useState('loading'); // loading, idle, saving, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch('/api/config')
            .then((res) => res.json())
            .then((data) => {
                setFormData({
                    proxmoxUrl: data.proxmoxUrl || '',
                    proxmoxUser: data.proxmoxUser || 'root@pam',
                    proxmoxTokenId: data.proxmoxTokenId || '',
                    proxmoxTokenSecret: data.proxmoxTokenSecret || '',
                    tailscaleApiKey: data.tailscaleApiKey || '',
                    tailscaleTailnet: data.tailscaleTailnet || '',
                    tailscaleAuthKey: data.tailscaleAuthKey || '',
                });
                setStatus('idle');
            })
            .catch((err) => {
                console.error(err);
                setStatus('error');
                setMessage('Failed to load settings');
            });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('saving');
        setMessage('');

        try {
            const res = await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Failed to save');

            setStatus('success');
            setMessage('Settings saved successfully');

            // Reset success message after 3s
            setTimeout(() => {
                setStatus('idle');
                setMessage('');
            }, 3000);
        } catch (err) {
            setStatus('error');
            setMessage(err.message);
        }
    };

    if (status === 'loading') {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-600" /></div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2 dark:border-zinc-700">Proxmox API</h2>

                <div className="grid gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Proxmox URL</label>
                    <input
                        type="url"
                        name="proxmoxUrl"
                        required
                        placeholder="https://192.168.1.100:8006"
                        value={formData.proxmoxUrl}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>

                <div className="grid gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">User</label>
                    <input
                        type="text"
                        name="proxmoxUser"
                        required
                        placeholder="root@pam"
                        value={formData.proxmoxUser}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Token ID</label>
                        <input
                            type="text"
                            name="proxmoxTokenId"
                            required
                            placeholder="root@pam!token"
                            value={formData.proxmoxTokenId}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Token Secret</label>
                        <input
                            type="password"
                            name="proxmoxTokenSecret"
                            required
                            placeholder="x-x-x-x"
                            value={formData.proxmoxTokenSecret}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2 dark:border-zinc-700">Tailscale API</h2>

                <div className="grid gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">API Key</label>
                    <input
                        type="password"
                        name="tailscaleApiKey"
                        required
                        placeholder="tskey-api-..."
                        value={formData.tailscaleApiKey}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>

                <div className="grid gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tailnet Name</label>
                    <input
                        type="text"
                        name="tailscaleTailnet"
                        required
                        placeholder="example.com or tailnet-id"
                        value={formData.tailscaleTailnet}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>

                <div className="grid gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Auth Key (Reusable)</label>
                    <input
                        type="password"
                        name="tailscaleAuthKey"
                        placeholder="tskey-auth-..."
                        value={formData.tailscaleAuthKey || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                    <p className="text-xs text-gray-500">Required for auto-installation. Recommended: Reusable, Ephemeral.</p>
                </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
                <div className={`text-sm font-medium ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {message}
                </div>

                <button
                    type="submit"
                    disabled={status === 'saving'}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {status === 'saving' ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Save Settings
                </button>
            </div>
        </form>
    );
}
