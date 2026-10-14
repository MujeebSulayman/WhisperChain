'use client';

import { MessageSquare } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { useIsMobile } from '../hooks/useMediaQuery';

type Message = {
    id: string;
    author: string;
    timestamp: number | string;
    body: string;
    isSelf: boolean;
    status: 'pending' | 'delivered' | 'read';
    messageHash?: string;
    messageId?: string;
    ipfsHash?: string;
    mediaType?: number;
    fileSize?: bigint;
    sender?: string;
    recipient?: string;
    paymentAmount?: bigint;
    paymentToken?: string;
};

type MessageListProps = {
    messages: Message[];
    isLoading?: boolean;
    emptyMessage?: string;
    onMessageUpdate?: () => void;
    connectedAddress?: string;
};

export function MessageList({
    messages,
    isLoading,
    emptyMessage = 'No messages yet. Start the conversation!',
    onMessageUpdate,
    connectedAddress,
}: MessageListProps) {
    return (
        <div className="relative min-h-full px-3 py-6 md:px-6">
            {isLoading && messages.length === 0 ? (
                <div className="flex h-full min-h-[12rem] items-center justify-center">
                    <div className="text-center">
                        <span className="mx-auto mb-5 block h-9 w-9 animate-spin rounded-full border-2 border-accent/20 border-t-accent" />
                        <p className="label">Reading from Base</p>
                    </div>
                </div>
            ) : messages.length === 0 ? (
                <div className="flex h-full min-h-[14rem] items-center justify-center">
                    <div className="max-w-[22rem] text-center">
                        <span className="tile mx-auto h-14 w-14 rounded-[var(--r-inset)]">
                            <MessageSquare size={24} strokeWidth={1.8} />
                        </span>
                        <h3 className="h3 mt-5">No messages yet</h3>
                        <p className="mt-2 text-[14px] leading-relaxed text-dim">{emptyMessage}</p>
                    </div>
                </div>
            ) : (
                <div className="mx-auto max-w-[48rem] pb-4">
                    {messages.map((message, index) => {
                        const prevMessage = index > 0 ? messages[index - 1] : null;
                        const isGrouped = prevMessage !== null &&
                            prevMessage.isSelf === message.isSelf &&
                            prevMessage.sender === message.sender &&
                            typeof prevMessage.timestamp === 'number' &&
                            typeof message.timestamp === 'number' &&
                            (message.timestamp - prevMessage.timestamp) < 300; // 5 minutes

                        return (
                            <div key={message.id} data-message-id={message.messageId || message.id}>
                                <MessageBubble
                                    message={message}
                                    index={index}
                                    showAvatar={!isGrouped}
                                    isGrouped={isGrouped}
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
