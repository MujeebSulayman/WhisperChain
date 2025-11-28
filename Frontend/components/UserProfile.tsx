'use client';

import { ShieldCheck, Circle } from 'lucide-react';

type UserProfileProps = {
    address: string;
    username?: string;
    publicKey?: string;
    status?: 'online' | 'away' | 'offline';
    isRegistered?: boolean;
};

export function UserProfile({
    address,
    username,
    publicKey,
    status = 'offline',
    isRegistered = false,
}: UserProfileProps) {
    const statusColors = {
        online: 'bg-emerald-500',
        away: 'bg-amber-500',
        offline: 'bg-slate-500',
    };

    return (
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 p-4">
            <div className="relative">
                <div className="size-12 rounded-full bg-gradient-to-br from-sky-500 to-violet-500" />
                <div
                    className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-slate-900 ${statusColors[status]}`}
                />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="font-semibold text-white">
                        {username || `${address.slice(0, 6)}...${address.slice(-4)}`}
                    </p>
                    {isRegistered && (
                        <ShieldCheck className="size-4 text-emerald-400" />
                    )}
                </div>
                <p className="font-mono text-xs text-slate-400">{address}</p>
                {publicKey && (
                    <p className="mt-1 font-mono text-[10px] text-slate-600">
                        Key: {publicKey.slice(0, 16)}...
                    </p>
                )}
            </div>
        </div>
    );
}

