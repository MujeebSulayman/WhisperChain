'use client';

import { useState } from 'react';
import { Users, Plus, X, Loader2 } from 'lucide-react';
import { createConversation, waitForTransaction } from '@WhisperChain/lib/whisperchainActions';
import { ethers } from 'ethers';
import type { AddressLike } from 'ethers';

type CreateConversationProps = {
    onCreated: (conversationId: string) => void;
    onCancel: () => void;
    currentUser: string;
};

export function CreateConversation({
    onCreated,
    onCancel,
    currentUser,
}: CreateConversationProps) {
    const [participants, setParticipants] = useState<string[]>([]);
    const [newParticipant, setNewParticipant] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addParticipant = () => {
        if (!newParticipant.trim()) return;

        if (!ethers.isAddress(newParticipant)) {
            setError('Invalid Ethereum address');
            return;
        }

        if (newParticipant.toLowerCase() === currentUser.toLowerCase()) {
            setError('Cannot add yourself');
            return;
        }

        if (participants.includes(newParticipant.toLowerCase())) {
            setError('Participant already added');
            return;
        }

        setParticipants([...participants, newParticipant.toLowerCase()]);
        setNewParticipant('');
        setError(null);
    };

    const removeParticipant = (address: string) => {
        setParticipants(participants.filter((p) => p !== address));
    };

    const handleCreate = async () => {
        if (participants.length < 1) {
            setError('Add at least one participant (contract requires minimum 2 participants including you)');
            return;
        }

        setIsCreating(true);
        setError(null);

        try {
            // Auto-generate a conversation key (using participants + timestamp + random)
            const keyToUse = `${currentUser}-${participants.join('-')}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
            const keyHash = ethers.keccak256(ethers.toUtf8Bytes(keyToUse));
            const allParticipants = [currentUser, ...participants] as AddressLike[];

            const tx = await createConversation({
                participants: allParticipants,
                conversationKeyHash: keyHash,
            });

            const receipt = await waitForTransaction(Promise.resolve(tx));
            onCreated(receipt.hash);
        } catch (err: any) {
            setError(err.message || 'Failed to create conversation');
        } finally {
            setIsCreating(false);
        }
    };

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
                    <Users style={{ width: '1.25rem', height: '1.25rem', color: 'rgba(255, 255, 255, 0.7)' }} />
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#ffffff' }}>Create Conversation</h3>
                </div>
                <button
                    onClick={onCancel}
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
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.5rem' }}>
                        Participants (minimum 2 including you)
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <input
                            type="text"
                            value={newParticipant}
                            onChange={(e) => setNewParticipant(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addParticipant()}
                            placeholder="0x..."
                            style={{
                                flex: 1,
                                borderRadius: '0.5rem',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                background: 'rgba(255, 255, 255, 0.03)',
                                padding: '0.625rem 0.75rem',
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
                            onClick={addParticipant}
                            style={{
                                borderRadius: '0.5rem',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '0.625rem 0.75rem',
                                color: 'rgba(255, 255, 255, 0.7)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                            }}
                        >
                            <Plus style={{ width: '1rem', height: '1rem' }} />
                        </button>
                    </div>

                    {participants.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {participants.map((address) => (
                                <div
                                    key={address}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        borderRadius: '0.5rem',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        padding: '0.625rem 0.75rem',
                                    }}
                                >
                                    <p style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'rgba(255, 255, 255, 0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                        {address}
                                    </p>
                                    <button
                                        onClick={() => removeParticipant(address)}
                                        style={{
                                            borderRadius: '0.25rem',
                                            padding: '0.25rem',
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'rgba(255, 255, 255, 0.5)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.color = '#ef4444';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                                        }}
                                    >
                                        <X style={{ width: '0.875rem', height: '0.875rem' }} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
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
                    onClick={handleCreate}
                    disabled={isCreating || participants.length < 1}
                    style={{
                        width: '100%',
                        borderRadius: '0.5rem',
                        background: '#ffffff',
                        border: 'none',
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#0f0f0f',
                        cursor: isCreating || participants.length < 1 ? 'not-allowed' : 'pointer',
                        opacity: isCreating || participants.length < 1 ? 0.6 : 1,
                        transition: 'opacity 0.2s',
                    }}
                >
                    {isCreating ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />
                            <span>Creating...</span>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Users style={{ width: '1rem', height: '1rem' }} />
                            <span>Create Conversation</span>
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
}
