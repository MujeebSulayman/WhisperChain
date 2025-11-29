'use client';

import { MessageSquarePlus, Settings, Send, Menu, X, Hash, User, Coins } from 'lucide-react';
import { WalletConnect } from './WalletConnect';
import { UserStats } from './UserStats';
import { StorageManagement } from './StorageManagement';
import { UserProfile } from './UserProfile';
import type { AddressLike } from 'ethers';

type SidebarProps = {
    isOpen: boolean;
    onToggle: () => void;
    connectedAddress?: string;
    onConnect: () => void | Promise<void>;
    onDisconnect?: () => void;
    profile?: {
        username?: string;
        publicKey?: string;
        lastSeen?: bigint;
    };
    onNewChat: () => void;
    onBatchSend: () => void;
    onSettings: () => void;
    onPaymentHistory: () => void;
    isMobile?: boolean;
};

export function Sidebar({
    isOpen,
    onToggle,
    connectedAddress,
    onConnect,
    onDisconnect,
    profile,
    onNewChat,
    onBatchSend,
    onSettings,
    onPaymentHistory,
    isMobile = false,
}: SidebarProps) {
    return (
        <aside
            style={{
                width: isMobile ? (isOpen ? '18rem' : '0') : (isOpen ? '18rem' : '4rem'),
                minWidth: isMobile ? (isOpen ? '18rem' : '0') : (isOpen ? '18rem' : '4rem'),
                transition: 'width 0.3s ease-out, min-width 0.3s ease-out',
                background: '#1a1a1a',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: isMobile ? 'fixed' : 'relative',
                left: isMobile ? 0 : 'auto',
                top: isMobile ? 0 : 'auto',
                zIndex: isMobile ? 50 : 'auto',
                flexShrink: 0,
                height: '100vh',
                boxShadow: isMobile && isOpen ? '4px 0 24px rgba(0, 0, 0, 0.5)' : 'none',
            }}
        >
            {/* Header - Fixed */}
            <div
                style={{
                    padding: isOpen ? '1rem' : '0.75rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: isOpen ? '1rem' : '0.5rem',
                    flexShrink: 0,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: isOpen ? 'space-between' : 'center', gap: '0.5rem' }}>
                    {isOpen && (
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
                    )}
                    {!isOpen && (
                        <div
                            style={{
                                width: '2rem',
                                height: '2rem',
                                borderRadius: '0.5rem',
                                background: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Hash style={{ width: '1rem', height: '1rem', color: '#0f0f0f' }} />
                        </div>
                    )}
                    <button
                        onClick={onToggle}
                        style={{
                            padding: isMobile ? '0.625rem' : '0.375rem',
                            borderRadius: '0.5rem',
                            background: 'transparent',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            color: 'rgba(255, 255, 255, 0.7)',
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
                            if (!isMobile) {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                e.currentTarget.style.color = '#ffffff';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isMobile) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                            }
                        }}
                        onTouchStart={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        }}
                        onTouchEnd={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        {isOpen ? <X style={{ width: '1rem', height: '1rem' }} /> : <Menu style={{ width: '1rem', height: '1rem' }} />}
                    </button>
                </div>

                {isOpen && (
                    <WalletConnect
                        connectedAddress={connectedAddress}
                        onConnect={onConnect}
                        onDisconnect={onDisconnect}
                    />
                )}
            </div>

            {/* Scrollable Content */}
            <div
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* User Profile */}
                {profile && connectedAddress && (
                    <div
                        style={{
                            padding: isOpen ? '1rem' : '0.5rem',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                            display: 'flex',
                            flexDirection: isOpen ? 'column' : 'column',
                            alignItems: isOpen ? 'stretch' : 'center',
                            gap: isOpen ? '0.75rem' : '0.5rem',
                        }}
                    >
                        {isOpen ? (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                                        padding: isMobile ? '0.75rem' : '0.5rem 0.75rem',
                                        borderRadius: '0.5rem',
                                        background: 'transparent',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem',
                                        transition: 'all 0.2s',
                                        touchAction: 'manipulation',
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
                                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                                        }
                                    }}
                                    onTouchStart={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                    }}
                                    onTouchEnd={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    <Settings style={{ width: '1rem', height: '1rem' }} />
                                    Settings
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={onToggle}
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
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'opacity 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.opacity = '0.9';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.opacity = '1';
                                    }}
                                >
                                    {profile.username?.[0]?.toUpperCase() || 'U'}
                                </button>
                                <button
                                    onClick={onSettings}
                                    style={{
                                        width: '2.5rem',
                                        height: '2.5rem',
                                        padding: '0.5rem',
                                        borderRadius: '0.5rem',
                                        background: 'transparent',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
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
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div
                    style={{
                        padding: isOpen ? '1rem' : '0.5rem',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        alignItems: isOpen ? 'stretch' : 'center',
                    }}
                >
                    {isOpen ? (
                        <>
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
                            <button
                                onClick={onPaymentHistory}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '0.5rem',
                                    background: 'transparent',
                                    border: '1px solid rgba(245, 158, 11, 0.2)',
                                    color: 'rgba(245, 158, 11, 0.8)',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)';
                                    e.currentTarget.style.color = '#fbbf24';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = 'rgba(245, 158, 11, 0.8)';
                                }}
                            >
                                <Coins style={{ width: '1rem', height: '1rem' }} />
                                Payment History
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={onNewChat}
                                style={{
                                    width: '2.5rem',
                                    height: '2.5rem',
                                    padding: '0.5rem',
                                    borderRadius: '0.5rem',
                                    background: '#ffffff',
                                    border: 'none',
                                    color: '#0f0f0f',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'opacity 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.opacity = '0.9';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.opacity = '1';
                                }}
                                title="New Chat"
                            >
                                <MessageSquarePlus style={{ width: '1rem', height: '1rem' }} />
                            </button>
                            <button
                                onClick={onBatchSend}
                                style={{
                                    width: '2.5rem',
                                    height: '2.5rem',
                                    padding: '0.5rem',
                                    borderRadius: '0.5rem',
                                    background: 'transparent',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
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
                                title="Batch Send"
                            >
                                <Send style={{ width: '1rem', height: '1rem' }} />
                            </button>
                            <button
                                onClick={onPaymentHistory}
                                style={{
                                    width: '2.5rem',
                                    height: '2.5rem',
                                    padding: '0.5rem',
                                    borderRadius: '0.5rem',
                                    background: 'transparent',
                                    border: '1px solid rgba(245, 158, 11, 0.2)',
                                    color: 'rgba(245, 158, 11, 0.8)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)';
                                    e.currentTarget.style.color = '#fbbf24';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = 'rgba(245, 158, 11, 0.8)';
                                }}
                                title="Payment History"
                            >
                                <Coins style={{ width: '1rem', height: '1rem' }} />
                            </button>
                        </>
                    )}
                </div>

                {/* Stats - Only show when open */}
                {connectedAddress && isOpen && (
                    <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <UserStats userAddress={connectedAddress} />
                    </div>
                )}

                {/* Storage Management - Inside scrollable area, only show when open */}
                {connectedAddress && isOpen && (
                    <div
                        style={{
                            padding: '1rem',
                            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                    >
                        <StorageManagement
                            userAddress={connectedAddress}
                            onUpdate={() => { }}
                        />
                    </div>
                )}
            </div>
        </aside>
    );
}
