'use client';

import { MessageSquare } from 'lucide-react';

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {threads.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <MessageSquare
                        style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            margin: '0 auto 0.5rem',
                            color: 'rgba(255, 255, 255, 0.2)',
                        }}
                    />
                    <p
                        style={{
                            fontSize: '0.875rem',
                            color: 'rgba(255, 255, 255, 0.4)',
                        }}
                    >
                        No conversations
                    </p>
                </div>
            ) : (
                threads.map((thread, index) => {
                    const isActive = thread.id === activeThreadId;
                    const hasUnread = (thread.unreadCount ?? 0) > 0;

                    return (
                        <button
                            key={thread.id}
                            onClick={() => onSelectThread(thread.id)}
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                background: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                                border: `1px solid ${isActive ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)'}`,
                                color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                animation: `slideIn 0.3s ease-out ${index * 0.05}s both`,
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                                }
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <div
                                    style={{
                                        width: '2.5rem',
                                        height: '2.5rem',
                                        borderRadius: '0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                                        border: `1px solid ${isActive ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)'}`,
                                    }}
                                >
                                    <MessageSquare style={{ width: '1.25rem', height: '1.25rem' }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            marginBottom: '0.25rem',
                                        }}
                                    >
                                        <h3
                                            style={{
                                                fontSize: '0.875rem',
                                                fontWeight: 500,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                color: 'inherit',
                                            }}
                                        >
                                            {thread.title}
                                        </h3>
                                        {hasUnread && (
                                            <span
                                                style={{
                                                    flexShrink: 0,
                                                    width: '0.5rem',
                                                    height: '0.5rem',
                                                    borderRadius: '50%',
                                                    background: '#6366f1',
                                                }}
                                            />
                                        )}
                                    </div>
                                    <p
                                        style={{
                                            fontSize: '0.75rem',
                                            color: 'rgba(255, 255, 255, 0.5)',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            marginBottom: '0.25rem',
                                        }}
                                    >
                                        {thread.lastMessage}
                                    </p>
                                    <p
                                        style={{
                                            fontSize: '0.625rem',
                                            color: 'rgba(255, 255, 255, 0.4)',
                                            fontFamily: 'monospace',
                                        }}
                                    >
                                        {thread.timestamp}
                                    </p>
                                </div>
                            </div>
                        </button>
                    );
                })
            )}
        </div>
    );
}
