'use client';

import { useState } from 'react';
import { User, Key, Loader2, CheckCircle2, X, Clock } from 'lucide-react';
import { updatePublicKey, updateLastSeen, waitForTransaction } from '@WhisperChain/lib/whisperchainActions';
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
            const tx = await updatePublicKey(publicKeyBytes);
            await waitForTransaction(Promise.resolve(tx));
            setSuccess(true);
            setTimeout(() => {
                onUpdate();
                onClose();
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to update public key');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUpdateLastSeen = async () => {
        setIsUpdating(true);
        setError(null);

        try {
            const tx = await updateLastSeen();
            await waitForTransaction(Promise.resolve(tx));
            setSuccess(true);
            setTimeout(() => {
                onUpdate();
                onClose();
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to update last seen');
        } finally {
            setIsUpdating(false);
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
                <p style={{ fontSize: '1rem', fontWeight: 600, color: '#10b981' }}>Updated Successfully!</p>
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
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User style={{ width: '1.25rem', height: '1.25rem', color: 'rgba(255, 255, 255, 0.7)' }} />
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#ffffff' }}>Profile Settings</h3>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        padding: '0.375rem',
                        borderRadius: '0.5rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.7)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                    }}
                >
                    <X style={{ width: '1rem', height: '1rem' }} />
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.5rem' }}>
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
                            borderRadius: '0.5rem',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            background: 'rgba(255, 255, 255, 0.03)',
                            padding: '0.75rem',
                            fontSize: '0.875rem',
                            color: '#ffffff',
                            fontFamily: 'monospace',
                            outline: 'none',
                            transition: 'all 0.2s',
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        }}
                    />
                    <button
                        onClick={handleUpdatePublicKey}
                        disabled={isUpdating || !newPublicKey.trim()}
                        style={{
                            marginTop: '0.5rem',
                            width: '100%',
                            borderRadius: '0.5rem',
                            background: '#ffffff',
                            border: 'none',
                            padding: '0.75rem 1rem',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: '#0f0f0f',
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

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem' }}>
                    <button
                        onClick={handleUpdateLastSeen}
                        disabled={isUpdating}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            borderRadius: '0.5rem',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            background: 'rgba(255, 255, 255, 0.03)',
                            padding: '0.75rem 1rem',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: 'rgba(255, 255, 255, 0.7)',
                            cursor: isUpdating ? 'not-allowed' : 'pointer',
                            opacity: isUpdating ? 0.5 : 1,
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            if (!isUpdating) {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                e.currentTarget.style.color = '#ffffff';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isUpdating) {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
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
                            borderRadius: '0.5rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            padding: '0.75rem',
                        }}
                    >
                        <p style={{ fontSize: '0.75rem', color: '#fca5a5' }}>{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
