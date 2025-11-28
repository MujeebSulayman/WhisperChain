'use client';

import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';

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

type MessageListProps = {
    messages: Message[];
    isLoading?: boolean;
    emptyMessage?: string;
};

export function MessageList({
    messages,
    isLoading,
    emptyMessage = 'No messages yet. Start the conversation!',
}: MessageListProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <div className="mb-2 inline-block size-6 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
                    <p className="text-sm text-slate-400">Loading messages...</p>
                </div>
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-sm text-slate-500">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div
            ref={scrollRef}
            className="flex h-full flex-col gap-2 overflow-y-auto px-4 py-6"
        >
            {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
            ))}
        </div>
    );
}

