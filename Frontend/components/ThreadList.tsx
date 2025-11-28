'use client';

import { MessageSquare, CheckCheck } from 'lucide-react';

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

export function ThreadList({
    threads,
    activeThreadId,
    onSelectThread,
}: ThreadListProps) {
    return (
        <div className="space-y-2">
            {threads.map((thread) => {
                const isActive = thread.id === activeThreadId;
                const hasUnread = (thread.unreadCount ?? 0) > 0;

                return (
                    <button
                        key={thread.id}
                        onClick={() => onSelectThread(thread.id)}
                        className={`w-full rounded-2xl border p-4 text-left transition ${isActive
                                ? 'border-sky-500/50 bg-sky-500/10'
                                : 'border-white/5 bg-slate-900/40 hover:border-white/10 hover:bg-slate-900/60'
                            }`}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3
                                        className={`text-sm font-semibold truncate ${isActive ? 'text-sky-200' : 'text-white'
                                            }`}
                                    >
                                        {thread.title}
                                    </h3>
                                    {hasUnread && (
                                        <span className="shrink-0 rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-bold text-white">
                                            {thread.unreadCount}
                                        </span>
                                    )}
                                </div>
                                {thread.subtitle && (
                                    <p className="text-xs text-slate-400 mb-2">
                                        {thread.subtitle}
                                    </p>
                                )}
                                <p className="text-xs text-slate-500 line-clamp-1">
                                    {thread.lastMessage}
                                </p>
                            </div>
                            <div className="shrink-0 text-[10px] text-slate-600">
                                {thread.timestamp}
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}

