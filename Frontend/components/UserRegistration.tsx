'use client';

import { useState } from 'react';
import { UserPlus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Logo } from './site/Icons';
import {
	registerUserGasless,
	submitSignedForwardRequest,
} from '@WhisperChain/lib/whisperchainActions';
import { isGaslessConfigured } from '@WhisperChain/lib/gasless';
import { getErrorMessage } from '@WhisperChain/lib/errors';
import { ethers } from 'ethers';

type UserRegistrationProps = {
    onRegistered: () => void;
    address: string;
};

export function UserRegistration({ onRegistered, address }: UserRegistrationProps) {
    const [username, setUsername] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleRegister = async () => {
        if (!username.trim()) {
            setError('Username is required');
            return;
        }

        setIsRegistering(true);
        setError(null);

        try {
            const uniqueKey = `${address}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
            const publicKeyBytes = ethers.keccak256(ethers.toUtf8Bytes(uniqueKey));

            if (isGaslessConfigured()) {
                const { request, signature } = await registerUserGasless({
                    publicKey: publicKeyBytes,
                    username: username.trim(),
                });
                await submitSignedForwardRequest(request, signature);
            } else {
                const { registerUser, waitForTransaction } = await import('@WhisperChain/lib/whisperchainActions');
                const tx = await registerUser({ publicKey: publicKeyBytes, username: username.trim() });
                await waitForTransaction(Promise.resolve(tx));
            }
            setSuccess(true);
            setTimeout(() => {
                onRegistered();
            }, 1500);
        } catch (err: any) {
            setError(getErrorMessage(err, 'Registration failed'));
        } finally {
            setIsRegistering(false);
        }
    };

    if (success) {
        return (
            <div className="glass rise rounded-[var(--r-panel)] p-10 text-center">
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-good/15 text-good">
                    <CheckCircle2 size={30} strokeWidth={1.8} />
                </span>
                <h2 className="display mt-6 text-[30px]">You&apos;re registered.</h2>
                <p className="mt-2 text-[15px] text-dim">Welcome to WhisperChain. Opening your inbox…</p>
            </div>
        );
    }

    return (
        <div className="glass rise rounded-[var(--r-panel)] p-6 sm:p-8">
            <Logo size={44} wordmark={false} />
            <p className="eyebrow mt-6">One-time setup</p>
            <h2 className="display mt-2 text-[clamp(28px,4vw,36px)]">Create your profile.</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-dim">
                Pick a username people will see. It&apos;s stored on-chain against your address, and it takes one signature.
            </p>

            <div className="mt-7 grid gap-4">
                <label className="grid gap-2">
                    <span className="label">Username</span>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRegister();
                        }}
                        placeholder="e.g. satoshi"
                        disabled={isRegistering}
                        autoFocus
                        className="input"
                    />
                    <span className="text-[12px] text-mute">A unique public key is generated for you automatically.</span>
                </label>

                <div className="inset-panel flex items-center gap-3 rounded-[var(--r-inset)] px-4 py-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-good/15 text-good">
                        <CheckCircle2 size={15} strokeWidth={2} />
                    </span>
                    <div className="min-w-0">
                        <p className="label text-[10px]!">Wallet</p>
                        <p className="truncate font-mono text-[13px]">{address.slice(0, 6)}…{address.slice(-4)}</p>
                    </div>
                </div>

                {error && (
                    <p className="inset-panel flex items-start gap-2 rounded-[var(--r-inset)] p-3 text-[13px] text-dim">
                        <AlertCircle size={15} strokeWidth={1.8} className="mt-0.5 shrink-0 text-bad" />
                        {error}
                    </p>
                )}

                <button onClick={handleRegister} disabled={isRegistering || !username.trim()} className="btn btn-lg btn-white mt-1 w-full disabled:opacity-50">
                    {isRegistering ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Registering…
                        </>
                    ) : (
                        <>
                            <UserPlus size={18} strokeWidth={2} />
                            Register
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
