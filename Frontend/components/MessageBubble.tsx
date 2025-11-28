'use client';

import { CheckCheck, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type Message = {
    id: string;
    author: string;
    role?: string;
    timestamp: number | string;
    body: string;
    isSelf: boolean;
    status: 'pending' | 'delivered' | 'read';
    messageHash?: string;
};

type MessageBubbleProps = {
    message: Message;
};

export function MessageBubble({ message }: MessageBubbleProps) {
    const isSelf = message.isSelf;
    const timeAgo =
        typeof message.timestamp === 'number'
            ? formatDistanceToNow(new Date(message.timestamp * 1000), { addSuffix: true })
            : message.timestamp;

    const statusIcon =
        message.status === 'read' ? (
            <CheckCheck className="size-3.5 text-emerald-400" />
        ) : message.status === 'delivered' ? (
            <CheckCheck className="size-3.5 text-slate-400" />
        ) : (
            <Clock className="size-3.5 text-slate-500" />
        );

    return (
        <div
            className={`mb-4 flex flex-col gap-2 ${isSelf ? 'items-end' : 'items-start'
                }`}
        >
            <div className="flex items-center gap-2 text-xs text-slate-400">
                {!isSelf && (
                    <>
                        <span className="font-medium text-slate-300">{message.author}</span>
                        {message.role && (
                            <span className="text-slate-500">· {message.role}</span>
                        )}
                        <span className="text-slate-600">·</span>
                    </>
                )}
                <span>{timeAgo}</span>
            </div>

            <div
                className={`max-w-[75%] rounded-3xl border px-4 py-3 text-sm leading-relaxed shadow-lg ${isSelf
                        ? 'border-sky-500/40 bg-sky-500/10 text-sky-50 shadow-sky-900/40'
                        : 'border-white/10 bg-white/5 text-slate-100 shadow-black/30'
                    }`}
            >
                <p className="whitespace-pre-wrap wrap-break-word">{message.body}</p>
                {message.messageHash && (
                    <p className="mt-2 font-mono text-[10px] text-slate-500">
                        {message.messageHash.slice(0, 16)}...
                    </p>
                )}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                {statusIcon}
                <span className="uppercase tracking-wide">
                    {message.status === 'read'
                        ? 'Read on Base'
                        : message.status === 'delivered'
                            ? 'Delivered'
                            : 'Pending'}
                </span>
            </div>
        </div>
    );
}

