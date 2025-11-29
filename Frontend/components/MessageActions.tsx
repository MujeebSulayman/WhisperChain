'use client';

import { useState } from 'react';
import { Eye, Trash2, Loader2 } from 'lucide-react';
import { markRead, deleteWhisper, waitForTransaction } from '@WhisperChain/lib/whisperchainActions';
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

    const handleMarkRead = async () => {
        setIsLoading('read');
        try {
            const tx = await markRead(messageId);
            await waitForTransaction(Promise.resolve(tx));
            onUpdate();
        } catch (error) {
            console.error('Failed to mark as read:', error);
        } finally {
            setIsLoading(null);
        }
    };

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
            {!isSelf && !isRead && (
                <button
                    onClick={handleMarkRead}
                    disabled={isLoading !== null}
                    className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 transition-all hover:bg-emerald-500/20 disabled:opacity-50"
                    title="Mark as read"
                >
                    {isLoading === 'read' ? (
                        <Loader2 className="size-3 animate-spin" />
                    ) : (
                        <Eye className="size-3" />
                    )}
                    Mark Read
                </button>
            )}

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

