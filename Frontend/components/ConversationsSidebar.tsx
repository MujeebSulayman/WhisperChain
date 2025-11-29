'use client';

import { MessageSquare, Search } from 'lucide-react';
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

    const filteredThreads = threads.filter((thread) =>
        thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thread.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <aside
            style={{
                width: isMobile ? (isOpen ? '20rem' : '0') : (isOpen ? '20rem' : '4rem'),
                minWidth: isMobile ? (isOpen ? '20rem' : '0') : (isOpen ? '20rem' : '4rem'),
                transition: 'width 0.3s ease-out, min-width 0.3s ease-out',
                background: '#1a1a1a',
                borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: isMobile ? 'fixed' : 'relative',
                right: isMobile ? 0 : 'auto',
                top: isMobile ? 0 : 'auto',
                zIndex: isMobile ? 50 : 'auto',
                flexShrink: 0,
                height: '100vh',
                boxShadow: isMobile && isOpen ? '-4px 0 24px rgba(0, 0, 0, 0.5)' : 'none',
            }}
        >
            {/* Header - Fixed */}
            <div
                style={{
                    padding: isOpen ? '1rem' : '0.75rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    flexShrink: 0,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: isOpen ? 'space-between' : 'center', gap: '0.5rem' }}>
                    {isOpen && (
                        <h2
                            style={{
                                fontSize: '1rem',
                                fontWeight: 600,
                                color: '#ffffff',
                            }}
                        >
                            Conversations
                        </h2>
                    )}
                    {!isOpen && (
                        <MessageSquare style={{ width: '1.25rem', height: '1.25rem', color: 'rgba(255, 255, 255, 0.7)' }} />
                    )}
                    <button
                        onClick={onToggle}
                        style={{
                            padding: isMobile ? '0.625rem' : '0.375rem',
                            borderRadius: '0.5rem',
                            background: isOpen ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                            border: `1px solid ${isOpen ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
                            color: isOpen ? '#a5b4fc' : 'rgba(255, 255, 255, 0.7)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            touchAction: 'manipulation',
                            minWidth: isMobile ? '2.75rem' : 'auto',
                            minHeight: isMobile ? '2.75rem' : 'auto',
                        }}
                        onMouseEnter={(e) => {
                            if (!isMobile && !isOpen) {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                e.currentTarget.style.color = '#ffffff';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isMobile && !isOpen) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                            }
                        }}
                        onTouchStart={(e) => {
                            e.currentTarget.style.background = isOpen ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.1)';
                        }}
                        onTouchEnd={(e) => {
                            e.currentTarget.style.background = isOpen ? 'rgba(99, 102, 241, 0.15)' : 'transparent';
                        }}
                    >
                        <MessageSquare style={{ width: isMobile ? '1.25rem' : '1rem', height: isMobile ? '1.25rem' : '1rem' }} />
                    </button>
                </div>

                {/* Search - Only show when open */}
                {isOpen && (
                    <div
                        style={{
                            marginTop: '1rem',
                            position: 'relative',
                        }}
                    >
                        <Search
                            style={{
                                position: 'absolute',
                                left: '0.75rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '1rem',
                                height: '1rem',
                                color: 'rgba(255, 255, 255, 0.4)',
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.5rem 0.75rem 0.5rem 2.5rem',
                                borderRadius: '0.5rem',
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                color: '#ffffff',
                                fontSize: '0.875rem',
                                outline: 'none',
                                transition: 'all 0.2s',
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Conversations List - Scrollable */}
            {connectedAddress && (
                <div
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        padding: isOpen ? '1rem' : '0.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {isOpen ? (
                        <ThreadList
                            threads={filteredThreads}
                            activeThreadId={activeThreadId}
                            onSelectThread={onSelectThread}
                        />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                            {threads.slice(0, 10).map((thread) => (
                                <button
                                    key={thread.id}
                                    onClick={() => {
                                        onSelectThread(thread.id);
                                    }}
                                    style={{
                                        width: '2.5rem',
                                        height: '2.5rem',
                                        borderRadius: '0.5rem',
                                        background: activeThreadId === thread.id ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                        border: activeThreadId === thread.id
                                            ? '1px solid rgba(255, 255, 255, 0.2)'
                                            : '1px solid rgba(255, 255, 255, 0.08)',
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s',
                                        fontSize: '0.75rem',
                                        fontWeight: 500,
                                        position: 'relative',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (activeThreadId !== thread.id) {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                            e.currentTarget.style.color = '#ffffff';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (activeThreadId !== thread.id) {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                                        }
                                    }}
                                    title={thread.title}
                                >
                                    {thread.title[0]?.toUpperCase() || 'C'}
                                    {(thread.unreadCount ?? 0) > 0 && (
                                        <span
                                            style={{
                                                position: 'absolute',
                                                top: '-0.25rem',
                                                right: '-0.25rem',
                                                width: '0.5rem',
                                                height: '0.5rem',
                                                borderRadius: '50%',
                                                background: '#6366f1',
                                                border: '2px solid #1a1a1a',
                                            }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </aside>
    );
}

