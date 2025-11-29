'use client';

import { Menu, Circle } from 'lucide-react';

type ChatHeaderProps = {
    threadTitle?: string;
    onMenuClick?: () => void;
    showMenu?: boolean;
    onConversationsClick?: () => void;
    showConversations?: boolean;
    isMobile?: boolean;
};

export function ChatHeader({ threadTitle, onMenuClick, showMenu = false, onConversationsClick, showConversations = true, isMobile = false }: ChatHeaderProps) {
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
                height: isMobile ? '3.5rem' : '4.5rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                background: 'rgba(15, 15, 15, 0.8)',
                backdropFilter: 'blur(10px)',
                padding: isMobile ? '0 0.75rem' : '0 1.25rem',
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
                            padding: isMobile ? '0.625rem' : '0.5rem',
                            borderRadius: '0.5rem',
                            background: 'transparent',
                            border: 'none',
                            color: 'rgba(255, 255, 255, 0.6)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            flexShrink: 0,
                            touchAction: 'manipulation',
                            minWidth: isMobile ? '2.75rem' : 'auto',
                            minHeight: isMobile ? '2.75rem' : 'auto',
                        }}
                        onMouseEnter={(e) => {
                            if (!isMobile) {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                e.currentTarget.style.color = '#ffffff';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isMobile) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                            }
                        }}
                        onTouchStart={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        }}
                        onTouchEnd={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        <Menu style={{ width: isMobile ? '1.5rem' : '1.25rem', height: isMobile ? '1.5rem' : '1.25rem' }} />
                    </button>
                )}
                <div
                    style={{
                        width: isMobile ? '2.25rem' : '2.75rem',
                        height: isMobile ? '2.25rem' : '2.75rem',
                        borderRadius: '50%',
                        background: getAvatarColor(threadTitle),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: isMobile ? '0.75rem' : '0.875rem',
                        flexShrink: 0,
                    }}
                >
                    {getInitials(threadTitle)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h2
                        style={{
                            fontWeight: 600,
                            fontSize: isMobile ? '0.875rem' : '1rem',
                            color: '#ffffff',
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {threadTitle || 'New Conversation'}
                    </h2>
                    {!isMobile && (
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
                    )}
                </div>
            </div>
        </div>
    );
}
