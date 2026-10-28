'use client';

import { MessageSquarePlus, MessagesSquare, Users } from 'lucide-react';
import { format, isToday, isYesterday, differenceInCalendarDays } from 'date-fns';
import type { Thread } from '@/lib/inbox';
import { AddressAvatar } from './AddressAvatar';

type ThreadListProps = {
    threads: Thread[];
    activeThreadId?: string;
    onSelectThread: (threadId: string) => void;
    connectedAddress?: string;
    onNewConversation?: () => void;
    /** Shown instead of the empty state while a search has no results. */
    searching?: boolean;
};

/** "14:32", "Yesterday", "Mon", or "12 Mar", like a messaging app. */
export function threadTime(unix: number) {
    if (!unix) return '';
    const d = new Date(unix * 1000);
    if (isToday(d)) return format(d, 'HH:mm');
    if (isYesterday(d)) return 'Yesterday';
    if (differenceInCalendarDays(new Date(), d) < 7) return format(d, 'EEE');
    return format(d, 'd MMM');
}

export function ThreadList({ threads, activeThreadId, onSelectThread, connectedAddress, onNewConversation, searching }: ThreadListProps) {
    if (threads.length === 0) {
        return searching ? (
            <p className="px-3 py-10 text-center text-[13px] text-mute">No conversations match your search.</p>
        ) : (
            <div className="px-3 py-10 text-center">
                <span className="tile mx-auto h-12 w-12 rounded-full">
                    <MessagesSquare size={20} strokeWidth={1.8} />
                </span>
                <p className="mt-4 text-[14px] font-medium">No conversations yet</p>
                <p className="mt-1 text-[13px] text-mute">Message any address, or share yours so people can reach you.</p>
                {onNewConversation && (
                    <button onClick={onNewConversation} className="btn btn-sm btn-white mt-4">
                        <MessageSquarePlus size={15} strokeWidth={2} />
                        New conversation
                    </button>
                )}
            </div>
        );
    }

    const me = connectedAddress?.toLowerCase();

    return (
        <ul className="grid grid-cols-1 gap-1">
            {threads.map((thread, index) => {
                const isActive = thread.id === activeThreadId;
                const unread = thread.unreadCount;
                const peer = thread.kind === 'direct' ? thread.participants.find((p) => p.toLowerCase() !== me) : undefined;

                return (
                    <li key={thread.id} style={{ animation: `slideIn 0.3s ease-out ${Math.min(index, 10) * 0.03}s both` }}>
                        <button
                            onClick={() => onSelectThread(thread.id)}
                            className={`row items-start! ${isActive ? 'is-on' : ''}`}
                            aria-current={isActive ? 'true' : undefined}
                        >
                            {peer ? (
                                <AddressAvatar address={peer} className="h-10 w-10 text-[12px]" />
                            ) : (
                                <span className={`avatar h-10 w-10 shrink-0 ${isActive ? 'is-on' : ''}`}>
                                    <Users size={16} strokeWidth={1.8} />
                                </span>
                            )}
                            <span className="min-w-0 flex-1">
                                <span className="flex items-center gap-2">
                                    <span className={`truncate font-mono text-[13.5px] tracking-[-0.01em] text-fg ${unread ? 'font-bold' : 'font-semibold'}`}>
                                        {thread.title}
                                    </span>
                                    {thread.kind === 'group' && (
                                        <span className="shrink-0 text-[10.5px] text-mute">· {thread.participants.length}</span>
                                    )}
                                    <span className={`ml-auto shrink-0 font-mono text-[10.5px] ${unread ? 'text-accent' : 'text-mute'}`}>
                                        {threadTime(thread.lastAt)}
                                    </span>
                                </span>
                                <span className="mt-0.5 flex items-center gap-2">
                                    <span className={`min-w-0 flex-1 truncate text-[13px] ${unread ? 'font-medium text-fg' : 'text-dim'}`}>
                                        {thread.lastMessage}
                                    </span>
                                    {unread > 0 && (
                                        <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-accent px-1.5 text-[10.5px] font-semibold text-white">
                                            {unread > 99 ? '99+' : unread}
                                        </span>
                                    )}
                                </span>
                            </span>
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}
