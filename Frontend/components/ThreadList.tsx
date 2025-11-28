'use client';

import { MessageSquare, CheckCheck } from 'lucide-react';
import { useState, useEffect } from 'react';

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
            {threads.map((thread, index) => {
                const isActive = thread.id === activeThreadId;
                const hasUnread = (thread.unreadCount ?? 0) > 0;

                return (
                    <button
                        key={thread.id}
                        onClick={() => onSelectThread(thread.id)}
                        className={`group relative w-full rounded-2xl border p-4 text-left transition-all duration-300 animate-in fade-in slide-in-from-left-4 ${isActive
                                ? 'border-sky-500/50 bg-gradient-to-br from-sky-500/20 to-sky-600/10 shadow-lg shadow-sky-500/10 scale-[1.02]'
                                : 'border-white/5 bg-slate-900/40 hover:border-white/10 hover:bg-slate-900/60 hover:scale-[1.01] active:scale-[0.99]'
                            }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        {isActive && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-sky-500 to-sky-600 shadow-lg shadow-sky-500/50" />
                        )}
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3
                                        className={`text-sm font-semibold truncate transition-colors ${isActive ? 'text-sky-200' : 'text-white group-hover:text-sky-200'
                                            }`}
                                    >
                                        {thread.title}
                                    </h3>
                                    {hasUnread && (
                                        <span className="shrink-0 rounded-full bg-gradient-to-r from-sky-500 to-sky-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg shadow-sky-500/30 animate-pulse">
                                            {thread.unreadCount}
                                        </span>
                                    )}
                                </div>
                                {thread.subtitle && (
                                    <p className="text-xs text-slate-400 mb-2 transition-colors group-hover:text-slate-300">
                                        {thread.subtitle}
                                    </p>
                                )}
                                <p className="text-xs text-slate-500 line-clamp-1 transition-colors group-hover:text-slate-400">
                                    {thread.lastMessage}
                                </p>
                            </div>
                            <div className="shrink-0 text-[10px] text-slate-600 transition-colors group-hover:text-slate-500">
                                {thread.timestamp}
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
