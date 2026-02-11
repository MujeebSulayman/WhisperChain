'use client';

import { useState } from 'react';
import { UserPlus, Loader2, CheckCircle2 } from 'lucide-react';
import {
	registerUserGasless,
	submitSignedForwardRequest,
} from '@WhisperChain/lib/whisperchainActions';
import { isGaslessConfigured } from '@WhisperChain/lib/gasless';
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
            setError(err.message || 'Registration failed');
        } finally {
            setIsRegistering(false);
        }
    };

    if (success) {
        return (
            <div
                style={{
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    background: 'rgba(16, 185, 129, 0.1)',
                    padding: '2rem',
                    textAlign: 'center',
                }}
            >
                <CheckCircle2 style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', color: '#10b981' }} />
                <p style={{ fontSize: '1rem', fontWeight: 600, color: '#10b981', marginBottom: '0.5rem' }}>Registration Successful!</p>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.5)' }}>Welcome to WhisperChain</p>
            </div>
        );
    }

    return (
        <div
            style={{
                borderRadius: '0.5rem',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(26, 26, 26, 0.95)',
                padding: '1.5rem',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                zIndex: 1,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div
                    style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <UserPlus style={{ width: '1.25rem', height: '1.25rem', color: 'rgba(255, 255, 255, 0.7)' }} />
                </div>
                <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.25rem' }}>Register on WhisperChain</h3>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>Create your profile to start messaging</p>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.5rem' }}>
                        Username
                    </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        disabled={isRegistering}
                        autoFocus
                        style={{
                            width: '100%',
                            borderRadius: '0.5rem',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            background: 'rgba(255, 255, 255, 0.03)',
                            padding: '0.75rem',
                            fontSize: '0.875rem',
                            color: '#ffffff',
                            outline: 'none',
                            transition: 'all 0.2s',
                            cursor: isRegistering ? 'not-allowed' : 'text',
                            opacity: isRegistering ? 0.6 : 1,
                            pointerEvents: isRegistering ? 'none' : 'auto',
                            WebkitAppearance: 'none',
                            appearance: 'none',
                        }}
                        onFocus={(e) => {
                            if (!isRegistering) {
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            }
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        }}
                    />
                    <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                        A unique public key will be auto-generated for you
                    </p>
                </div>

                {error && (
                    <div
                        style={{
                            borderRadius: '0.5rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            padding: '0.75rem',
                        }}
                    >
                        <p style={{ fontSize: '0.75rem', color: '#fca5a5' }}>{error}</p>
                    </div>
                )}

                <button
                    onClick={handleRegister}
                    disabled={isRegistering || !username.trim()}
                    style={{
                        width: '100%',
                        borderRadius: '0.5rem',
                        background: '#ffffff',
                        border: 'none',
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#0f0f0f',
                        cursor: isRegistering || !username.trim() ? 'not-allowed' : 'pointer',
                        opacity: isRegistering || !username.trim() ? 0.6 : 1,
                        transition: 'opacity 0.2s',
                    }}
                >
                    {isRegistering ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />
                            <span>Registering...</span>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <UserPlus style={{ width: '1rem', height: '1rem' }} />
                            <span>Register</span>
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
}
