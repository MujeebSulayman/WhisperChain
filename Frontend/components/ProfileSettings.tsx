'use client';

import { useState } from 'react';
import { User, Key, Loader2, CheckCircle2 } from 'lucide-react';
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
            await waitForTransaction(tx);
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
            await waitForTransaction(tx);
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
            <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-6 text-center animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="mx-auto mb-3 size-12 text-emerald-400" />
                <p className="text-lg font-semibold text-emerald-300">Updated Successfully!</p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-6 backdrop-blur-sm">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <User className="size-5 text-sky-400" />
                    <h3 className="text-lg font-semibold text-white">Profile Settings</h3>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        <Key className="inline size-4 mr-1" />
                        Update Public Key
                    </label>
                    <input
                        type="text"
                        value={newPublicKey}
                        onChange={(e) => setNewPublicKey(e.target.value)}
                        placeholder="Enter new public key"
                        className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all font-mono"
                    />
                    <button
                        onClick={handleUpdatePublicKey}
                        disabled={isUpdating || !newPublicKey.trim()}
                        className="mt-2 w-full rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:from-sky-400 hover:to-sky-500 disabled:opacity-50"
                    >
                        {isUpdating ? (
                            <Loader2 className="mx-auto size-4 animate-spin" />
                        ) : (
                            'Update Public Key'
                        )}
                    </button>
                </div>

                <div className="border-t border-white/10 pt-4">
                    <button
                        onClick={handleUpdateLastSeen}
                        disabled={isUpdating}
                        className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-slate-800 hover:text-white disabled:opacity-50"
                    >
                        {isUpdating ? (
                            <Loader2 className="mx-auto size-4 animate-spin" />
                        ) : (
                            'Update Last Seen'
                        )}
                    </button>
                </div>

                {error && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2">
                        <p className="text-xs text-red-400">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

