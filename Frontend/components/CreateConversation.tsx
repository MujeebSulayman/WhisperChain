'use client';

import { useState } from 'react';
import { Users, Plus, X, Loader2 } from 'lucide-react';
import {
	createConversation,
	createConversationGasless,
	getConversationIdFromTxHash,
	isUserRegistered,
	submitSignedForwardRequest,
	waitForTransaction,
} from '@/lib/scarfActions';
import { MAX_GROUP_RECIPIENTS } from '@/lib/inbox';
import { isGaslessConfigured } from '@/lib/gasless';
import { getErrorMessage } from '@/lib/errors';
import { ethers } from 'ethers';

type CreateConversationProps = {
    onCreated: (conversationId: string, participants: string[]) => void;
    onCancel: () => void;
    currentUser: string;
    /** Prefilled participants, e.g. from a shared chat invite link. */
    initialParticipants?: string[];
};

export function CreateConversation({
    onCreated,
    onCancel,
    currentUser,
    initialParticipants = [],
}: CreateConversationProps) {
    const [participants, setParticipants] = useState<string[]>(() => initialParticipants.map((p) => p.toLowerCase()));
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

        if (participants.length >= MAX_GROUP_RECIPIENTS) {
            setError(`A group can have up to ${MAX_GROUP_RECIPIENTS} other people`);
            return;
        }

        setParticipants([...participants, newParticipant.toLowerCase()]);
        setNewParticipant('');
        setError(null);
    };

    const typedValid = ethers.isAddress(newParticipant.trim()) && newParticipant.trim().toLowerCase() !== currentUser.toLowerCase();
    const memberCount = participants.length + (typedValid && !participants.includes(newParticipant.trim().toLowerCase()) ? 1 : 0);
    const canStart = memberCount > 0;

    const removeParticipant = (address: string) => {
        setParticipants(participants.filter((p) => p !== address));
    };

    const handleCreate = async () => {
        // A typed but un-added address counts, so "paste and press Start" just works.
        const pendingInput = newParticipant.trim().toLowerCase();
        const others = [...participants];
        if (pendingInput && ethers.isAddress(pendingInput) && pendingInput !== currentUser.toLowerCase() && !others.includes(pendingInput)) {
            others.push(pendingInput);
        }
        if (others.length < 1) {
            setError('Add at least one wallet address');
            return;
        }

        setIsCreating(true);
        setError(null);

        try {
            // Everyone must have activated Scarf, or the contract rejects messages to them.
            const registered = await Promise.all(others.map((p) => isUserRegistered(p)));
            const missing = others.filter((_, i) => !registered[i]);
            if (missing.length > 0) {
                setError(
                    missing.length === 1
                        ? `${missing[0].slice(0, 6)}…${missing[0].slice(-4)} hasn't activated Scarf yet. Send them your chat link from Wallet → Receive.`
                        : `${missing.length} of these addresses haven't activated Scarf yet.`
                );
                return;
            }

            const allParticipants = [currentUser, ...others];

            // Direct chats need nothing on-chain: the thread is simply the other address.
            if (others.length === 1) {
                onCreated(others[0], allParticipants);
                return;
            }

            const keyToUse = `${currentUser}-${others.join('-')}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
            const keyHash = ethers.keccak256(ethers.toUtf8Bytes(keyToUse));

            let txHash: string;
            if (isGaslessConfigured()) {
                const { request, signature } = await createConversationGasless({
                    participants: allParticipants,
                    conversationKeyHash: keyHash,
                });
                const { hash } = await submitSignedForwardRequest(request, signature);
                txHash = hash;
            } else {
                const tx = await createConversation({
                    participants: allParticipants,
                    conversationKeyHash: keyHash,
                });
                const receipt = await waitForTransaction(Promise.resolve(tx));
                txHash = receipt.hash;
            }
            const conversationId = await getConversationIdFromTxHash(txHash);
            onCreated(conversationId, allParticipants);
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to start conversation'));
        } finally {
            setIsCreating(false);
        }
    };

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
                    <Users style={{ width: '1.25rem', height: '1.25rem', color: 'color-mix(in srgb, var(--fg) 70%, transparent)' }} />
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--fg)' }}>New conversation</h3>
                </div>
                <button
                    onClick={onCancel}
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
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'color-mix(in srgb, var(--fg) 70%, transparent)', marginBottom: '0.5rem' }}>
                        One address for a direct chat, or several for a group
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
                                borderRadius: '0.875rem',
                                border: '1px solid color-mix(in srgb, var(--fg) 10%, transparent)',
                                background: 'color-mix(in srgb, var(--fg) 3%, transparent)',
                                padding: '0.625rem 0.75rem',
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
                            onClick={addParticipant}
                            style={{
                                borderRadius: '0.875rem',
                                border: '1px solid color-mix(in srgb, var(--fg) 10%, transparent)',
                                background: 'color-mix(in srgb, var(--fg) 5%, transparent)',
                                padding: '0.625rem 0.75rem',
                                color: 'color-mix(in srgb, var(--fg) 70%, transparent)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'color-mix(in srgb, var(--fg) 8%, transparent)';
                                e.currentTarget.style.color = 'var(--fg)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'color-mix(in srgb, var(--fg) 5%, transparent)';
                                e.currentTarget.style.color = 'color-mix(in srgb, var(--fg) 70%, transparent)';
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
                                        borderRadius: '0.875rem',
                                        border: '1px solid color-mix(in srgb, var(--fg) 8%, transparent)',
                                        background: 'color-mix(in srgb, var(--fg) 3%, transparent)',
                                        padding: '0.625rem 0.75rem',
                                    }}
                                >
                                    <p style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'color-mix(in srgb, var(--fg) 70%, transparent)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                        {address}
                                    </p>
                                    <button
                                        onClick={() => removeParticipant(address)}
                                        style={{
                                            borderRadius: '0.25rem',
                                            padding: '0.25rem',
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'color-mix(in srgb, var(--fg) 50%, transparent)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.color = 'var(--bad)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.color = 'color-mix(in srgb, var(--fg) 50%, transparent)';
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
                            borderRadius: '0.875rem',
                            background: 'color-mix(in srgb, var(--bad) 10%, transparent)',
                            border: '1px solid color-mix(in srgb, var(--bad) 20%, transparent)',
                            padding: '0.75rem',
                        }}
                    >
                        <p style={{ fontSize: '0.75rem', color: 'var(--bad)' }}>{error}</p>
                    </div>
                )}

                <button
                    onClick={handleCreate}
                    disabled={isCreating || !canStart}
                    style={{
                        width: '100%',
                        borderRadius: '0.875rem',
                        background: 'var(--btn-white-bg)',
                        border: 'none',
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'var(--btn-white-fg)',
                        cursor: isCreating || !canStart ? 'not-allowed' : 'pointer',
                        opacity: isCreating || !canStart ? 0.6 : 1,
                        transition: 'opacity 0.2s',
                    }}
                >
                    {isCreating ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />
                            <span>{memberCount > 1 ? 'Creating group…' : 'Checking address…'}</span>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Users style={{ width: '1rem', height: '1rem' }} />
                            <span>{memberCount > 1 ? `Create group (${memberCount + 1} people)` : 'Start chat'}</span>
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
}
