'use client';

import { CheckCheck, Clock, Image, Video, Music, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect } from 'react';
import { MessageActions } from './MessageActions';
import { getIPFSUrl, getMediaTypeName } from '@WhisperChain/lib/ipfs';

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
        const timer = setTimeout(() => setIsVisible(true), index * 30);
        return () => clearTimeout(timer);
    }, [index]);

    const statusConfig = {
        read: {
            icon: CheckCheck,
            color: '#10b981',
            label: 'Read',
        },
        delivered: {
            icon: CheckCheck,
            color: '#6366f1',
            label: 'Delivered',
        },
        pending: {
            icon: Clock,
            color: 'rgba(255, 255, 255, 0.4)',
            label: 'Pending',
        },
    };

    const { icon: StatusIcon, color, label } = statusConfig[message.status];

    const getMediaIcon = (type?: number) => {
        switch (type) {
            case 1:
                return <Image style={{ width: '0.875rem', height: '0.875rem' }} />;
            case 2:
                return <Video style={{ width: '0.875rem', height: '0.875rem' }} />;
            case 3:
                return <Music style={{ width: '0.875rem', height: '0.875rem' }} />;
            case 4:
                return <FileText style={{ width: '0.875rem', height: '0.875rem' }} />;
            default:
                return null;
        }
    };

    const formatFileSize = (bytes?: bigint) => {
        if (!bytes) return '';
        const num = Number(bytes);
        if (num < 1024) return `${num} B`;
        if (num < 1024 * 1024) return `${(num / 1024).toFixed(2)} KB`;
        return `${(num / 1024 / 1024).toFixed(2)} MB`;
    };

    return (
        <div
            style={{
                marginBottom: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                alignItems: isSelf ? 'flex-end' : 'flex-start',
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 0.3s ease-out',
            }}
            className="animate-slide-up"
        >
            {!isSelf && (
                <span
                    style={{
                        fontSize: '0.75rem',
                        color: 'rgba(255, 255, 255, 0.5)',
                        padding: '0 0.5rem',
                        marginBottom: '0.25rem',
                    }}
                >
                    {message.author}
                </span>
            )}

            <div
                style={{
                    maxWidth: '70%',
                    borderRadius: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: isSelf ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${isSelf ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)'}`,
                    color: '#e5e5e5',
                }}
            >
                <p
                    style={{
                        fontSize: '0.875rem',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        color: '#ffffff',
                    }}
                >
                    {message.body}
                </p>

                {message.ipfsHash && (
                    <div
                        style={{
                            marginTop: '0.75rem',
                            paddingTop: '0.75rem',
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                        }}
                    >
                        {message.mediaType !== undefined && message.mediaType > 0 && (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.75rem',
                                    color: 'rgba(255, 255, 255, 0.7)',
                                }}
                            >
                                {getMediaIcon(message.mediaType)}
                                <span style={{ fontFamily: 'monospace' }}>
                                    {getMediaTypeName(message.mediaType)}
                                </span>
                                {message.fileSize && (
                                    <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                        • {formatFileSize(message.fileSize)}
                                    </span>
                                )}
                            </div>
                        )}
                        <a
                            href={getIPFSUrl(message.ipfsHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                fontSize: '0.75rem',
                                color: '#6366f1',
                                textDecoration: 'none',
                                fontFamily: 'monospace',
                                transition: 'color 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#818cf8';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = '#6366f1';
                            }}
                        >
                            IPFS: {message.ipfsHash.slice(0, 12)}...{message.ipfsHash.slice(-8)}
                        </a>
                    </div>
                )}
            </div>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0 0.5rem',
                    flexWrap: 'wrap',
                }}
            >
                <span
                    style={{
                        fontSize: '0.625rem',
                        color: 'rgba(255, 255, 255, 0.4)',
                        fontFamily: 'monospace',
                    }}
                >
                    {timeAgo}
                </span>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        color: color,
                    }}
                >
                    <StatusIcon style={{ width: '0.75rem', height: '0.75rem' }} />
                    <span style={{ fontSize: '0.625rem', fontFamily: 'monospace' }}>{label}</span>
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
