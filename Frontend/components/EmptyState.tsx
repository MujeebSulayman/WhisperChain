'use client';

import { MessageSquarePlus } from 'lucide-react';

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
            }}
        >
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div
                    style={{
                        width: '5rem',
                        height: '5rem',
                        margin: '0 auto 1.5rem',
                        color: 'rgba(255, 255, 255, 0.2)',
                    }}
                >
                    <MessageSquarePlus style={{ width: '100%', height: '100%' }} />
                </div>
                <h3
                    style={{
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#ffffff',
                    }}
                >
                    Welcome to WhisperChain
                </h3>
                <p
                    style={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        marginBottom: '2rem',
                        fontSize: '0.875rem',
                    }}
                >
                    Select a conversation or create a new one
                </p>
                <button
                    onClick={onNewConversation}
                    style={{
                        padding: '0.875rem 2rem',
                        borderRadius: '0.5rem',
                        background: '#ffffff',
                        border: 'none',
                        color: '#0f0f0f',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.9';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                    }}
                >
                    Start New Conversation
                </button>
            </div>
        </div>
    );
}
