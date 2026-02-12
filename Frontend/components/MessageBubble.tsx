'use client';

import { CheckCheck, Image, Video, Music, FileText, ExternalLink, Coins, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { getIPFSUrl, getMediaTypeName } from '@WhisperChain/lib/ipfs';
import { formatEther, ZeroAddress } from 'ethers';
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
    paymentSettled?: boolean;
};

type MessageBubbleProps = {
    message: Message;
    index?: number;
    showAvatar?: boolean;
    isGrouped?: boolean;
};

export function MessageBubble({ message, index = 0, showAvatar = true, isGrouped = false }: MessageBubbleProps) {
    const isMobile = useIsMobile();
    const [isVisible, setIsVisible] = useState(false);
    const isSelf = message.isSelf;

    const timestamp = typeof message.timestamp === 'number' ? message.timestamp * 1000 : new Date(message.timestamp).getTime();
    const exactTime = format(new Date(timestamp), 'HH:mm');

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), index * 30);
        return () => clearTimeout(timer);
    }, [index]);

    const showReadStatus = isSelf && message.status === 'read';
    const hasMedia = Boolean(message.ipfsHash && (message.mediaType ?? 0) > 0);
    const isImage = message.mediaType === 1;

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

    const getAvatarInitial = () => {
        if (isSelf) return 'You'[0];
        return message.author?.[0]?.toUpperCase() || 'U';
    };

    const getAvatarColor = () => {
        if (isSelf) return '#6366f1';
        const hash = message.sender?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
        const colors = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
        return colors[hash % colors.length];
    };

    return (
        <div
            style={{
                marginBottom: isGrouped ? (isMobile ? '0.25rem' : '0.375rem') : (isMobile ? '0.75rem' : '1rem'),
                display: 'flex',
                flexDirection: 'row',
                gap: isMobile ? '0.5rem' : '0.625rem',
                alignItems: 'flex-end',
                justifyContent: isSelf ? 'flex-end' : 'flex-start',
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 0.2s ease-out',
                paddingLeft: isSelf ? (isMobile ? '1rem' : '2rem') : '0',
                paddingRight: isSelf ? '0' : (isMobile ? '1rem' : '2rem'),
            }}
            className="animate-slide-up"
        >
            {!isSelf && showAvatar && !isGrouped && (
                <div
                    style={{
                        width: isMobile ? '2rem' : '2.25rem',
                        height: isMobile ? '2rem' : '2.25rem',
                        borderRadius: '50%',
                        background: getAvatarColor(),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: isMobile ? '0.6875rem' : '0.75rem',
                        flexShrink: 0,
                    }}
                >
                    {getAvatarInitial()}
                </div>
            )}
            {!isSelf && showAvatar && isGrouped && (
                <div style={{ width: isMobile ? '2rem' : '2.25rem', flexShrink: 0 }} />
            )}

            <div
                style={{
                    maxWidth: isMobile ? '85%' : '75%',
                    minWidth: isMobile ? '4rem' : '6rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.375rem',
                }}
            >
                {!isSelf && !isGrouped && (
                    <div
                        style={{
                            marginBottom: '0.375rem',
                            paddingLeft: '0.625rem',
                        }}
                    >
                        <span
                            style={{
                                fontSize: '0.8125rem',
                                fontWeight: 500,
                                color: 'rgba(255, 255, 255, 0.8)',
                            }}
                        >
                            {message.author}
                        </span>
                    </div>
                )}

                <div
                    style={{
                        borderRadius: isSelf
                            ? (isGrouped ? '1.25rem 0.5rem 1.25rem 1.25rem' : '1.25rem 0.5rem 1.25rem 1.25rem')
                            : (isGrouped ? '0.5rem 1.25rem 1.25rem 1.25rem' : '0.5rem 1.25rem 1.25rem 1.25rem'),
                        padding: isImage && message.ipfsHash ? '0' : '0.8125rem 1.125rem',
                        background: isSelf
                            ? 'linear-gradient(145deg, rgba(99, 102, 241, 0.22) 0%, rgba(79, 70, 229, 0.12) 100%)'
                            : 'linear-gradient(145deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.04) 100%)',
                        border: `1px solid ${isSelf ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.08)'}`,
                        boxShadow: isSelf
                            ? '0 2px 12px rgba(99, 102, 241, 0.08), 0 1px 2px rgba(0, 0, 0, 0.1)'
                            : '0 1px 4px rgba(0, 0, 0, 0.06)',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: message.body && isImage && message.ipfsHash ? '0.5rem' : '0',
                        backdropFilter: 'blur(12px)',
                        transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        if (!isSelf) {
                            e.currentTarget.style.background = 'linear-gradient(145deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.05) 100%)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isSelf) {
                            e.currentTarget.style.background = 'linear-gradient(145deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.04) 100%)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                        }
                    }}
                >
                    {message.body && (
                        <p
                            style={{
                                fontSize: '0.9375rem',
                                lineHeight: '1.5',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                color: '#ffffff',
                                margin: 0,
                                padding: isImage && message.ipfsHash ? '0.75rem 0.875rem 0 0.875rem' : '0',
                            }}
                        >
                            {message.body}
                        </p>
                    )}

                    {message.ipfsHash && (message.mediaType ?? 0) > 0 && (
                        <div
                            style={{
                                marginTop: message.body ? '0.875rem' : '0',
                                paddingTop: message.body ? '0.875rem' : '0',
                                borderTop: message.body ? `1px solid ${isSelf ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.1)'}` : 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.625rem',
                            }}
                        >
                            {message.mediaType === 1 && (
                                <div
                                    style={{
                                        borderRadius: message.body ? '0.5rem' : isSelf ? '1.125rem 0.25rem 0 0' : '0.25rem 1.125rem 0 0',
                                        overflow: 'hidden',
                                        maxWidth: '100%',
                                        maxHeight: '20rem',
                                        background: 'rgba(0, 0, 0, 0.2)',
                                        position: 'relative',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => window.open(getIPFSUrl(message.ipfsHash!), '_blank')}
                                >
                                    <img
                                        src={getIPFSUrl(message.ipfsHash!)}
                                        alt="Shared image"
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            maxHeight: '20rem',
                                            objectFit: 'contain',
                                            display: 'block',
                                        }}
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            const parent = e.currentTarget.parentElement;
                                            if (parent) {
                                                parent.innerHTML = `
                                                    <div style="padding: 2rem; text-align: center; color: rgba(255, 255, 255, 0.5);">
                                                        <p>Image preview unavailable</p>
                                                        <a href="${getIPFSUrl(message.ipfsHash!)}" target="_blank" style="color: #6366f1; text-decoration: none;">Open in new tab</a>
                                                    </div>
                                                `;
                                            }
                                        }}
                                    />
                                </div>
                            )}

                            {message.mediaType === 4 && (
                                <a
                                    href={getIPFSUrl(message.ipfsHash!)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        textDecoration: 'none',
                                        display: 'block',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '0.875rem',
                                            borderRadius: '0.75rem',
                                            background: isSelf ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                            border: `1px solid ${isSelf ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`,
                                            transition: 'all 0.2s',
                                            cursor: 'pointer',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = isSelf ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.08)';
                                            e.currentTarget.style.borderColor = isSelf ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.15)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = isSelf ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.05)';
                                            e.currentTarget.style.borderColor = isSelf ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.1)';
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: '3rem',
                                                height: '3rem',
                                                borderRadius: '0.5rem',
                                                background: isSelf ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <FileText style={{ width: '1.5rem', height: '1.5rem', color: isSelf ? '#a5b4fc' : 'rgba(255, 255, 255, 0.7)' }} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div
                                                style={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: 500,
                                                    color: '#ffffff',
                                                    marginBottom: '0.25rem',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                Document
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: '0.75rem',
                                                    color: 'rgba(255, 255, 255, 0.6)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                }}
                                            >
                                                {message.fileSize && (
                                                    <span>{formatFileSize(message.fileSize)}</span>
                                                )}
                                                <span>•</span>
                                                <span style={{ fontFamily: 'monospace', fontSize: '0.6875rem' }}>
                                                    {message.ipfsHash.slice(0, 8)}...{message.ipfsHash.slice(-6)}
                                                </span>
                                            </div>
                                        </div>
                                        <ExternalLink style={{ width: '1rem', height: '1rem', color: 'rgba(255, 255, 255, 0.5)', flexShrink: 0 }} />
                                    </div>
                                </a>
                            )}

                            {(message.mediaType === 2 || message.mediaType === 3) && (
                                <a
                                    href={getIPFSUrl(message.ipfsHash!)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        textDecoration: 'none',
                                        display: 'block',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '0.875rem',
                                            borderRadius: '0.75rem',
                                            background: isSelf ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                            border: `1px solid ${isSelf ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`,
                                            transition: 'all 0.2s',
                                            cursor: 'pointer',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = isSelf ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.08)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = isSelf ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.05)';
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: '3rem',
                                                height: '3rem',
                                                borderRadius: '0.5rem',
                                                background: isSelf ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                            }}
                                        >
                                            {getMediaIcon(message.mediaType)}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div
                                                style={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: 500,
                                                    color: '#ffffff',
                                                    marginBottom: '0.25rem',
                                                }}
                                            >
                                                {getMediaTypeName(message.mediaType)}
                                            </div>
                                            {message.fileSize && (
                                                <div
                                                    style={{
                                                        fontSize: '0.75rem',
                                                        color: 'rgba(255, 255, 255, 0.6)',
                                                    }}
                                                >
                                                    {formatFileSize(message.fileSize)}
                                                </div>
                                            )}
                                        </div>
                                        <ExternalLink style={{ width: '1rem', height: '1rem', color: 'rgba(255, 255, 255, 0.5)', flexShrink: 0 }} />
                                    </div>
                                </a>
                            )}
                        </div>
                    )}

                    {message.paymentAmount !== undefined && message.paymentAmount !== null && message.paymentAmount > BigInt(0) && (
                        <div
                            style={{
                                marginTop: (message.body || hasMedia) ? '0.875rem' : '0',
                                paddingTop: (message.body || hasMedia) ? '0.875rem' : '0',
                                borderTop: (message.body || hasMedia)
                                    ? `1px solid ${isSelf ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`
                                    : 'none',
                                padding: '0.75rem 1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                background: message.paymentSettled
                                    ? 'rgba(16, 185, 129, 0.1)'
                                    : isSelf
                                        ? 'rgba(99, 102, 241, 0.1)'
                                        : 'rgba(245, 158, 11, 0.1)',
                                borderRadius: '0.5rem',
                                border: `1px solid ${message.paymentSettled
                                    ? 'rgba(16, 185, 129, 0.2)'
                                    : isSelf
                                        ? 'rgba(99, 102, 241, 0.2)'
                                        : 'rgba(245, 158, 11, 0.2)'
                                    }`,
                            }}
                        >
                            <Coins style={{
                                width: '1rem',
                                height: '1rem',
                                color: message.paymentSettled
                                    ? '#34d399'
                                    : isSelf
                                        ? '#a5b4fc'
                                        : '#fbbf24',
                            }} />
                            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#ffffff' }}>
                                {isSelf ? 'Sent' : 'Received'} {formatEther(message.paymentAmount)}{' '}
                                {message.paymentToken === ZeroAddress ? 'Base ETH' : 'Tokens'}
                            </span>
                            {message.paymentSettled && (
                                <CheckCheck style={{ width: '0.75rem', height: '0.75rem', color: '#34d399', flexShrink: 0 }} />
                            )}
                        </div>
                    )}

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: '0.375rem',
                            padding: isImage && message.ipfsHash
                                ? '0.5rem 1rem 0.75rem'
                                : message.paymentAmount && message.paymentAmount > BigInt(0)
                                    ? '0.5rem 0.875rem 0.75rem'
                                    : '0.25rem 0 0 0',
                            fontSize: '0.6875rem',
                            color: 'rgba(255, 255, 255, 0.4)',
                        }}
                    >
                        <span>
                            {exactTime}
                        </span>
                        {showReadStatus && (
                            <CheckCheck style={{ width: '0.75rem', height: '0.75rem', color: '#10b981', flexShrink: 0 }} />
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
