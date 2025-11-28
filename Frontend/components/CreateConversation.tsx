'use client';

import { useState } from 'react';
import { Users, Plus, X, Loader2 } from 'lucide-react';
import { createConversation, waitForTransaction } from '@WhisperChain/lib/whisperchainActions';
import { ethers } from 'ethers';
import type { AddressLike, BytesLike } from 'ethers';

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
    const [conversationKey, setConversationKey] = useState('');
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
            setError('Add at least one participant');
            return;
        }

        if (!conversationKey.trim()) {
            setError('Enter a conversation key');
            return;
        }

        setIsCreating(true);
        setError(null);

        try {
            const keyHash = ethers.keccak256(ethers.toUtf8Bytes(conversationKey));
            const allParticipants = [currentUser, ...participants] as AddressLike[];

            const tx = await createConversation({
                participants: allParticipants,
                conversationKeyHash: keyHash,
            });

            const receipt = await waitForTransaction(tx);
            onCreated(receipt.hash);
        } catch (err: any) {
            setError(err.message || 'Failed to create conversation');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users className="size-5 text-sky-400" />
                    <h3 className="text-lg font-semibold text-white">Create Conversation</h3>
                </div>
                <button
                    onClick={onCancel}
                    className="rounded-lg p-1 text-slate-400 hover:text-white transition-colors"
                >
                    <X className="size-5" />
                </button>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Conversation Key
                    </label>
                    <input
                        type="text"
                        value={conversationKey}
                        onChange={(e) => setConversationKey(e.target.value)}
                        placeholder="Enter encryption key"
                        className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                        This key will be used for encrypted messaging
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Participants
                    </label>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={newParticipant}
                            onChange={(e) => setNewParticipant(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addParticipant()}
                            placeholder="0x..."
                            className="flex-1 rounded-xl border border-white/10 bg-slate-800/50 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all font-mono"
                        />
                        <button
                            onClick={addParticipant}
                            className="rounded-xl bg-sky-500/20 border border-sky-500/30 px-4 py-2.5 text-sky-300 hover:bg-sky-500/30 transition-colors"
                        >
                            <Plus className="size-4" />
                        </button>
                    </div>

                    {participants.length > 0 && (
                        <div className="space-y-2">
                            {participants.map((address) => (
                                <div
                                    key={address}
                                    className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-800/50 px-3 py-2"
                                >
                                    <p className="text-xs font-mono text-slate-300 truncate">{address}</p>
                                    <button
                                        onClick={() => removeParticipant(address)}
                                        className="rounded p-1 text-slate-400 hover:text-red-400 transition-colors"
                                    >
                                        <X className="size-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {error && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2">
                        <p className="text-xs text-red-400">{error}</p>
                    </div>
                )}

                <button
                    onClick={handleCreate}
                    disabled={isCreating || participants.length < 1}
                    className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all hover:from-sky-400 hover:to-sky-500 hover:shadow-xl hover:shadow-sky-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    {isCreating ? (
                        <div className="flex items-center justify-center gap-2">
                            <Loader2 className="size-4 animate-spin" />
                            <span>Creating...</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2">
                            <Users className="size-4" />
                            <span>Create Conversation</span>
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
}

