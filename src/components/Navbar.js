import Link from 'next/link';
import { LayoutDashboard, Settings } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-950">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        TB
                    </div>
                    <span className="text-lg font-semibold tracking-tight">Tailscale Buddy</span>
                </div>

                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                        <LayoutDashboard size={18} />
                        Dashboard
                    </Link>
                    <Link href="/settings" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                        <Settings size={18} />
                        Settings
                    </Link>
                </div>
            </div>
        </nav>
    );
}
