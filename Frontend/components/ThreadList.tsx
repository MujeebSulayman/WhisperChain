'use client';

import { MessagesSquare } from 'lucide-react';

type Thread = {
    id: string;
    title: string;
    subtitle?: string;
    unreadCount?: number;
    lastMessage: string;
    timestamp: string;
    participants?: string[];
};

type ThreadListProps = {
    threads: Thread[];
    activeThreadId?: string;
    onSelectThread: (threadId: string) => void;
};

const initials = (title: string) => (title.startsWith('0x') ? title.slice(2, 4) : title.slice(0, 2)).toUpperCase();

export function ThreadList({
    threads,
    activeThreadId,
    onSelectThread,
}: ThreadListProps) {
    if (threads.length === 0) {
        return (
            <div className="px-3 py-10 text-center">
                <span className="tile mx-auto h-12 w-12 rounded-full">
                    <MessagesSquare size={20} strokeWidth={1.8} />
                </span>
                <p className="mt-4 text-[14px] font-medium">No conversations yet</p>
                <p className="mt-1 text-[13px] text-mute">Start one from the menu on the left.</p>
            </div>
        );
    }

    return (
        <ul className="grid gap-1">
            {threads.map((thread, index) => {
                const isActive = thread.id === activeThreadId;
                const hasUnread = (thread.unreadCount ?? 0) > 0;

                return (
                    <li key={thread.id} style={{ animation: `slideIn 0.3s ease-out ${index * 0.04}s both` }}>
                        <button
                            onClick={() => onSelectThread(thread.id)}
                            className={`row items-start! ${isActive ? 'is-on' : ''}`}
                        >
                            <span className={`avatar h-10 w-10 ${isActive ? 'is-on' : ''}`}>{initials(thread.title)}</span>
                            <span className="min-w-0 flex-1">
                                <span className="flex items-center gap-2">
                                    <span className="truncate text-[14px] font-semibold tracking-[-0.01em] text-fg">{thread.title}</span>
                                    {hasUnread && <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />}
                                    <span className="ml-auto shrink-0 font-mono text-[10px] text-mute">{thread.timestamp}</span>
                                </span>
                                <span className="mt-0.5 block truncate text-[13px] text-dim">{thread.lastMessage}</span>
                            </span>
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}
