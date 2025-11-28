'use client';

import { useEffect, useRef, useState } from 'react';
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
    onMessageUpdate?: () => void;
};

function SkeletonMessage() {
    return (
        <div className="mb-4 flex flex-col gap-2 animate-pulse">
            <div className="h-3 w-24 rounded bg-slate-800" />
            <div className="h-20 w-3/4 rounded-3xl bg-slate-800" />
            <div className="h-3 w-32 rounded bg-slate-800" />
        </div>
    );
}

export function MessageList({
    messages,
    isLoading,
    emptyMessage = 'No messages yet. Start the conversation!',
    onMessageUpdate,
}: MessageListProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const prevMessagesLength = useRef(messages.length);

    useEffect(() => {
        if (scrollRef.current && isAtBottom) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: prevMessagesLength.current < messages.length ? 'smooth' : 'auto',
            });
        }
        prevMessagesLength.current = messages.length;
    }, [messages, isAtBottom]);

    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            setIsAtBottom(scrollHeight - scrollTop - clientHeight < 100);
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center p-6">
                <div className="w-full max-w-2xl space-y-4">
                    {[1, 2, 3].map((i) => (
                        <SkeletonMessage key={i} />
                    ))}
                </div>
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="flex h-full items-center justify-center p-6">
                <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mx-auto mb-4 size-16 rounded-full bg-gradient-to-br from-sky-500/20 to-violet-500/20 flex items-center justify-center">
                        <div className="size-8 rounded-full bg-gradient-to-br from-sky-500 to-violet-500 opacity-50" />
                    </div>
                    <p className="text-sm font-medium text-slate-400">{emptyMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={scrollRef}
            className="flex h-full flex-col gap-2 overflow-y-auto px-4 py-6 scroll-smooth"
            style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(148, 163, 184, 0.3) transparent',
            }}
        >
            {messages.map((message, index) => (
                <MessageBubble
                    key={message.id}
                    message={message}
                    index={index}
                    onUpdate={onMessageUpdate}
                />
            ))}
        </div>
    );
}
