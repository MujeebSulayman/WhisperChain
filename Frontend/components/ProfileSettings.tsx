'use client';

import { useState } from 'react';
import { User, Key, Loader2, CheckCircle2, X, Clock } from 'lucide-react';
import {
	updatePublicKey,
	updatePublicKeyGasless,
	updateLastSeen,
	updateLastSeenGasless,
	submitSignedForwardRequest,
	waitForTransaction,
} from '@WhisperChain/lib/whisperchainActions';
import { isGaslessConfigured } from '@WhisperChain/lib/gasless';
import { getErrorMessage } from '@WhisperChain/lib/errors';
import { ethers } from 'ethers';

type ProfileSettingsProps = {
    onUpdate: () => void;
    onClose: () => void;
};

export function ProfileSettings({ onUpdate, onClose }: ProfileSettingsProps) {
    const [newPublicKey, setNewPublicKey] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUpdatePublicKey = async () => {
        if (!newPublicKey.trim()) {
            setError('Public key is required');
            return;
        }

        setIsUpdating(true);
        setError(null);

        try {
            const publicKeyBytes = ethers.hexlify(ethers.toUtf8Bytes(newPublicKey));
            if (isGaslessConfigured()) {
                const { request, signature } = await updatePublicKeyGasless(publicKeyBytes);
                await submitSignedForwardRequest(request, signature);
            } else {
                const tx = await updatePublicKey(publicKeyBytes);
                await waitForTransaction(Promise.resolve(tx));
            }
            setSuccess(true);
            setTimeout(() => {
                onUpdate();
                onClose();
            }, 1500);
        } catch (err: any) {
            setError(getErrorMessage(err, 'Failed to update public key'));
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUpdateLastSeen = async () => {
        setIsUpdating(true);
        setError(null);

        try {
            if (isGaslessConfigured()) {
                const { request, signature } = await updateLastSeenGasless();
                await submitSignedForwardRequest(request, signature);
            } else {
                const tx = await updateLastSeen();
                await waitForTransaction(Promise.resolve(tx));
            }
            setSuccess(true);
            setTimeout(() => {
                onUpdate();
                onClose();
            }, 1500);
        } catch (err: any) {
            setError(getErrorMessage(err, 'Failed to update last seen'));
        } finally {
            setIsUpdating(false);
        }
    };

    if (success) {
        return (
            <div
                style={{
                    borderRadius: '0.875rem',
                    border: '1px solid color-mix(in srgb, var(--good) 30%, transparent)',
                    background: 'color-mix(in srgb, var(--good) 10%, transparent)',
                    padding: '2rem',
                    textAlign: 'center',
                }}
            >
                <CheckCircle2 style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', color: 'var(--good)' }} />
                <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--good)' }}>Updated Successfully!</p>
            </div>
        );
    }

    return (
        <div
            style={{
                borderRadius: '0.875rem',
                border: '1px solid color-mix(in srgb, var(--fg) 8%, transparent)',
                background: 'var(--surface)',
                padding: '1.5rem',
                backdropFilter: 'blur(10px)',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User style={{ width: '1.25rem', height: '1.25rem', color: 'color-mix(in srgb, var(--fg) 70%, transparent)' }} />
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--fg)' }}>Profile Settings</h3>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        padding: '0.375rem',
                        borderRadius: '0.875rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'color-mix(in srgb, var(--fg) 70%, transparent)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'color-mix(in srgb, var(--fg) 5%, transparent)';
                        e.currentTarget.style.color = 'var(--fg)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'color-mix(in srgb, var(--fg) 70%, transparent)';
                    }}
                >
                    <X style={{ width: '1rem', height: '1rem' }} />
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'color-mix(in srgb, var(--fg) 70%, transparent)', marginBottom: '0.5rem' }}>
                        <Key style={{ width: '1rem', height: '1rem' }} />
                        Update Public Key
                    </label>
                    <input
                        type="text"
                        value={newPublicKey}
                        onChange={(e) => setNewPublicKey(e.target.value)}
                        placeholder="Enter new public key"
                        style={{
                            width: '100%',
                            borderRadius: '0.875rem',
                            border: '1px solid color-mix(in srgb, var(--fg) 10%, transparent)',
                            background: 'color-mix(in srgb, var(--fg) 3%, transparent)',
                            padding: '0.75rem',
                            fontSize: '0.875rem',
                            color: 'var(--fg)',
                            fontFamily: 'var(--font-mono)',
                            outline: 'none',
                            transition: 'all 0.2s',
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--fg) 20%, transparent)';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--fg) 10%, transparent)';
                        }}
                    />
                    <button
                        onClick={handleUpdatePublicKey}
                        disabled={isUpdating || !newPublicKey.trim()}
                        style={{
                            marginTop: '0.5rem',
                            width: '100%',
                            borderRadius: '0.875rem',
                            background: 'var(--btn-white-bg)',
                            border: 'none',
                            padding: '0.75rem 1rem',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: 'var(--btn-white-fg)',
                            cursor: isUpdating || !newPublicKey.trim() ? 'not-allowed' : 'pointer',
                            opacity: isUpdating || !newPublicKey.trim() ? 0.6 : 1,
                            transition: 'opacity 0.2s',
                        }}
                    >
                        {isUpdating ? (
                            <Loader2 style={{ width: '1rem', height: '1rem', margin: '0 auto', animation: 'spin 1s linear infinite' }} />
                        ) : (
                            'Update Public Key'
                        )}
                    </button>
                </div>

                <div style={{ borderTop: '1px solid color-mix(in srgb, var(--fg) 8%, transparent)', paddingTop: '1rem' }}>
                    <button
                        onClick={handleUpdateLastSeen}
                        disabled={isUpdating}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            borderRadius: '0.875rem',
                            border: '1px solid color-mix(in srgb, var(--fg) 10%, transparent)',
                            background: 'color-mix(in srgb, var(--fg) 3%, transparent)',
                            padding: '0.75rem 1rem',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: 'color-mix(in srgb, var(--fg) 70%, transparent)',
                            cursor: isUpdating ? 'not-allowed' : 'pointer',
                            opacity: isUpdating ? 0.5 : 1,
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            if (!isUpdating) {
                                e.currentTarget.style.background = 'color-mix(in srgb, var(--fg) 5%, transparent)';
                                e.currentTarget.style.color = 'var(--fg)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isUpdating) {
                                e.currentTarget.style.background = 'color-mix(in srgb, var(--fg) 3%, transparent)';
                                e.currentTarget.style.color = 'color-mix(in srgb, var(--fg) 70%, transparent)';
                            }
                        }}
                    >
                        {isUpdating ? (
                            <Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />
                        ) : (
                            <>
                                <Clock style={{ width: '1rem', height: '1rem' }} />
                                Update Last Seen
                            </>
                        )}
                    </button>
                </div>

                {error && (
                    <div
                        style={{
                            borderRadius: '0.875rem',
                            background: 'color-mix(in srgb, var(--bad) 10%, transparent)',
                            border: '1px solid color-mix(in srgb, var(--bad) 20%, transparent)',
                            padding: '0.75rem',
                        }}
                    >
                        <p style={{ fontSize: '0.75rem', color: 'var(--bad)' }}>{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
