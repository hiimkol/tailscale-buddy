import { Play, Square, RefreshCcw, Download, Monitor, Server } from 'lucide-react';

export default function ResourceCard({ resource, onPowerAction }) {
    const { name, status, type, vmid, node, tailscaleDevice } = resource;

    const isRunning = status === 'running';
    const hasTailscale = !!tailscaleDevice;

    // Status Color
    const statusColor = isRunning
        ? 'bg-green-500'
        : 'bg-gray-300 dark:bg-zinc-600';

    return (
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">

            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${statusColor} shrink-0`} title={status} />
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate" title={name}>{name}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            {type === 'qemu' ? <Monitor size={12} /> : <Server size={12} />}
                            <span className="uppercase">{type}</span>
                            <span>•</span>
                            <span>ID: {vmid}</span>
                        </div>
                    </div>
                </div>

                {/* Tailscale Badge */}
                {hasTailscale ? (
                    <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs px-2 py-1 rounded-md border border-blue-100 dark:border-blue-900/50 flex flex-col items-end">
                        <span className="font-medium">Tailscale Active</span>
                        <span className="font-mono opacity-80">{tailscaleDevice.addresses[0]}</span>
                    </div>
                ) : (
                    <div className="bg-gray-100 dark:bg-zinc-700 text-gray-500 dark:text-gray-400 text-xs px-2 py-1 rounded-md">
                        Not Connected
                    </div>
                )}
            </div>

            <div className="border-t border-gray-100 dark:border-zinc-700 my-1"></div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1">
                    {/* Power Controls */}
                    {!isRunning && (
                        <button
                            onClick={() => onPowerAction(node, type, vmid, 'start')}
                            className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg transition-colors"
                            title="Start"
                        >
                            <Play size={18} />
                        </button>
                    )}

                    {isRunning && (
                        <>
                            <button
                                onClick={() => onPowerAction(node, type, vmid, 'stop')} // Or shutdown
                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                                title="Stop (Force)"
                            >
                                <Square size={18} />
                            </button>
                            <button
                                onClick={() => onPowerAction(node, type, vmid, 'reboot')}
                                className="p-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg transition-colors"
                                title="Reboot"
                            >
                                <RefreshCcw size={18} />
                            </button>
                        </>
                    )}
                </div>

                {/* Install Action */}
                {!hasTailscale && isRunning && (
                    <button
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                        onClick={() => alert('Install Feature Coming Soon!')}
                    >
                        <Download size={16} />
                        Install Tailscale
                    </button>
                )}
            </div>
        </div>
    );
}
