'use client';

import { Menu, MessagesSquare, Zap, ExternalLink } from 'lucide-react';
import { explorerAddress } from '@/lib/links';
import { CopyAddress, shortAddress } from './CopyAddress';
import { isGaslessConfigured } from '@/lib/gasless';
import { BASE_CHAIN } from '@/lib/deployments';

type ChatHeaderProps = {
    threadTitle?: string;
    /** The other person in a 1:1 chat, so their address can be copied. */
    peerAddress?: string;
    onMenuClick?: () => void;
    showMenu?: boolean;
    onConversationsClick?: () => void;
    showConversations?: boolean;
    isMobile?: boolean;
};

export function ChatHeader({ threadTitle, peerAddress, onMenuClick, showMenu = false, onConversationsClick, showConversations = true, isMobile = false }: ChatHeaderProps) {
    const getInitials = (title?: string) => {
        if (!title) return 'C';
        const parts = title.split(' ');
        if (parts.length > 1) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return title.slice(0, 2).toUpperCase();
    };

    return (
        <header className="relative z-10 flex h-16 shrink-0 items-center gap-3 border-b border-line px-3 md:px-5">
            {showMenu && (
                <button onClick={onMenuClick} className="icon-btn" aria-label="Open menu">
                    <Menu size={20} strokeWidth={1.8} />
                </button>
            )}

            {threadTitle ? (
                <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="avatar h-10 w-10">{getInitials(threadTitle)}</span>
                    <div className="min-w-0">
                        <h2 className="truncate text-[15px] font-semibold tracking-[-0.02em]">{threadTitle}</h2>
                        <p className="flex items-center gap-1.5 font-mono text-[11px] text-mute">
                            <span className="h-1.5 w-1.5 rounded-full bg-good" />
                            {peerAddress ? <span title={peerAddress}>{shortAddress(peerAddress)} · {BASE_CHAIN.name}</span> : BASE_CHAIN.name}
                        </p>
                    </div>
                    {peerAddress && (
                        <div className="flex shrink-0 items-center">
                            <CopyAddress text={peerAddress} label="their address" size={15} />
                            <a
                                href={explorerAddress(peerAddress)}
                                target="_blank"
                                rel="noreferrer"
                                className="grid place-items-center rounded-full p-1.5 text-mute transition-colors hover:bg-[color-mix(in_srgb,var(--fg)_8%,transparent)] hover:text-fg"
                                title="View on explorer"
                                aria-label="View their address on explorer"
                            >
                                <ExternalLink size={15} strokeWidth={1.8} />
                            </a>
                        </div>
                    )}
                </div>
            ) : (
                <p className="label flex-1">Scarf</p>
            )}

            {!isMobile && threadTitle && isGaslessConfigured() && (
                <span className="pill pill-accent h-7! px-3! text-[12px]">
                    <Zap size={12} strokeWidth={2} />
                    Gasless
                </span>
            )}

            {isMobile && onConversationsClick && (
                <button
                    onClick={onConversationsClick}
                    className={`icon-btn ${showConversations ? 'is-on' : ''}`}
                    title={showConversations ? 'Hide conversations' : 'Show conversations'}
                    aria-label={showConversations ? 'Hide conversations' : 'Show conversations'}
                >
                    <MessagesSquare size={20} strokeWidth={1.8} />
                </button>
            )}
        </header>
    );
}
