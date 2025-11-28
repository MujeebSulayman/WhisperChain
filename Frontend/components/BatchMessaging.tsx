'use client';

import { useState } from 'react';
import { Send, Plus, X, Loader2 } from 'lucide-react';
import { sendBatchMessages, waitForTransaction } from '@WhisperChain/lib/whisperchainActions';
import { uploadTextToIPFS } from '@WhisperChain/lib/ipfs';
import { ethers } from 'ethers';
import type { AddressLike } from 'ethers';

type BatchMessagingProps = {
    onComplete: () => void;
    onCancel: () => void;
};

export function BatchMessaging({ onComplete, onCancel }: BatchMessagingProps) {
    const [recipients, setRecipients] = useState<string[]>(['']);
    const [messages, setMessages] = useState<string[]>(['']);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addRecipient = () => {
        setRecipients([...recipients, '']);
        setMessages([...messages, '']);
    };

    const removeRecipient = (index: number) => {
        setRecipients(recipients.filter((_, i) => i !== index));
        setMessages(messages.filter((_, i) => i !== index));
    };

    const updateRecipient = (index: number, value: string) => {
        const updated = [...recipients];
        updated[index] = value;
        setRecipients(updated);
    };

    const updateMessage = (index: number, value: string) => {
        const updated = [...messages];
        updated[index] = value;
        setMessages(updated);
    };

    const handleSend = async () => {
        if (recipients.length === 0 || recipients.some((r) => !r.trim())) {
            setError('All recipients must have addresses');
            return;
        }

        if (messages.some((m) => !m.trim())) {
            setError('All messages must have content');
            return;
        }

        if (recipients.length > 10) {
            setError('Maximum 10 recipients allowed');
            return;
        }

        setIsSending(true);
        setError(null);

        try {
            const ipfsHashes = await Promise.all(
                messages.map((msg) => uploadTextToIPFS(msg))
            );

            const messageHashes = messages.map((msg) =>
                ethers.keccak256(ethers.toUtf8Bytes(msg))
            );

            const tx = await sendBatchMessages({
                recipients: recipients as AddressLike[],
                messageHashes: messageHashes,
                ipfsHashes: ipfsHashes,
                mediaTypes: messages.map(() => 0),
                fileSizes: messages.map((msg) => BigInt(msg.length)),
            });

            await waitForTransaction(tx);
            onComplete();
        } catch (err: any) {
            setError(err.message || 'Failed to send batch messages');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-6 backdrop-blur-sm max-h-[80vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Batch Messaging</h3>
                <button
                    onClick={onCancel}
                    className="rounded-lg p-1 text-slate-400 hover:text-white transition-colors"
                >
                    <X className="size-5" />
                </button>
            </div>

            <div className="space-y-4">
                {recipients.map((recipient, index) => (
                    <div key={index} className="rounded-xl border border-white/10 bg-slate-800/50 p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-400">Message {index + 1}</span>
                            {recipients.length > 1 && (
                                <button
                                    onClick={() => removeRecipient(index)}
                                    className="rounded p-1 text-slate-400 hover:text-red-400 transition-colors"
                                >
                                    <X className="size-4" />
                                </button>
                            )}
                        </div>
                        <input
                            type="text"
                            value={recipient}
                            onChange={(e) => updateRecipient(index, e.target.value)}
                            placeholder="Recipient address (0x...)"
                            className="mb-2 w-full rounded-lg border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none font-mono"
                        />
                        <textarea
                            value={messages[index]}
                            onChange={(e) => updateMessage(index, e.target.value)}
                            placeholder="Message content"
                            rows={3}
                            className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none resize-none"
                        />
                    </div>
                ))}

                {recipients.length < 10 && (
                    <button
                        onClick={addRecipient}
                        className="w-full rounded-xl border border-dashed border-white/20 bg-slate-800/30 px-4 py-3 text-sm font-medium text-slate-300 transition-all hover:border-sky-500/50 hover:bg-sky-500/10 hover:text-sky-300 flex items-center justify-center gap-2"
                    >
                        <Plus className="size-4" />
                        Add Another Message
                    </button>
                )}

                {error && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2">
                        <p className="text-xs text-red-400">{error}</p>
                    </div>
                )}

                <button
                    onClick={handleSend}
                    disabled={isSending || recipients.length === 0}
                    className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all hover:from-sky-400 hover:to-sky-500 hover:shadow-xl hover:shadow-sky-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    {isSending ? (
                        <div className="flex items-center justify-center gap-2">
                            <Loader2 className="size-4 animate-spin" />
                            <span>Sending {recipients.length} messages...</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2">
                            <Send className="size-4" />
                            <span>Send Batch ({recipients.length} messages)</span>
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
}

