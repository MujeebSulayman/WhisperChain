'use client';

import { CheckCheck, Clock, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect } from 'react';
import { MessageActions } from './MessageActions';
import { getIPFSUrl } from '@WhisperChain/lib/ipfs';

type Message = {
    id: string;
    author: string;
    role?: string;
    timestamp: number | string;
    body: string;
    isSelf: boolean;
    status: 'pending' | 'delivered' | 'read';
    messageHash?: string;
    messageId?: string;
    ipfsHash?: string;
    mediaType?: number;
};

type MessageBubbleProps = {
    message: Message;
    index?: number;
    onUpdate?: () => void;
};

export function MessageBubble({ message, index = 0, onUpdate }: MessageBubbleProps) {
    const [isVisible, setIsVisible] = useState(false);
    const isSelf = message.isSelf;
    const timeAgo =
        typeof message.timestamp === 'number'
            ? formatDistanceToNow(new Date(message.timestamp * 1000), { addSuffix: true })
            : message.timestamp;

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), index * 50);
        return () => clearTimeout(timer);
    }, [index]);

    const statusConfig = {
        read: {
            icon: CheckCheck,
            color: 'text-emerald-400',
            label: 'Read on Base',
            glow: 'shadow-emerald-500/20',
        },
        delivered: {
            icon: CheckCheck,
            color: 'text-slate-400',
            label: 'Delivered',
            glow: '',
        },
        pending: {
            icon: Clock,
            color: 'text-slate-500',
            label: 'Pending',
            glow: 'animate-pulse',
        },
    };

    const { icon: StatusIcon, color, label, glow } = statusConfig[message.status];

    return (
        <div
            className={`mb-4 flex flex-col gap-2 transition-all duration-500 ${isSelf ? 'items-end' : 'items-start'
                } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: `${index * 50}ms` }}
        >
            <div className="flex items-center gap-2 text-xs text-slate-400">
                {!isSelf && (
                    <>
                        <span className="font-medium text-slate-300 transition-colors hover:text-slate-200">
                            {message.author}
                        </span>
                        {message.role && (
                            <span className="text-slate-500">· {message.role}</span>
                        )}
                        <span className="text-slate-600">·</span>
                    </>
                )}
                <span className="transition-opacity hover:opacity-100 opacity-80">
                    {timeAgo}
                </span>
            </div>

            <div
                className={`group relative max-w-[75%] rounded-3xl border px-4 py-3 text-sm leading-relaxed shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${isSelf
                    ? `border-sky-500/40 bg-gradient-to-br from-sky-500/15 to-sky-600/10 text-sky-50 shadow-sky-900/40 ${glow}`
                    : 'border-white/10 bg-gradient-to-br from-white/10 to-white/5 text-slate-100 shadow-black/30 hover:border-white/20'
                    }`}
            >
                {message.status === 'pending' && (
                    <div className="absolute -top-1 -right-1">
                        <Sparkles className="size-3 text-sky-400 animate-pulse" />
                    </div>
                )}
                <p className="whitespace-pre-wrap wrap-break-word">{message.body}</p>
                {message.ipfsHash && (
                    <div className="mt-3 rounded-lg border border-white/10 bg-slate-800/50 p-3">
                        <a
                            href={getIPFSUrl(message.ipfsHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1"
                        >
                            <Sparkles className="size-3" />
                            View on IPFS: {message.ipfsHash.slice(0, 12)}...
                        </a>
                    </div>
                )}
                {message.messageHash && (
                    <p className="mt-2 font-mono text-[10px] text-slate-500/70 transition-opacity group-hover:opacity-100 opacity-60">
                        Hash: {message.messageHash.slice(0, 16)}...
                    </p>
                )}
            </div>

            <div className="flex items-center justify-between">
                <div
                    className={`flex items-center gap-1.5 text-[11px] transition-all duration-300 ${color}`}
                >
                    <StatusIcon className={`size-3.5 transition-transform ${glow}`} />
                    <span className="uppercase tracking-wide font-medium">{label}</span>
                </div>
                {message.messageId && onUpdate && (
                    <MessageActions
                        messageId={message.messageId}
                        isDelivered={message.status === 'delivered' || message.status === 'read'}
                        isRead={message.status === 'read'}
                        isSelf={message.isSelf}
                        onUpdate={onUpdate}
                    />
                )}
            </div>
        </div>
    );
}
