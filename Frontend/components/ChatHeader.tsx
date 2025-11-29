'use client';

import { Menu, MessageSquare, Circle } from 'lucide-react';

type ChatHeaderProps = {
    threadTitle?: string;
    onMenuClick?: () => void;
    showMenu?: boolean;
    onConversationsClick?: () => void;
    showConversations?: boolean;
};

export function ChatHeader({ threadTitle, onMenuClick, showMenu = false, onConversationsClick, showConversations = true }: ChatHeaderProps) {
    const getInitials = (title?: string) => {
        if (!title) return 'C';
        const parts = title.split(' ');
        if (parts.length > 1) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return title.slice(0, 2).toUpperCase();
    };

    const getAvatarColor = (title?: string) => {
        if (!title) return '#6366f1';
        const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
        return colors[hash % colors.length];
    };

    return (
        <div
            style={{
                height: '4.5rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                background: 'rgba(15, 15, 15, 0.8)',
                backdropFilter: 'blur(10px)',
                padding: '0 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 10,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flex: 1, minWidth: 0 }}>
                {showMenu && (
                    <button
                        onClick={onMenuClick}
                        style={{
                            padding: '0.5rem',
                            borderRadius: '0.5rem',
                            background: 'transparent',
                            border: 'none',
                            color: 'rgba(255, 255, 255, 0.6)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            flexShrink: 0,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                        }}
                    >
                        <Menu style={{ width: '1.25rem', height: '1.25rem' }} />
                    </button>
                )}
                <div
                    style={{
                        width: '2.75rem',
                        height: '2.75rem',
                        borderRadius: '50%',
                        background: getAvatarColor(threadTitle),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        flexShrink: 0,
                    }}
                >
                    {getInitials(threadTitle)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h2
                        style={{
                            fontWeight: 600,
                            fontSize: '1rem',
                            color: '#ffffff',
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {threadTitle || 'New Conversation'}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.125rem' }}>
                        <Circle style={{ width: '0.5rem', height: '0.5rem', color: '#10b981', fill: '#10b981' }} />
                        <span
                            style={{
                                fontSize: '0.75rem',
                                color: 'rgba(255, 255, 255, 0.5)',
                            }}
                        >
                            Active
                        </span>
                    </div>
                </div>
            </div>
            {onConversationsClick && (
                <button
                    onClick={onConversationsClick}
                    style={{
                        padding: '0.625rem',
                        borderRadius: '0.5rem',
                        background: showConversations ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                        border: `1px solid ${showConversations ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
                        color: showConversations ? '#a5b4fc' : 'rgba(255, 255, 255, 0.6)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                        if (!showConversations) {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.color = '#ffffff';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!showConversations) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                        }
                    }}
                    title={showConversations ? 'Hide conversations' : 'Show conversations'}
                >
                    <MessageSquare style={{ width: '1.125rem', height: '1.125rem' }} />
                </button>
            )}
        </div>
    );
}
