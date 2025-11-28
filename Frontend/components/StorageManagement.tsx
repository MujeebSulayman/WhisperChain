'use client';

import { useState } from 'react';
import { HardDrive, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { clearStorage, withdrawBalance, waitForTransaction } from '@WhisperChain/lib/whisperchainActions';
import type { AddressLike } from 'ethers';

type StorageManagementProps = {
    userAddress: AddressLike;
    onUpdate: () => void;
};

export function StorageManagement({ userAddress, onUpdate }: StorageManagementProps) {
    const [isClearing, setIsClearing] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleClearStorage = async () => {
        if (!confirm('Are you sure you want to clear all storage? This cannot be undone.')) {
            return;
        }

        setIsClearing(true);
        setError(null);

        try {
            const tx = await clearStorage();
            await waitForTransaction(tx);
            onUpdate();
        } catch (err: any) {
            setError(err.message || 'Failed to clear storage');
        } finally {
            setIsClearing(false);
        }
    };

    const handleWithdraw = async () => {
        setIsWithdrawing(true);
        setError(null);

        try {
            const tx = await withdrawBalance();
            await waitForTransaction(tx);
            onUpdate();
        } catch (err: any) {
            setError(err.message || 'Failed to withdraw balance');
        } finally {
            setIsWithdrawing(false);
        }
    };

    return (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-4 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2">
                <HardDrive className="size-4 text-sky-400" />
                <h3 className="text-sm font-semibold text-white">Storage Management</h3>
            </div>

            {error && (
                <div className="mb-3 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 flex items-center gap-2">
                    <AlertTriangle className="size-4 text-red-400" />
                    <p className="text-xs text-red-400">{error}</p>
                </div>
            )}

            <div className="space-y-2">
                <button
                    onClick={handleClearStorage}
                    disabled={isClearing}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-2.5 text-sm font-medium text-orange-300 transition-all hover:bg-orange-500/20 disabled:opacity-50"
                >
                    {isClearing ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Trash2 className="size-4" />
                    )}
                    Clear Storage
                </button>

                <button
                    onClick={handleWithdraw}
                    disabled={isWithdrawing}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-2.5 text-sm font-medium text-sky-300 transition-all hover:bg-sky-500/20 disabled:opacity-50"
                >
                    {isWithdrawing ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <HardDrive className="size-4" />
                    )}
                    Withdraw Balance
                </button>
            </div>
        </div>
    );
}

