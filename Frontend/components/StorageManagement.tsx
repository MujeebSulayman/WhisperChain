'use client';

import { useState } from 'react';
import { HardDrive, Trash2, Loader2, AlertTriangle, Wallet } from 'lucide-react';
import {
	clearStorage,
	clearStorageGasless,
	withdrawBalance,
	withdrawBalanceGasless,
	submitSignedForwardRequest,
	waitForTransaction,
} from '@WhisperChain/lib/whisperchainActions';
import { isGaslessConfigured } from '@WhisperChain/lib/gasless';
import { getErrorMessage } from '@WhisperChain/lib/errors';
import type { AddressLike } from 'ethers';

// Contract constants
const MAX_STORAGE_PER_USER = 1000000000; // 1GB

type StorageManagementProps = {
    userAddress: AddressLike;
    onUpdate: () => void;
};

export function StorageManagement({ userAddress, onUpdate }: StorageManagementProps) {
    const [isClearing, setIsClearing] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleClearStorage = async () => {
        if (!confirm('Are you sure you want to clear all storage? This will reset your storage usage to 0. This cannot be undone.')) {
            return;
        }

        setIsClearing(true);
        setError(null);

        try {
            if (isGaslessConfigured()) {
                const { request, signature } = await clearStorageGasless();
                await submitSignedForwardRequest(request, signature);
            } else {
                const tx = await clearStorage();
                await waitForTransaction(Promise.resolve(tx));
            }
            onUpdate();
        } catch (err: any) {
            setError(getErrorMessage(err, 'Failed to clear storage'));
        } finally {
            setIsClearing(false);
        }
    };

    const handleWithdraw = async () => {
        setIsWithdrawing(true);
        setError(null);

        try {
            if (isGaslessConfigured()) {
                const { request, signature } = await withdrawBalanceGasless();
                await submitSignedForwardRequest(request, signature);
            } else {
                const tx = await withdrawBalance();
                await waitForTransaction(Promise.resolve(tx));
            }
            onUpdate();
        } catch (err: any) {
            setError(getErrorMessage(err, 'Failed to withdraw balance'));
        } finally {
            setIsWithdrawing(false);
        }
    };

    const formatBytes = (bytes: number) => {
        const mb = bytes / 1024 / 1024;
        const gb = mb / 1024;
        if (gb >= 1) return `${gb.toFixed(2)} GB`;
        return `${mb.toFixed(2)} MB`;
    };

    return (
        <div
            style={{
                borderRadius: '0.5rem',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '1rem',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <HardDrive style={{ width: '1rem', height: '1rem', color: 'rgba(255, 255, 255, 0.7)' }} />
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff' }}>Storage Management</h3>
            </div>

            <div
                style={{
                    marginBottom: '1rem',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
            >
                <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.25rem' }}>Storage Limit</p>
                <p style={{ fontSize: '0.875rem', color: '#ffffff', fontFamily: 'monospace' }}>{formatBytes(MAX_STORAGE_PER_USER)}</p>
            </div>

            {error && (
                <div
                    style={{
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                    }}
                >
                    <AlertTriangle style={{ width: '1rem', height: '1rem', color: '#f87171', flexShrink: 0 }} />
                    <p style={{ fontSize: '0.75rem', color: '#fca5a5' }}>{error}</p>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                    onClick={handleClearStorage}
                    disabled={isClearing}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.625rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#f87171',
                        cursor: isClearing ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        opacity: isClearing ? 0.5 : 1,
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        if (!isClearing) {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isClearing) {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                        }
                    }}
                >
                    {isClearing ? (
                        <Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />
                    ) : (
                        <Trash2 style={{ width: '1rem', height: '1rem' }} />
                    )}
                    Clear Storage
                </button>

                <button
                    onClick={handleWithdraw}
                    disabled={isWithdrawing}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.625rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'rgba(255, 255, 255, 0.7)',
                        cursor: isWithdrawing ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        opacity: isWithdrawing ? 0.5 : 1,
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        if (!isWithdrawing) {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                            e.currentTarget.style.color = '#ffffff';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isWithdrawing) {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                        }
                    }}
                >
                    {isWithdrawing ? (
                        <Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />
                    ) : (
                        <Wallet style={{ width: '1rem', height: '1rem' }} />
                    )}
                    Withdraw Balance
                </button>
            </div>
        </div>
    );
}
