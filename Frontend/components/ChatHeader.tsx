'use client';

import { Menu } from 'lucide-react';
import { BASE_CHAIN } from '@WhisperChain/lib/blockchain';

type ChatHeaderProps = {
    threadTitle?: string;
    onMenuClick?: () => void;
    showMenu?: boolean;
};

export function ChatHeader({ threadTitle, onMenuClick, showMenu = false }: ChatHeaderProps) {
    return (
        <div
            style={{
                height: '4rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                background: '#1a1a1a',
                padding: '0 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {showMenu && (
                    <button
                        onClick={onMenuClick}
                        style={{
                            padding: '0.5rem',
                            borderRadius: '0.5rem',
                            background: 'transparent',
                            border: 'none',
                            color: 'rgba(255, 255, 255, 0.7)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                        }}
                    >
                        <Menu style={{ width: '1.25rem', height: '1.25rem' }} />
                    </button>
                )}
                <div
                    style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: '50%',
                        background: '#ffffff',
                    }}
                />
                <div>
                    <h2
                        style={{
                            fontWeight: 500,
                            color: '#ffffff',
                        }}
                    >
                        {threadTitle || 'Conversation'}
                    </h2>
                    <p
                        style={{
                            fontSize: '0.75rem',
                            color: 'rgba(255, 255, 255, 0.5)',
                            fontFamily: 'monospace',
                        }}
                    >
                        {BASE_CHAIN.name}
                    </p>
                </div>
            </div>
        </div>
    );
}
