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
    const isMobile = useIsMobile();
    return (
        <div
            style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: isMobile ? '1rem 0.75rem' : '1.25rem 1rem',
                background: 'linear-gradient(to bottom, rgba(15, 15, 15, 0.5), rgba(15, 15, 15, 0.8))',
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
                    <div style={{ textAlign: 'center' }}>
                        <div
                            style={{
                                width: '2rem',
                                height: '2rem',
                                border: '2px solid rgba(99, 102, 241, 0.3)',
                                borderTopColor: '#6366f1',
                                borderRadius: '50%',
                                margin: '0 auto 1rem',
                                animation: 'spin 1s linear infinite',
                            }}
                        />
                        <p
                            style={{
                                color: 'rgba(255, 255, 255, 0.5)',
                                fontSize: '0.875rem',
                            }}
                        >
                            Loading messages...
                        </p>
                    </div>
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
                    <div style={{ textAlign: 'center', maxWidth: '20rem' }}>
                        <div
                            style={{
                                width: '4rem',
                                height: '4rem',
                                borderRadius: '50%',
                                background: 'rgba(99, 102, 241, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem',
                            }}
                        >
                            <MessageSquare
                                style={{
                                    width: '2rem',
                                    height: '2rem',
                                    color: 'rgba(99, 102, 241, 0.5)',
                                }}
                            />
                        </div>
                        <h3
                            style={{
                                fontSize: '1.125rem',
                                fontWeight: 600,
                                color: '#ffffff',
                                marginBottom: '0.5rem',
                            }}
                        >
                            No messages yet
                        </h3>
                        <p
                            style={{
                                color: 'rgba(255, 255, 255, 0.5)',
                                fontSize: '0.875rem',
                                lineHeight: '1.5',
                            }}
                        >
                            {emptyMessage}
                        </p>
                    </div>
                </div>
            ) : (
                <div style={{ maxWidth: isMobile ? '100%' : '52rem', margin: '0 auto', paddingBottom: isMobile ? '0.75rem' : '1rem' }}>
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
