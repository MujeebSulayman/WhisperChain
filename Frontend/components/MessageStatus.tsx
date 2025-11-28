'use client';

import { CheckCheck, Clock, AlertCircle } from 'lucide-react';

type MessageStatusProps = {
    status: 'pending' | 'delivered' | 'read' | 'failed';
    showLabel?: boolean;
};

export function MessageStatus({
    status,
    showLabel = true,
}: MessageStatusProps) {
    const config = {
        pending: {
            icon: Clock,
            color: 'text-slate-500',
            label: 'Pending',
        },
        delivered: {
            icon: CheckCheck,
            color: 'text-slate-400',
            label: 'Delivered',
        },
        read: {
            icon: CheckCheck,
            color: 'text-emerald-400',
            label: 'Read on Base',
        },
        failed: {
            icon: AlertCircle,
            color: 'text-red-400',
            label: 'Failed',
        },
    };

    const { icon: Icon, color, label } = config[status];

    return (
        <div className={`flex items-center gap-1.5 text-[11px] ${color}`}>
            <Icon className="size-3.5" />
            {showLabel && <span className="uppercase tracking-wide">{label}</span>}
        </div>
    );
}

