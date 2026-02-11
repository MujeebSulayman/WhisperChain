'use client';

import { MessageSquarePlus, Sparkles } from 'lucide-react';

type EmptyStateProps = {
    onNewConversation: () => void;
};

export function EmptyState({ onNewConversation }: EmptyStateProps) {
    return (
        <div
            style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                padding: '2rem',
            }}
        >
            <div style={{ textAlign: 'center', maxWidth: '26rem' }}>
                <div
                    style={{
                        width: '5.5rem',
                        height: '5.5rem',
                        borderRadius: '1.25rem',
                        background: 'linear-gradient(145deg, rgba(99, 102, 241, 0.14) 0%, rgba(79, 70, 229, 0.08) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.75rem',
                        position: 'relative',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
                    }}
                >
                    <MessageSquarePlus style={{ width: '2.5rem', height: '2.5rem', color: 'rgba(167, 139, 250, 0.9)' }} />
                    <div
                        style={{
                            position: 'absolute',
                            top: '-0.25rem',
                            right: '-0.25rem',
                            width: '1.5rem',
                            height: '1.5rem',
                            borderRadius: '0.5rem',
                            background: 'rgba(99, 102, 241, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Sparkles style={{ width: '0.875rem', height: '0.875rem', color: '#a78bfa' }} />
                    </div>
                </div>
                <h2 style={{ fontSize: '1.375rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.95)', marginBottom: '0.5rem' }}>
                    Start a conversation
                </h2>
                <p style={{ fontSize: '0.9375rem', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '2rem', lineHeight: 1.6 }}>
                    Select a conversation from the sidebar or create a new one to begin messaging on the blockchain.
                </p>
                <button
                    onClick={onNewConversation}
                    style={{
                        padding: '0.875rem 1.75rem',
                        borderRadius: '9999px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                        border: 'none',
                        color: '#ffffff',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.9375rem',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35), 0 1px 3px rgba(0, 0, 0, 0.2)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4), 0 1px 3px rgba(0, 0, 0, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(99, 102, 241, 0.35), 0 1px 3px rgba(0, 0, 0, 0.2)';
                    }}
                >
                    <MessageSquarePlus style={{ width: '1.125rem', height: '1.125rem' }} />
                    New Conversation
                </button>
            </div>
        </div>
    );
}
