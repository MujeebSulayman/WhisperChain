'use client';

import { useState } from 'react';
import { Send, Plus, X, Loader2, AlertCircle } from 'lucide-react';
import {
	sendBatchMessages,
	sendBatchMessagesGasless,
	submitSignedForwardRequest,
	waitForTransaction,
} from '@WhisperChain/lib/whisperchainActions';
import { isGaslessConfigured } from '@WhisperChain/lib/gasless';
import { getErrorMessage } from '@WhisperChain/lib/errors';
import { ethers } from 'ethers';
import type { AddressLike } from 'ethers';

const MAX_BATCH_MESSAGES = 10;

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
        if (recipients.length >= MAX_BATCH_MESSAGES) {
            setError(`Maximum ${MAX_BATCH_MESSAGES} messages allowed (contract limit)`);
            return;
        }
        setRecipients([...recipients, '']);
        setMessages([...messages, '']);
        setError(null);
    };

    const removeRecipient = (index: number) => {
        setRecipients(recipients.filter((_, i) => i !== index));
        setMessages(messages.filter((_, i) => i !== index));
        setError(null);
    };

    const updateRecipient = (index: number, value: string) => {
        const updated = [...recipients];
        updated[index] = value;
        setRecipients(updated);
        setError(null);
    };

    const updateMessage = (index: number, value: string) => {
        const updated = [...messages];
        updated[index] = value;
        setMessages(updated);
        setError(null);
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

        if (recipients.length > MAX_BATCH_MESSAGES) {
            setError(`Maximum ${MAX_BATCH_MESSAGES} messages allowed (contract limit)`);
            return;
        }

        for (const recipient of recipients) {
            if (!ethers.isAddress(recipient.trim())) {
                setError(`Invalid address: ${recipient}`);
                return;
            }
        }

        setIsSending(true);
        setError(null);

        try {
            const messageHashes = messages.map((msg) =>
                ethers.keccak256(ethers.toUtf8Bytes(msg))
            );
            const ipfsHashes = messages.map(() => '');

            const payload = {
                recipients: recipients.map((r) => r.trim()) as AddressLike[],
                messageHashes,
                ipfsHashes,
                mediaTypes: messages.map(() => 0),
                fileSizes: messages.map(() => BigInt(0)),
                textContents: messages,
            };
            if (isGaslessConfigured()) {
                const { request, signature } = await sendBatchMessagesGasless(payload);
                await submitSignedForwardRequest(request, signature);
            } else {
                const tx = await sendBatchMessages(payload);
                await waitForTransaction(Promise.resolve(tx));
            }
            onComplete();
        } catch (err: any) {
            setError(getErrorMessage(err, 'Failed to send batch messages'));
        } finally {
            setIsSending(false);
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
                maxHeight: '80vh',
                overflowY: 'auto',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Send style={{ width: '1.25rem', height: '1.25rem', color: 'color-mix(in srgb, var(--fg) 70%, transparent)' }} />
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--fg)' }}>Batch Messaging</h3>
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
                    <X style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
            </div>

            <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.875rem', background: 'color-mix(in srgb, var(--fg) 2%, transparent)', border: '1px solid color-mix(in srgb, var(--fg) 5%, transparent)' }}>
                <p style={{ fontSize: '0.75rem', color: 'color-mix(in srgb, var(--fg) 60%, transparent)' }}>
                    Maximum {MAX_BATCH_MESSAGES} messages per batch (contract limit)
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recipients.map((recipient, index) => (
                    <div
                        key={index}
                        style={{
                            borderRadius: '0.875rem',
                            border: '1px solid color-mix(in srgb, var(--fg) 8%, transparent)',
                            background: 'color-mix(in srgb, var(--fg) 3%, transparent)',
                            padding: '1rem',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'color-mix(in srgb, var(--fg) 70%, transparent)' }}>Message {index + 1}</span>
                            {recipients.length > 1 && (
                                <button
                                    onClick={() => removeRecipient(index)}
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
                                    <X style={{ width: '1rem', height: '1rem' }} />
                                </button>
                            )}
                        </div>
                        <input
                            type="text"
                            value={recipient}
                            onChange={(e) => updateRecipient(index, e.target.value)}
                            placeholder="Recipient address (0x...)"
                            style={{
                                width: '100%',
                                marginBottom: '0.5rem',
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
                        <textarea
                            value={messages[index]}
                            onChange={(e) => updateMessage(index, e.target.value)}
                            placeholder="Message content"
                            rows={3}
                            style={{
                                width: '100%',
                                borderRadius: '0.875rem',
                                border: '1px solid color-mix(in srgb, var(--fg) 10%, transparent)',
                                background: 'color-mix(in srgb, var(--fg) 3%, transparent)',
                                padding: '0.625rem 0.75rem',
                                fontSize: '0.875rem',
                                color: 'var(--fg)',
                                outline: 'none',
                                resize: 'none',
                                transition: 'all 0.2s',
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--fg) 20%, transparent)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--fg) 10%, transparent)';
                            }}
                        />
                    </div>
                ))}

                {recipients.length < MAX_BATCH_MESSAGES && (
                    <button
                        onClick={addRecipient}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            borderRadius: '0.875rem',
                            border: '2px dashed color-mix(in srgb, var(--fg) 10%, transparent)',
                            background: 'color-mix(in srgb, var(--fg) 2%, transparent)',
                            padding: '0.75rem 1rem',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: 'color-mix(in srgb, var(--fg) 70%, transparent)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--fg) 20%, transparent)';
                            e.currentTarget.style.background = 'color-mix(in srgb, var(--fg) 5%, transparent)';
                            e.currentTarget.style.color = 'var(--fg)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--fg) 10%, transparent)';
                            e.currentTarget.style.background = 'color-mix(in srgb, var(--fg) 2%, transparent)';
                            e.currentTarget.style.color = 'color-mix(in srgb, var(--fg) 70%, transparent)';
                        }}
                    >
                        <Plus style={{ width: '1rem', height: '1rem' }} />
                        Add Another Message
                    </button>
                )}

                {error && (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            borderRadius: '0.875rem',
                            background: 'color-mix(in srgb, var(--bad) 10%, transparent)',
                            border: '1px solid color-mix(in srgb, var(--bad) 20%, transparent)',
                            padding: '0.75rem',
                        }}
                    >
                        <AlertCircle style={{ width: '1rem', height: '1rem', color: 'var(--bad)', flexShrink: 0 }} />
                        <p style={{ fontSize: '0.75rem', color: 'var(--bad)' }}>{error}</p>
                    </div>
                )}

                <button
                    onClick={handleSend}
                    disabled={isSending || recipients.length === 0 || recipients.some(r => !r.trim()) || messages.some(m => !m.trim())}
                    style={{
                        width: '100%',
                        borderRadius: '0.875rem',
                        background: 'var(--btn-white-bg)',
                        border: 'none',
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'var(--btn-white-fg)',
                        cursor: isSending || recipients.length === 0 ? 'not-allowed' : 'pointer',
                        opacity: isSending || recipients.length === 0 ? 0.6 : 1,
                        transition: 'opacity 0.2s',
                    }}
                >
                    {isSending ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />
                            <span>Sending {recipients.length} messages...</span>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Send style={{ width: '1rem', height: '1rem' }} />
                            <span>Send Batch ({recipients.length} messages)</span>
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
}
