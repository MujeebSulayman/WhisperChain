'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ExternalLink, Menu, MessagesSquare, Users, Zap } from 'lucide-react';
import { isGaslessConfigured } from '@/lib/gasless';
import { explorerAddress } from '@/lib/links';
import { shortAddress, type Thread } from '@/lib/inbox';
import { CopyAddress } from './CopyAddress';
import { AddressAvatar } from './AddressAvatar';

type ChatHeaderProps = {
    thread?: Thread;
    connectedAddress?: string;
    onMenuClick?: () => void;
    showMenu?: boolean;
    onConversationsClick?: () => void;
    showConversations?: boolean;
    isMobile?: boolean;
};

const iconLink =
    'grid place-items-center rounded-full p-1.5 text-mute transition-colors hover:bg-[color-mix(in_srgb,var(--fg)_8%,transparent)] hover:text-fg';

/** Who this chat is with: the address for a DM, the member list for a group. */
export function ChatHeader({
    thread,
    connectedAddress,
    onMenuClick,
    showMenu = false,
    onConversationsClick,
    showConversations = true,
    isMobile = false,
}: ChatHeaderProps) {
    const [membersOpen, setMembersOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const me = connectedAddress?.toLowerCase();
    const peer = thread?.kind === 'direct' ? thread.participants.find((p) => p.toLowerCase() !== me) : undefined;

    useEffect(() => {
        if (!membersOpen) return;
        const onDown = (e: MouseEvent) => {
            if (!panelRef.current?.contains(e.target as Node)) setMembersOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, [membersOpen]);

    return (
        <header className="relative z-20 flex h-16 shrink-0 items-center gap-3 border-b border-line px-3 md:px-5">
            {showMenu && (
                <button onClick={onMenuClick} className="icon-btn" aria-label="Open menu">
                    <Menu size={20} strokeWidth={1.8} />
                </button>
            )}

            {thread && peer ? (
                <div className="flex min-w-0 flex-1 items-center gap-3">
                    <AddressAvatar address={peer} className="h-10 w-10" />
                    <div className="min-w-0">
                        <p className="label text-[10px]!">Direct chat</p>
                        <div className="flex items-center gap-0.5">
                            <h2 className="truncate font-mono text-[14px] font-semibold" title={peer}>
                                {isMobile ? shortAddress(peer) : peer}
                            </h2>
                            <CopyAddress text={peer} label="their address" size={14} />
                            <a href={explorerAddress(peer)} target="_blank" rel="noreferrer" className={iconLink} title="View on explorer" aria-label="View their address on explorer">
                                <ExternalLink size={14} strokeWidth={1.8} />
                            </a>
                        </div>
                    </div>
                </div>
            ) : thread ? (
                <div ref={panelRef} className="relative min-w-0 flex-1">
                    <button
                        onClick={() => setMembersOpen((o) => !o)}
                        className="flex min-w-0 max-w-full items-center gap-3 rounded-[14px] py-1 pr-2 text-left transition-colors hover:bg-[color-mix(in_srgb,var(--fg)_5%,transparent)]"
                        aria-expanded={membersOpen}
                    >
                        <span className="avatar is-on h-10 w-10 shrink-0">
                            <Users size={17} strokeWidth={1.8} />
                        </span>
                        <span className="min-w-0">
                            <span className="label block text-[10px]!">Group · {thread.participants.length} members</span>
                            <span className="flex items-center gap-1">
                                <span className="truncate font-mono text-[14px] font-semibold">{thread.title}</span>
                                <ChevronDown size={14} className={`shrink-0 text-mute transition-transform ${membersOpen ? 'rotate-180' : ''}`} />
                            </span>
                        </span>
                    </button>

                    {membersOpen && (
                        <div className="card pop absolute left-0 top-full z-30 mt-2 w-[min(22rem,calc(100vw-2rem))] p-2">
                            <p className="label px-2 pb-1 pt-1.5">Members</p>
                            <ul className="grid gap-0.5">
                                {thread.participants.map((p) => {
                                    const isMe = p.toLowerCase() === me;
                                    return (
                                        <li key={p} className="flex items-center gap-2.5 rounded-[12px] px-2 py-1.5">
                                            <AddressAvatar address={p} className="h-7 w-7 text-[10px]" />
                                            <span className="min-w-0 flex-1 truncate font-mono text-[12.5px]" title={p}>
                                                {shortAddress(p)}
                                                {isMe && <span className="ml-1.5 font-sans text-mute">(you)</span>}
                                            </span>
                                            <CopyAddress text={p} size={13} />
                                            <a href={explorerAddress(p)} target="_blank" rel="noreferrer" className={iconLink} aria-label="View on explorer">
                                                <ExternalLink size={13} strokeWidth={1.8} />
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </div>
            ) : (
                <p className="label flex-1">Scarf</p>
            )}

            {!isMobile && thread && isGaslessConfigured() && (
                <span className="pill pill-accent h-7! shrink-0 px-3! text-[12px]">
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
