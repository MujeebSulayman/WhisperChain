'use client';

import { useState } from 'react';
import { User, Loader2, CheckCircle2, X, Clock } from 'lucide-react';
import {
	updateLastSeen,
	updateLastSeenGasless,
	submitSignedForwardRequest,
	waitForTransaction,
} from '@/lib/scarfActions';
import { isGaslessConfigured } from '@/lib/gasless';
import { getErrorMessage } from '@/lib/errors';

type ProfileSettingsProps = {
    onUpdate: () => void;
    onClose: () => void;
};

export function ProfileSettings({ onUpdate, onClose }: ProfileSettingsProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
