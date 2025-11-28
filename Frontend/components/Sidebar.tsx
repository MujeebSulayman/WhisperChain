'use client';

import { useState } from 'react';
import { MessageSquarePlus, Settings, Send, Menu, X, Hash } from 'lucide-react';
import { WalletConnect } from './WalletConnect';
import { UserStats } from './UserStats';
import { StorageManagement } from './StorageManagement';
import type { AddressLike } from 'ethers';

type SidebarProps = {
    isOpen: boolean;
    onToggle: () => void;
    connectedAddress?: string;
    onConnect: (address: string) => void;
    profile?: {
        username?: string;
        publicKey?: string;
        lastSeen?: bigint;
    };
    onNewChat: () => void;
    onBatchSend: () => void;
    onSettings: () => void;
};

export function Sidebar({
    isOpen,
    onToggle,
    connectedAddress,
    onConnect,
    profile,
    onNewChat,
    onBatchSend,
    onSettings,
}: SidebarProps) {
    return (
        <aside
            style={{
                width: isOpen ? '18rem' : '0',
                transition: 'width 0.3s ease-out',
                background: '#1a1a1a',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
            }}
            className="animate-slide-in"
        >
            {/* Header */}
            <div
                style={{
                    padding: '1rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div
                            style={{
                                width: '2.25rem',
                                height: '2.25rem',
                                borderRadius: '0.5rem',
                                background: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Hash style={{ width: '1.25rem', height: '1.25rem', color: '#0f0f0f' }} />
                        </div>
                        <h1
                            style={{
                                fontSize: '1.125rem',
                                fontWeight: 600,
                                color: '#ffffff',
                            }}
                        >
                            WhisperChain
                        </h1>
                    </div>
                    <button
                        onClick={onToggle}
                        style={{
                            padding: '0.375rem',
                            borderRadius: '0.5rem',
                            background: 'transparent',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
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
                        {isOpen ? <X style={{ width: '1rem', height: '1rem' }} /> : <Menu style={{ width: '1rem', height: '1rem' }} />}
                    </button>
                </div>

                <WalletConnect connectedAddress={connectedAddress} onConnect={onConnect} />
            </div>

            {/* User Profile */}
            {profile && connectedAddress && (
                <div
                    style={{
                        padding: '1rem',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div
                            style={{
                                width: '2.5rem',
                                height: '2.5rem',
                                borderRadius: '50%',
                                background: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#0f0f0f',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                            }}
                        >
                            {profile.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                                style={{
                                    fontWeight: 500,
                                    fontSize: '0.875rem',
                                    color: '#ffffff',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {profile.username || 'User'}
                            </p>
                            <p
                                style={{
                                    fontSize: '0.75rem',
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    fontFamily: 'monospace',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onSettings}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '0.5rem',
                            background: 'transparent',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            color: 'rgba(255, 255, 255, 0.7)',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
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
                        <Settings style={{ width: '1rem', height: '1rem' }} />
                        Settings
                    </button>
                </div>
            )}

            {/* Actions */}
            <div
                style={{
                    padding: '1rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                }}
            >
                <button
                    onClick={onNewChat}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1rem',
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
                    <MessageSquarePlus style={{ width: '1rem', height: '1rem' }} />
                    New Chat
                </button>
                <button
                    onClick={onBatchSend}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        background: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: 'rgba(255, 255, 255, 0.7)',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
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
                    <Send style={{ width: '1rem', height: '1rem' }} />
                    Batch Send
                </button>
            </div>

            {/* Stats */}
            {connectedAddress && (
                <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <UserStats userAddress={connectedAddress} />
                </div>
            )}

            {/* Storage */}
            {connectedAddress && (
                <div style={{ padding: '1rem', flex: 1, overflowY: 'auto' }}>
                    <StorageManagement
                        userAddress={connectedAddress}
                        onUpdate={() => { }}
                    />
                </div>
            )}
        </aside>
    );
}
