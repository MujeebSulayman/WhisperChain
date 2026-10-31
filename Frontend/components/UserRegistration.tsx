'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle, PenLine } from 'lucide-react';
import { Logo } from './site/Icons';
import {
	registerUserGasless,
	submitSignedForwardRequest,
} from '@/lib/scarfActions';
import { isGaslessConfigured } from '@/lib/gasless';
import { getErrorMessage } from '@/lib/errors';
import { hexlify } from 'ethers';

type UserRegistrationProps = {
    onRegistered: () => void;
    address: string;
    /** This wallet's encryption public key; unlocking it may ask for a signature. */
    getPublicKey: () => Promise<Uint8Array>;
};

export function UserRegistration({ onRegistered, address, getPublicKey }: UserRegistrationProps) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleRegister = async () => {
        setIsRegistering(true);
        setError(null);

        try {
            const publicKeyBytes = hexlify(await getPublicKey());

            if (isGaslessConfigured()) {
                const { request, signature } = await registerUserGasless({ publicKey: publicKeyBytes });
                await submitSignedForwardRequest(request, signature);
            } else {
                const { registerUser, waitForTransaction } = await import('@/lib/scarfActions');
                const tx = await registerUser({ publicKey: publicKeyBytes });
                await waitForTransaction(Promise.resolve(tx));
            }
            setSuccess(true);
            setTimeout(() => {
                onRegistered();
            }, 1500);
        } catch (err) {
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
                <h2 className="display mt-6 text-[30px]">You&apos;re on Whispr.</h2>
                <p className="mt-2 text-[15px] text-dim">Your private inbox is ready. Opening it…</p>
            </div>
        );
    }

    return (
        <div className="glass rise rounded-[var(--r-panel)] p-6 sm:p-8">
            <Logo size={44} wordmark={false} />
            <p className="eyebrow mt-6">One-time setup</p>
            <h2 className="display mt-2 text-[clamp(28px,4vw,36px)]">Activate your address.</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-dim">
                Your wallet address is your identity: no name, email or profile to fill in. Sign to set up your private
                inbox and record your address so others can message you. It costs no gas.
            </p>

            <div className="mt-7 grid gap-4">
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

                <button onClick={handleRegister} disabled={isRegistering} className="btn btn-lg btn-white mt-1 w-full disabled:opacity-50">
                    {isRegistering ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Activating…
                        </>
                    ) : (
                        <>
                            <PenLine size={18} strokeWidth={2} />
                            Sign to activate
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
