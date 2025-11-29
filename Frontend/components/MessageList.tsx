'use client';

import { MessageSquare } from 'lucide-react';
import { MessageBubble } from './MessageBubble';

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
};

type MessageListProps = {
    messages: Message[];
    isLoading?: boolean;
    emptyMessage?: string;
    onMessageUpdate?: () => void;
};

export function MessageList({
    messages,
    isLoading,
    emptyMessage = 'No messages yet. Start the conversation!',
    onMessageUpdate,
}: MessageListProps) {
    return (
        <div
            style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.5rem',
            }}
        >
            {isLoading && messages.length === 0 ? (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                    }}
                >
                    <p
                        style={{
                            color: 'rgba(255, 255, 255, 0.5)',
                        }}
                    >
                        Loading messages...
                    </p>
                </div>
            ) : messages.length === 0 ? (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                    }}
                >
                    <div style={{ textAlign: 'center' }}>
                        <MessageSquare
                            style={{
                                width: '3rem',
                                height: '3rem',
                                margin: '0 auto 0.75rem',
                                color: 'rgba(255, 255, 255, 0.2)',
                            }}
                        />
                        <p
                            style={{
                                color: 'rgba(255, 255, 255, 0.5)',
                            }}
                        >
                            {emptyMessage}
                        </p>
                    </div>
                </div>
            ) : (
                <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
                    {messages.map((message, index) => {
                        // Determine if this message should be grouped with the previous one
                        const prevMessage = index > 0 ? messages[index - 1] : null;
                        const isGrouped = prevMessage !== null &&
                            prevMessage.isSelf === message.isSelf &&
                            prevMessage.sender === message.sender &&
                            typeof prevMessage.timestamp === 'number' &&
                            typeof message.timestamp === 'number' &&
                            (message.timestamp - prevMessage.timestamp) < 300; // 5 minutes

                        return (
                            <MessageBubble
                                key={message.id}
                                message={message}
                                index={index}
                                showAvatar={!isGrouped}
                                isGrouped={isGrouped}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
