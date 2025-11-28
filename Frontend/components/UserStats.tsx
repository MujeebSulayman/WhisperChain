'use client';

import { useState, useEffect } from 'react';
import { HardDrive, MessageSquare, RefreshCw, Loader2 } from 'lucide-react';
import {
    fetchStorageUsage,
    getUserMessageCount,
    fetchContractStats,
} from '@WhisperChain/lib/whisperchainActions';
import type { AddressLike } from 'ethers';

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
        const kb = Number(bytes) / 1024;
        const mb = kb / 1024;
        const gb = mb / 1024;
        if (gb >= 1) return `${gb.toFixed(2)} GB`;
        if (mb >= 1) return `${mb.toFixed(2)} MB`;
        return `${kb.toFixed(2)} KB`;
    };

    const storagePercent = storage
        ? (Number(storage.used) / Number(storage.used + storage.remaining)) * 100
        : 0;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-300">Statistics</h3>
                <button
                    onClick={loadStats}
                    disabled={isLoading}
                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 disabled:opacity-50"
                >
                    {isLoading ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <RefreshCw className="size-4" />
                    )}
                </button>
            </div>

            {storage && (
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                    <div className="mb-3 flex items-center gap-2">
                        <HardDrive className="size-4 text-sky-400" />
                        <span className="text-xs font-medium text-slate-400">Storage</span>
                    </div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-slate-300">
                            {formatBytes(storage.used)} / {formatBytes(storage.used + storage.remaining)}
                        </span>
                        <span className="text-slate-500">{storagePercent.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-sky-500 to-sky-600 transition-all duration-500"
                            style={{ width: `${Math.min(storagePercent, 100)}%` }}
                        />
                    </div>
                </div>
            )}

            {messageCount !== null && (
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="size-4 text-violet-400" />
                        <span className="text-xs font-medium text-slate-400">Messages</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{messageCount.toString()}</p>
                    <p className="text-xs text-slate-500 mt-1">Total sent</p>
                </div>
            )}

            {contractStats && (
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                    <div className="mb-2 flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-400">Contract Stats</span>
                    </div>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Treasury</span>
                            <span className="text-slate-300 font-mono">
                                {(Number(contractStats.treasuryBalance) / 1e18).toFixed(4)} ETH
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

