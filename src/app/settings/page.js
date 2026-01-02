export const dynamic = 'force-dynamic';

import SettingsForm from '@/components/SettingsForm';

export const metadata = {
    title: 'Settings - Tailscale Buddy',
};

export default function SettingsPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Settings</h1>
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700 overflow-hidden">
                <div className="p-6">
                    <SettingsForm />
                </div>
            </div>
        </div>
    );
}
