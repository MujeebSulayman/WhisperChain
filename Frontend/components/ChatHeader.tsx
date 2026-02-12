'use client';

import { Menu, Circle, MessageSquare } from 'lucide-react';

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
                height: isMobile ? '3.5rem' : '4rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                background: 'linear-gradient(180deg, rgba(18, 18, 22, 0.95) 0%, rgba(12, 12, 14, 0.9) 100%)',
                backdropFilter: 'blur(12px)',
                padding: isMobile ? '0 0.75rem' : '0 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 10,
                boxShadow: '0 1px 0 rgba(255, 255, 255, 0.03)',
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
                {threadTitle && (
                    <>
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
                                {threadTitle}
                            </h2>
                            {!isMobile && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.125rem' }}>
                                    <Circle className="animate-pulse-soft" style={{ width: '0.5rem', height: '0.5rem', color: '#10b981', fill: '#10b981' }} />
                                    <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.45)' }}>
                                        Active
                                    </span>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
            {isMobile && onConversationsClick && (
                <button
                    onClick={onConversationsClick}
                    style={{
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        background: showConversations ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                        border: `1px solid ${showConversations ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
                        color: showConversations ? '#a5b4fc' : 'rgba(255, 255, 255, 0.6)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        flexShrink: 0,
                        touchAction: 'manipulation',
                        minWidth: '2.75rem',
                        minHeight: '2.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onTouchStart={(e) => {
                        e.currentTarget.style.background = showConversations ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.1)';
                    }}
                    onTouchEnd={(e) => {
                        e.currentTarget.style.background = showConversations ? 'rgba(99, 102, 241, 0.15)' : 'transparent';
                    }}
                    title={showConversations ? 'Hide conversations' : 'Show conversations'}
                >
                    <MessageSquare style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
            )}
        </div>
    );
}
