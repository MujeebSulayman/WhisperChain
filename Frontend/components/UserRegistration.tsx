'use client';

import { useState } from 'react';
import { UserPlus, Loader2, CheckCircle2 } from 'lucide-react';
import { registerUser, waitForTransaction } from '@WhisperChain/lib/whisperchainActions';
import { ethers } from 'ethers';

type UserRegistrationProps = {
    onRegistered: () => void;
    address: string;
};

export function UserRegistration({ onRegistered, address }: UserRegistrationProps) {
    const [username, setUsername] = useState('');
    const [publicKey, setPublicKey] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleRegister = async () => {
        if (!username.trim() || !publicKey.trim()) {
            setError('Username and public key are required');
            return;
        }

        setIsRegistering(true);
        setError(null);

        try {
            const publicKeyBytes = ethers.hexlify(ethers.toUtf8Bytes(publicKey));
            const tx = await registerUser({
                publicKey: publicKeyBytes,
                username: username.trim(),
            });

            await waitForTransaction(tx);
            setSuccess(true);
            setTimeout(() => {
                onRegistered();
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setIsRegistering(false);
        }
    };

    if (success) {
        return (
            <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-6 text-center animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="mx-auto mb-3 size-12 text-emerald-400" />
                <p className="text-lg font-semibold text-emerald-300">Registration Successful!</p>
                <p className="text-sm text-slate-400 mt-2">Welcome to WhisperChain</p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-sky-500/20 p-2">
                    <UserPlus className="size-5 text-sky-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">Register on WhisperChain</h3>
                    <p className="text-xs text-slate-400">Create your profile to start messaging</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Username
                    </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Public Key
                    </label>
                    <input
                        type="text"
                        value={publicKey}
                        onChange={(e) => setPublicKey(e.target.value)}
                        placeholder="Enter your public encryption key"
                        className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all font-mono"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                        This will be used for encrypted messaging
                    </p>
                </div>

                {error && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2">
                        <p className="text-xs text-red-400">{error}</p>
                    </div>
                )}

                <button
                    onClick={handleRegister}
                    disabled={isRegistering || !username.trim() || !publicKey.trim()}
                    className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all hover:from-sky-400 hover:to-sky-500 hover:shadow-xl hover:shadow-sky-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    {isRegistering ? (
                        <div className="flex items-center justify-center gap-2">
                            <Loader2 className="size-4 animate-spin" />
                            <span>Registering...</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2">
                            <UserPlus className="size-4" />
                            <span>Register</span>
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
}

