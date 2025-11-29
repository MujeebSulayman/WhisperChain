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
                background: 'linear-gradient(to bottom, rgba(15, 15, 15, 0.5), rgba(15, 15, 15, 0.8))',
            }}
        >
            <div style={{ textAlign: 'center', maxWidth: '24rem', padding: '2rem' }}>
                <div
                    style={{
                        width: '5rem',
                        height: '5rem',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        position: 'relative',
                    }}
                >
                    <MessageSquarePlus
                        style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            color: '#a5b4fc',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            top: '-0.25rem',
                            right: '-0.25rem',
                            width: '1.5rem',
                            height: '1.5rem',
                            borderRadius: '50%',
                            background: 'rgba(99, 102, 241, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Sparkles style={{ width: '0.875rem', height: '0.875rem', color: '#6366f1' }} />
                    </div>
                </div>
                <h2
                    style={{
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        color: '#ffffff',
                        marginBottom: '0.5rem',
                    }}
                >
                    Start a conversation
                </h2>
                <p
                    style={{
                        fontSize: '0.9375rem',
                        color: 'rgba(255, 255, 255, 0.6)',
                        marginBottom: '2rem',
                        lineHeight: '1.6',
                    }}
                >
                    Select a conversation from the sidebar or create a new one to begin messaging on the blockchain.
                </p>
                <button
                    onClick={onNewConversation}
                    style={{
                        padding: '0.875rem 2rem',
                        borderRadius: '1.5rem',
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        border: 'none',
                        color: '#ffffff',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.9375rem',
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
                    }}
                >
                    <MessageSquarePlus style={{ width: '1.125rem', height: '1.125rem' }} />
                    New Conversation
                </button>
            </div>
        </div>
    );
}
