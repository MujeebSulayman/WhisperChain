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
                padding: isMobile ? '1.25rem 0.875rem' : '1.5rem 1.25rem',
                background: 'transparent',
                minHeight: '100%',
                position: 'relative',
            }}
            className="chat-message-list"
        >
            {isLoading && messages.length === 0 ? (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        minHeight: '12rem',
                    }}
                >
                    <div style={{ textAlign: 'center' }}>
                        <div
                            style={{
                                width: '2.25rem',
                                height: '2.25rem',
                                border: '2px solid rgba(99, 102, 241, 0.15)',
                                borderTopColor: 'rgba(139, 92, 246, 0.9)',
                                borderRadius: '50%',
                                margin: '0 auto 1.25rem',
                                animation: 'spin 0.8s linear infinite',
                            }}
                        />
                        <p style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '0.8125rem', fontWeight: 500 }}>
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
                        minHeight: '14rem',
                    }}
                >
                    <div style={{ textAlign: 'center', maxWidth: '20rem' }}>
                        <div
                            style={{
                                width: '4.5rem',
                                height: '4.5rem',
                                borderRadius: '1rem',
                                background: 'linear-gradient(145deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem',
                                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
                            }}
                        >
                            <MessageSquare style={{ width: '2rem', height: '2rem', color: 'rgba(167, 139, 250, 0.8)' }} />
                        </div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.95)', marginBottom: '0.5rem' }}>
                            No messages yet
                        </h3>
                        <p style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '0.875rem', lineHeight: 1.55 }}>
                            {emptyMessage}
                        </p>
                    </div>
                </div>
            ) : (
                <div style={{ maxWidth: isMobile ? '100%' : '48rem', margin: '0 auto', paddingBottom: isMobile ? '1rem' : '1.5rem' }}>
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
