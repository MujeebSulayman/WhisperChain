'use client';

import { CheckCheck, Image, Video, Music, FileText, ExternalLink, Coins } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { getIPFSUrl, getMediaTypeName } from '@/lib/ipfs';
import { formatTokenAmount } from '@/lib/token';
import { ZeroAddress } from 'ethers';
import { useTokenInfo } from '../hooks/useTokenInfo';

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

const mediaIconProps = { size: 20, strokeWidth: 1.8 } as const;

function MediaIcon({ type }: { type?: number }) {
    switch (type) {
        case 1:
            return <Image {...mediaIconProps} />;
        case 2:
            return <Video {...mediaIconProps} />;
        case 3:
            return <Music {...mediaIconProps} />;
        case 4:
            return <FileText {...mediaIconProps} />;
        default:
            return null;
    }
}

const formatFileSize = (bytes?: bigint) => {
    if (!bytes) return '';
    const num = Number(bytes);
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(2)} KB`;
    return `${(num / 1024 / 1024).toFixed(2)} MB`;
};

export function MessageBubble({ message, index = 0, showAvatar = true, isGrouped = false }: MessageBubbleProps) {
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
    const imageOnly = isImage && Boolean(message.ipfsHash);
    const hasPayment = message.paymentAmount != null && message.paymentAmount > BigInt(0);
    const paymentTokenInfo = useTokenInfo(message.paymentToken ?? ZeroAddress);
    const paymentLabel = message.paymentToken === ZeroAddress ? 'Base ETH' : paymentTokenInfo.symbol;
    const paymentAmountStr = message.paymentAmount != null
        ? formatTokenAmount(BigInt(message.paymentAmount), paymentTokenInfo.decimals)
        : '';

    const who = message.sender ?? message.author ?? '';
    const initials = (who.startsWith('0x') ? who.slice(2, 4) : who.slice(0, 2)).toUpperCase() || 'U';

    // Your messages are a solid ink pill (as in the Prinet chat); theirs are glass cards.
    const bubble = isSelf
        ? 'rounded-[22px] rounded-br-[8px] bg-[var(--btn-white-bg)] text-[var(--btn-white-fg)] shadow-[var(--edge-sm)]'
        : 'card !rounded-[22px] !rounded-bl-[8px] text-fg';
    const attachment = isSelf
        ? 'bg-[color-mix(in_srgb,var(--btn-white-fg)_8%,transparent)] hover:bg-[color-mix(in_srgb,var(--btn-white-fg)_12%,transparent)]'
        : 'inset-panel hover:brightness-110';
    const inner = isSelf ? 'bg-[color-mix(in_srgb,var(--btn-white-fg)_8%,transparent)]' : 'inset-panel';
    const subtle = isSelf ? 'opacity-60' : 'text-mute';

    return (
        <div
            className={`animate-slide-up flex items-end gap-2.5 transition-opacity duration-200 ${isSelf ? 'justify-end pl-8 md:pl-16' : 'justify-start pr-8 md:pr-16'} ${isGrouped ? 'mb-1' : 'mb-4'}`}
            style={{ opacity: isVisible ? 1 : 0 }}
        >
            {!isSelf && (showAvatar && !isGrouped
                ? <span className="avatar h-8 w-8 text-[11px]">{initials}</span>
                : <span className="w-8 shrink-0" />)}

            <div className="flex min-w-[6rem] max-w-[85%] flex-col gap-1.5 md:max-w-[75%]">
                {!isSelf && !isGrouped && <span className="pl-1 font-mono text-[11px] text-mute">{message.author}</span>}

                <div className={`flex flex-col overflow-hidden ${bubble} ${imageOnly ? '' : 'px-4 py-3'}`}>
                    {message.body && (
                        <p className={`whitespace-pre-wrap break-words text-[15px] leading-relaxed ${imageOnly ? 'px-4 pt-3' : ''}`}>
                            {message.body}
                        </p>
                    )}

                    {hasMedia && message.ipfsHash && (
                        <div className={`flex flex-col gap-2.5 ${message.body ? 'mt-3' : ''}`}>
                            {isImage ? (
                                <div
                                    className="relative max-h-80 cursor-pointer overflow-hidden bg-black/20"
                                    onClick={() => window.open(getIPFSUrl(message.ipfsHash!), '_blank')}
                                >
                                    <img
                                        src={getIPFSUrl(message.ipfsHash)}
                                        alt="Shared image"
                                        className="block h-auto max-h-80 w-full object-contain"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            const parent = e.currentTarget.parentElement;
                                            if (parent) {
                                                parent.innerHTML = `
                                                    <div style="padding: 2rem; text-align: center; color: var(--mute);">
                                                        <p>Image preview unavailable</p>
                                                        <a href="${getIPFSUrl(message.ipfsHash!)}" target="_blank" style="color: var(--accent);">Open in new tab</a>
                                                    </div>
                                                `;
                                            }
                                        }}
                                    />
                                </div>
                            ) : (
                                <a
                                    href={getIPFSUrl(message.ipfsHash)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-3 rounded-[16px] p-3 transition ${attachment}`}
                                >
                                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-[12px] ${isSelf ? inner : 'tile'}`}>
                                        <MediaIcon type={message.mediaType} />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-[14px] font-medium">
                                            {message.mediaType === 4 ? 'Document' : getMediaTypeName(message.mediaType ?? 0)}
                                        </span>
                                        <span className={`flex items-center gap-1.5 font-mono text-[11px] ${subtle}`}>
                                            {message.fileSize ? <span>{formatFileSize(message.fileSize)} ·</span> : null}
                                            <span className="truncate">
                                                ipfs://{message.ipfsHash.slice(0, 8)}…{message.ipfsHash.slice(-4)}
                                            </span>
                                        </span>
                                    </span>
                                    <ExternalLink size={15} strokeWidth={1.8} className={`shrink-0 ${subtle}`} />
                                </a>
                            )}
                        </div>
                    )}

                    {hasPayment && (
                        <div
                            className={`flex items-center gap-2.5 rounded-[var(--r-inset)] px-3 py-2.5 ${message.body || hasMedia ? 'mt-3' : ''} ${imageOnly ? 'mx-3' : ''} ${inner}`}
                        >
                            <Coins size={16} strokeWidth={1.8} className={message.paymentSettled ? 'text-good' : isSelf ? '' : 'text-accent'} />
                            <span className="min-w-0">
                                <span className={`block text-[11px] ${subtle}`}>{isSelf ? 'Payment sent' : 'Payment received'}</span>
                                <span className="block text-[15px] font-semibold tracking-[-0.02em]">
                                    {paymentTokenInfo.loading ? '…' : paymentAmountStr} {paymentLabel}
                                </span>
                            </span>
                            {message.paymentSettled && <CheckCheck size={14} className="ml-auto shrink-0 text-good" />}
                        </div>
                    )}

                    <div className={`flex items-center justify-end gap-1.5 font-mono text-[10px] ${subtle} ${imageOnly ? 'px-4 pb-3 pt-2' : 'pt-1.5'}`}>
                        {isSelf && message.status === 'pending' && <span>Sending ·</span>}
                        <span>{exactTime}</span>
                        {showReadStatus && <CheckCheck size={12} className="shrink-0 text-good" />}
                    </div>
                </div>
            </div>
        </div>
    );
}
