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
} from '@/lib/scarfActions';
import { isGaslessConfigured } from '@/lib/gasless';
import { getErrorMessage } from '@/lib/errors';
import type { AddressLike } from 'ethers';

const MAX_STORAGE_PER_USER = 1000000000;

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
                borderRadius: '0.875rem',
                border: '1px solid color-mix(in srgb, var(--fg) 8%, transparent)',
                background: 'color-mix(in srgb, var(--fg) 3%, transparent)',
                padding: '1rem',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <HardDrive style={{ width: '1rem', height: '1rem', color: 'color-mix(in srgb, var(--fg) 70%, transparent)' }} />
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--fg)' }}>Storage Management</h3>
            </div>

            <div
                style={{
                    marginBottom: '1rem',
                    padding: '0.75rem',
                    borderRadius: '0.875rem',
                    background: 'color-mix(in srgb, var(--fg) 2%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--fg) 5%, transparent)',
                }}
            >
                <p style={{ fontSize: '0.75rem', color: 'color-mix(in srgb, var(--fg) 60%, transparent)', marginBottom: '0.25rem' }}>Storage Limit</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--fg)', fontFamily: 'var(--font-mono)' }}>{formatBytes(MAX_STORAGE_PER_USER)}</p>
            </div>

            {error && (
                <div
                    style={{
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem',
                        borderRadius: '0.875rem',
                        background: 'color-mix(in srgb, var(--bad) 10%, transparent)',
                        border: '1px solid color-mix(in srgb, var(--bad) 20%, transparent)',
                    }}
                >
                    <AlertTriangle style={{ width: '1rem', height: '1rem', color: 'var(--bad)', flexShrink: 0 }} />
                    <p style={{ fontSize: '0.75rem', color: 'var(--bad)' }}>{error}</p>
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
                        borderRadius: '0.875rem',
                        border: '1px solid color-mix(in srgb, var(--bad) 30%, transparent)',
                        background: 'color-mix(in srgb, var(--bad) 10%, transparent)',
                        color: 'var(--bad)',
                        cursor: isClearing ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        opacity: isClearing ? 0.5 : 1,
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        if (!isClearing) {
                            e.currentTarget.style.background = 'color-mix(in srgb, var(--bad) 15%, transparent)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isClearing) {
                            e.currentTarget.style.background = 'color-mix(in srgb, var(--bad) 10%, transparent)';
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
                        borderRadius: '0.875rem',
                        border: '1px solid color-mix(in srgb, var(--fg) 10%, transparent)',
                        background: 'color-mix(in srgb, var(--fg) 5%, transparent)',
                        color: 'color-mix(in srgb, var(--fg) 70%, transparent)',
                        cursor: isWithdrawing ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        opacity: isWithdrawing ? 0.5 : 1,
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        if (!isWithdrawing) {
                            e.currentTarget.style.background = 'color-mix(in srgb, var(--fg) 8%, transparent)';
                            e.currentTarget.style.color = 'var(--fg)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isWithdrawing) {
                            e.currentTarget.style.background = 'color-mix(in srgb, var(--fg) 5%, transparent)';
                            e.currentTarget.style.color = 'color-mix(in srgb, var(--fg) 70%, transparent)';
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
