'use client';

import { MessagesSquare, PanelRightClose, Search } from 'lucide-react';
import { ThreadList } from './ThreadList';
import { useState } from 'react';

type Thread = {
    id: string;
    title: string;
    subtitle?: string;
    unreadCount?: number;
    lastMessage: string;
    timestamp: string;
    participants?: string[];
};

type ConversationsSidebarProps = {
    isOpen: boolean;
    onToggle: () => void;
    threads: Thread[];
    activeThreadId?: string;
    onSelectThread: (threadId: string) => void;
    connectedAddress?: string;
    isMobile?: boolean;
};

const initials = (title: string) => (title.startsWith('0x') ? title.slice(2, 4) : title.slice(0, 2)).toUpperCase();

export function ConversationsSidebar({
    isOpen,
    onToggle,
    threads,
    activeThreadId,
    onSelectThread,
    connectedAddress,
    isMobile = false,
}: ConversationsSidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');

    if (isMobile && !isOpen) return null;

    const filteredThreads = threads.filter((thread) =>
        thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thread.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const frame = isMobile
        ? 'sheet fixed inset-y-3 right-3 z-[60] w-[20rem] max-w-[calc(100vw-1.5rem)] rise'
        : `relative shrink-0 transition-[width] duration-300 [transition-timing-function:var(--ease-out)] ${isOpen ? 'w-[20rem]' : 'w-[4.5rem]'}`;

    if (!isOpen) {
        // Collapsed rail (desktop only): one avatar per recent conversation.
        return (
            <aside className={`glass flex flex-col items-center gap-2 rounded-[var(--r-card)] py-4 ${frame}`}>
                <button onClick={onToggle} className="icon-btn" aria-label="Show conversations" title="Show conversations">
                    <MessagesSquare size={18} strokeWidth={1.8} />
                </button>
                <span className="my-2 h-px w-8 bg-line" />
                {connectedAddress && (
                    <div className="flex min-h-0 flex-col items-center gap-2 overflow-y-auto">
                        {threads.slice(0, 10).map((thread) => (
                            <button
                                key={thread.id}
                                onClick={() => onSelectThread(thread.id)}
                                className={`avatar relative h-10 w-10 ${activeThreadId === thread.id ? 'is-on' : ''}`}
                                title={thread.title}
                            >
                                {initials(thread.title)}
                                {(thread.unreadCount ?? 0) > 0 && (
                                    <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-bg bg-accent" />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </aside>
        );
    }

    return (
        <aside className={`${isMobile ? '' : 'glass'} flex flex-col overflow-hidden rounded-[var(--r-card)] ${frame}`}>
            <div className="shrink-0 px-4 pb-3 pt-4">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <p className="label">Inbox</p>
                        <h2 className="mt-1 font-display text-[22px] font-medium">Conversations</h2>
                    </div>
                    <button onClick={onToggle} className="icon-btn" aria-label="Hide conversations">
                        <PanelRightClose size={18} strokeWidth={1.8} />
                    </button>
                </div>

                <label className="relative mt-4 block">
                    <span className="sr-only">Search conversations</span>
                    <Search size={15} strokeWidth={1.8} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" />
                    <input
                        type="text"
                        placeholder="Search by address or message"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input !pl-10"
                    />
                </label>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
                {connectedAddress ? (
                    <ThreadList threads={filteredThreads} activeThreadId={activeThreadId} onSelectThread={onSelectThread} />
                ) : (
                    <p className="px-3 py-8 text-center text-[14px] text-mute">Connect your wallet to see your conversations.</p>
                )}
            </div>
        </aside>
    );
}
