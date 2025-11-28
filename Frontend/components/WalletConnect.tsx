'use client';

import { Wallet, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { connectWhisperChain, BASE_CHAIN } from '@WhisperChain/lib/blockchain';

type WalletConnectProps = {
    onConnect: (address: string) => void;
    connectedAddress?: string;
};

export function WalletConnect({ onConnect, connectedAddress }: WalletConnectProps) {
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConnect = async () => {
        setIsConnecting(true);
        setError(null);

        try {
            const { signer } = await connectWhisperChain();
            const address = await signer.getAddress();
            onConnect(address);
        } catch (err: any) {
            setError(err.message || 'Failed to connect wallet');
        } finally {
            setIsConnecting(false);
        }
    };

    if (connectedAddress) {
        return (
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3">
                <div className="flex-1">
                    <p className="text-xs text-slate-400">Connected</p>
                    <p className="font-mono text-sm text-slate-200">
                        {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
                    </p>
                </div>
                <div className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                    {BASE_CHAIN.name}
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
            <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:opacity-50"
            >
                {isConnecting ? (
                    <>
                        <Loader2 className="size-4 animate-spin" />
                        Connecting...
                    </>
                ) : (
                    <>
                        <Wallet className="size-4" />
                        Connect Wallet
                    </>
                )}
            </button>
            {error && (
                <p className="mt-2 text-center text-xs text-red-400">{error}</p>
            )}
        </div>
    );
}

