'use client';

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteWhisper, waitForTransaction } from '@WhisperChain/lib/whisperchainActions';
import type { BytesLike } from 'ethers';

type MessageActionsProps = {
    messageId: BytesLike;
    isDelivered: boolean;
    isRead: boolean;
    isSelf: boolean;
    onUpdate: () => void;
};

export function MessageActions({
    messageId,
    isDelivered,
    isRead,
    isSelf,
    onUpdate,
}: MessageActionsProps) {
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this message?')) return;

        setIsLoading('delete');
        try {
            const tx = await deleteWhisper(messageId);
            await waitForTransaction(Promise.resolve(tx));
            onUpdate();
        } catch (error) {
            console.error('Failed to delete message:', error);
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleDelete}
                disabled={isLoading !== null}
                className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 transition-all hover:bg-red-500/20 disabled:opacity-50"
                title="Delete message"
            >
                {isLoading === 'delete' ? (
                    <Loader2 className="size-3 animate-spin" />
                ) : (
                    <Trash2 className="size-3" />
                )}
                Delete
            </button>
        </div>
    );
}

