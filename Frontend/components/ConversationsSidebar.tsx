'use client';

import { MessageSquarePlus, MessagesSquare, PanelRightClose, Search, Users } from 'lucide-react';
import { ThreadList } from './ThreadList';
import { AddressAvatar } from './AddressAvatar';
import { useState } from 'react';
import type { Thread } from '@/lib/inbox';

type ConversationsSidebarProps = {
    isOpen: boolean;
    onToggle: () => void;
    threads: Thread[];
    activeThreadId?: string;
    onSelectThread: (threadId: string) => void;
    connectedAddress?: string;
    isMobile?: boolean;
    onNewConversation?: () => void;
};

export function ConversationsSidebar({
    isOpen,
    onToggle,
    threads,
    activeThreadId,
    onSelectThread,
    connectedAddress,
    isMobile = false,
    onNewConversation,
}: ConversationsSidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');

    if (isMobile && !isOpen) return null;

    // Matches a full or partial address of anyone in the chat, or the latest message.
    const query = searchQuery.trim().toLowerCase();
    const filteredThreads = query
        ? threads.filter(
              (thread) =>
                  thread.participants.some((p) => p.toLowerCase().includes(query)) ||
                  thread.lastMessage.toLowerCase().includes(query)
          )
        : threads;
    const totalUnread = threads.reduce((n, t) => n + t.unreadCount, 0);
    const me = connectedAddress?.toLowerCase();

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
                        {threads.slice(0, 10).map((thread) => {
                            const peer = thread.kind === 'direct' ? thread.participants.find((p) => p.toLowerCase() !== me) : undefined;
                            return (
                                <button
                                    key={thread.id}
                                    onClick={() => onSelectThread(thread.id)}
                                    className={`relative rounded-full ${activeThreadId === thread.id ? 'ring-2 ring-accent ring-offset-2 ring-offset-transparent' : ''}`}
                                    title={thread.title}
                                >
                                    {peer ? (
                                        <AddressAvatar address={peer} className="h-10 w-10 text-[12px]" />
                                    ) : (
                                        <span className="avatar h-10 w-10">
                                            <Users size={16} strokeWidth={1.8} />
                                        </span>
                                    )}
                                    {thread.unreadCount > 0 && (
                                        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-bg bg-accent" />
                                    )}
                                </button>
                            );
                        })}
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
                        <p className="label">Inbox{totalUnread > 0 ? ` · ${totalUnread} unread` : ''}</p>
                        <h2 className="mt-1 font-display text-[22px] font-medium">Conversations</h2>
                    </div>
                    <div className="flex items-center gap-1">
                        {connectedAddress && onNewConversation && (
                            <button onClick={onNewConversation} className="icon-btn" aria-label="New conversation" title="New conversation">
                                <MessageSquarePlus size={18} strokeWidth={1.8} />
                            </button>
                        )}
                        <button onClick={onToggle} className="icon-btn" aria-label="Hide conversations">
                            <PanelRightClose size={18} strokeWidth={1.8} />
                        </button>
                    </div>
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
                    <ThreadList
                        threads={filteredThreads}
                        activeThreadId={activeThreadId}
                        onSelectThread={onSelectThread}
                        connectedAddress={connectedAddress}
                        onNewConversation={onNewConversation}
                        searching={Boolean(query)}
                    />
                ) : (
                    <p className="px-3 py-8 text-center text-[14px] text-mute">Connect your wallet to see your conversations.</p>
                )}
            </div>
        </aside>
    );
}
