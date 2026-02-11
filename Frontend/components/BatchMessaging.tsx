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
// Text messages are not stored on IPFS, only media files are
import { ethers } from 'ethers';
import type { AddressLike } from 'ethers';

// Contract constant
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

        // Validate addresses
        for (const recipient of recipients) {
            if (!ethers.isAddress(recipient.trim())) {
                setError(`Invalid address: ${recipient}`);
                return;
            }
        }

        setIsSending(true);
        setError(null);

        try {
            // For text messages, don't upload to IPFS - store text content directly in contract
            const messageHashes = messages.map((msg) =>
                ethers.keccak256(ethers.toUtf8Bytes(msg))
            );
            // Use empty IPFS hashes for text messages (contract allows it now)
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
            setError(err.message || 'Failed to send batch messages');
        } finally {
            setIsSending(false);
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
                maxHeight: '80vh',
                overflowY: 'auto',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Send style={{ width: '1.25rem', height: '1.25rem', color: 'rgba(255, 255, 255, 0.7)' }} />
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#ffffff' }}>Batch Messaging</h3>
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
                    <X style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
            </div>

            <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                    Maximum {MAX_BATCH_MESSAGES} messages per batch (contract limit)
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recipients.map((recipient, index) => (
                    <div
                        key={index}
                        style={{
                            borderRadius: '0.5rem',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            background: 'rgba(255, 255, 255, 0.03)',
                            padding: '1rem',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(255, 255, 255, 0.7)' }}>Message {index + 1}</span>
                            {recipients.length > 1 && (
                                <button
                                    onClick={() => removeRecipient(index)}
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
                        <textarea
                            value={messages[index]}
                            onChange={(e) => updateMessage(index, e.target.value)}
                            placeholder="Message content"
                            rows={3}
                            style={{
                                width: '100%',
                                borderRadius: '0.5rem',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                background: 'rgba(255, 255, 255, 0.03)',
                                padding: '0.625rem 0.75rem',
                                fontSize: '0.875rem',
                                color: '#ffffff',
                                outline: 'none',
                                resize: 'none',
                                transition: 'all 0.2s',
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
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
                            borderRadius: '0.5rem',
                            border: '2px dashed rgba(255, 255, 255, 0.1)',
                            background: 'rgba(255, 255, 255, 0.02)',
                            padding: '0.75rem 1rem',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: 'rgba(255, 255, 255, 0.7)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
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
                            borderRadius: '0.5rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            padding: '0.75rem',
                        }}
                    >
                        <AlertCircle style={{ width: '1rem', height: '1rem', color: '#f87171', flexShrink: 0 }} />
                        <p style={{ fontSize: '0.75rem', color: '#fca5a5' }}>{error}</p>
                    </div>
                )}

                <button
                    onClick={handleSend}
                    disabled={isSending || recipients.length === 0 || recipients.some(r => !r.trim()) || messages.some(m => !m.trim())}
                    style={{
                        width: '100%',
                        borderRadius: '0.5rem',
                        background: '#ffffff',
                        border: 'none',
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#0f0f0f',
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
