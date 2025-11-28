'use client';

import { Wallet, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { connectWhisperChain, BASE_CHAIN } from '@WhisperChain/lib/blockchain';

type WalletConnectProps = {
    onConnect: (address: string) => void;
    connectedAddress?: string;
};

export function WalletConnect({ onConnect, connectedAddress }: WalletConnectProps) {
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (connectedAddress) {
            setShowSuccess(true);
            const timer = setTimeout(() => setShowSuccess(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [connectedAddress]);

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
            <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-4 shadow-lg shadow-emerald-500/10 backdrop-blur-sm transition-all duration-300 animate-in fade-in slide-in-from-top-2">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 animate-shimmer" />
                <div className="relative flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
                        <div className="relative flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600">
                            <CheckCircle2 className="size-5 text-white" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-emerald-400 transition-colors">
                            Connected
                        </p>
                        <p className="font-mono text-sm font-semibold text-slate-100 truncate">
                            {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
                        </p>
                    </div>
                    <div className="rounded-full bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-300 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105">
                        {BASE_CHAIN.name}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-4 shadow-lg backdrop-blur-sm transition-all duration-300">
            <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all duration-300 hover:from-sky-400 hover:to-sky-500 hover:shadow-xl hover:shadow-sky-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="relative flex items-center justify-center gap-2">
                    {isConnecting ? (
                        <>
                            <Loader2 className="size-4 animate-spin" />
                            <span>Connecting...</span>
                        </>
                    ) : (
                        <>
                            <Wallet className="size-4 transition-transform group-hover:scale-110" />
                            <span>Connect Wallet</span>
                        </>
                    )}
                </div>
            </button>
            {error && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="size-4 text-red-400 shrink-0" />
                    <p className="text-xs text-red-400">{error}</p>
                </div>
            )}
        </div>
    );
}
