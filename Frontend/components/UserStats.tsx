'use client';

import { useState, useEffect } from 'react';
import { HardDrive, MessageSquare, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import {
    fetchStorageUsage,
    getUserMessageCount,
    fetchContractStats,
} from '@WhisperChain/lib/whisperchainActions';
import type { AddressLike } from 'ethers';

// Contract constants
const MAX_MESSAGES_PER_USER = 10000;
const MAX_STORAGE_PER_USER = 1000000000; // 1GB in bytes
const MAX_FILE_SIZE = 50000000; // 50MB in bytes

type UserStatsProps = {
    userAddress: AddressLike;
};

export function UserStats({ userAddress }: UserStatsProps) {
    const [storage, setStorage] = useState<{ used: bigint; remaining: bigint } | null>(null);
    const [messageCount, setMessageCount] = useState<bigint | null>(null);
    const [contractStats, setContractStats] = useState<{
        pendingPayments: bigint;
        processedMessages: bigint;
        treasuryBalance: bigint;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const loadStats = async () => {
        setIsLoading(true);
        try {
            const [storageData, msgCount, contractData] = await Promise.all([
                fetchStorageUsage(userAddress),
                getUserMessageCount(userAddress),
                fetchContractStats(),
            ]);
            setStorage(storageData);
            setMessageCount(msgCount);
            setContractStats(contractData);
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, [userAddress]);

    const formatBytes = (bytes: bigint) => {
        const num = Number(bytes);
        const kb = num / 1024;
        const mb = kb / 1024;
        const gb = mb / 1024;
        if (gb >= 1) return `${gb.toFixed(2)} GB`;
        if (mb >= 1) return `${mb.toFixed(2)} MB`;
        return `${kb.toFixed(2)} KB`;
    };

    const storagePercent = storage
        ? (Number(storage.used) / MAX_STORAGE_PER_USER) * 100
        : 0;

    const messagePercent = messageCount !== null
        ? (Number(messageCount) / MAX_MESSAGES_PER_USER) * 100
        : 0;

    const isStorageNearLimit = storagePercent > 80;
    const isMessageNearLimit = messagePercent > 80;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff' }}>Statistics</h3>
                <button
                    onClick={loadStats}
                    disabled={isLoading}
                    style={{
                        padding: '0.375rem',
                        borderRadius: '0.5rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.5)',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        opacity: isLoading ? 0.5 : 1,
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        if (!isLoading) {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.color = '#ffffff';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isLoading) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                        }
                    }}
                >
                    {isLoading ? (
                        <Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />
                    ) : (
                        <RefreshCw style={{ width: '1rem', height: '1rem' }} />
                    )}
                </button>
            </div>

            {/* Message Count */}
            {messageCount !== null && (
                <div
                    style={{
                        borderRadius: '0.5rem',
                        border: `1px solid ${isMessageNearLimit ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
                        background: 'rgba(255, 255, 255, 0.03)',
                        padding: '0.75rem',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <MessageSquare style={{ width: '1rem', height: '1rem', color: 'rgba(255, 255, 255, 0.7)' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(255, 255, 255, 0.7)' }}>Messages</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff' }}>{messageCount.toString()}</p>
                        <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>/ {MAX_MESSAGES_PER_USER.toLocaleString()}</p>
                    </div>
                    <div style={{ height: '0.25rem', borderRadius: '0.125rem', background: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
                        <div
                            style={{
                                height: '100%',
                                background: isMessageNearLimit ? '#ef4444' : '#6366f1',
                                transition: 'width 0.3s',
                                width: `${Math.min(messagePercent, 100)}%`,
                            }}
                        />
                    </div>
                    {isMessageNearLimit && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                            <AlertCircle style={{ width: '0.75rem', height: '0.75rem', color: '#ef4444' }} />
                            <p style={{ fontSize: '0.625rem', color: '#ef4444' }}>Approaching limit</p>
                        </div>
                    )}
                </div>
            )}

            {/* Storage Usage */}
            {storage && (
                <div
                    style={{
                        borderRadius: '0.5rem',
                        border: `1px solid ${isStorageNearLimit ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
                        background: 'rgba(255, 255, 255, 0.03)',
                        padding: '0.75rem',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <HardDrive style={{ width: '1rem', height: '1rem', color: 'rgba(255, 255, 255, 0.7)' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(255, 255, 255, 0.7)' }}>Storage</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem', color: '#ffffff' }}>
                            {formatBytes(storage.used)} / {formatBytes(BigInt(MAX_STORAGE_PER_USER))}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>{storagePercent.toFixed(1)}%</span>
                    </div>
                    <div style={{ height: '0.25rem', borderRadius: '0.125rem', background: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
                        <div
                            style={{
                                height: '100%',
                                background: isStorageNearLimit ? '#ef4444' : '#10b981',
                                transition: 'width 0.3s',
                                width: `${Math.min(storagePercent, 100)}%`,
                            }}
                        />
                    </div>
                    {isStorageNearLimit && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                            <AlertCircle style={{ width: '0.75rem', height: '0.75rem', color: '#ef4444' }} />
                            <p style={{ fontSize: '0.625rem', color: '#ef4444' }}>Storage limit warning</p>
                        </div>
                    )}
                </div>
            )}

            {/* Contract Stats */}
            {contractStats && (
                <div
                    style={{
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        background: 'rgba(255, 255, 255, 0.03)',
                        padding: '0.75rem',
                    }}
                >
                    <div style={{ marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(255, 255, 255, 0.7)' }}>Contract</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Treasury</span>
                            <span style={{ color: '#ffffff', fontFamily: 'monospace' }}>
                                {(Number(contractStats.treasuryBalance) / 1e18).toFixed(4)} ETH
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Max File Size</span>
                            <span style={{ color: '#ffffff', fontFamily: 'monospace' }}>{(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)} MB</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
