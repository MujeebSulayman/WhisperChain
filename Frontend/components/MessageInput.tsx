'use client';

import { Send, Paperclip, Loader2, Coins, X } from 'lucide-react';
import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { FileUpload } from './FileUpload';
import { PaymentOptions } from './PaymentOptions';
import type { AddressLike, BigNumberish } from 'ethers';

type MessageInputProps = {
    onSend: (args: {
        text: string;
        ipfsHash?: string;
        mediaType?: number;
        fileSize?: bigint;
        paymentAmount?: BigNumberish;
        paymentToken?: AddressLike;
    }) => Promise<void>;
    disabled?: boolean;
    placeholder?: string;
};

export function MessageInput({
    onSend,
    disabled = false,
    placeholder = 'Type a message...',
}: MessageInputProps) {
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [showFileUpload, setShowFileUpload] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [ipfsHash, setIpfsHash] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<number>(0);
    const [fileSize, setFileSize] = useState<bigint>(BigInt(0));
    const [paymentAmount, setPaymentAmount] = useState<BigNumberish | undefined>();
    const [paymentToken, setPaymentToken] = useState<AddressLike | undefined>();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [input]);

    const handleSend = async () => {
        if ((!input.trim() && !ipfsHash) || isSending || disabled) return;

        const message = input.trim() || 'Media message';
        const currentInput = input;
        setInput('');
        setIsSending(true);

        try {
            await onSend({
                text: message,
                ipfsHash: ipfsHash || undefined,
                mediaType: ipfsHash ? mediaType : undefined,
                fileSize: ipfsHash ? fileSize : undefined,
                paymentAmount,
                paymentToken,
            });
            setIpfsHash(null);
            setMediaType(0);
            setFileSize(BigInt(0));
            setPaymentAmount(undefined);
            setPaymentToken(undefined);
        } catch (error) {
            console.error('Failed to send message:', error);
            setInput(currentInput);
        } finally {
            setIsSending(false);
            textareaRef.current?.focus();
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileUpload = (hash: string, type: number, size: bigint) => {
        setIpfsHash(hash);
        setMediaType(type);
        setFileSize(size);
        setShowFileUpload(false);
    };

    return (
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', background: '#111118', padding: '1rem' }}>
            {(showFileUpload || showPayment) && (
                <div style={{ marginBottom: '1rem' }}>
                    {showFileUpload && (
                        <FileUpload
                            onUploadComplete={handleFileUpload}
                            onCancel={() => setShowFileUpload(false)}
                        />
                    )}
                    {showPayment && (
                        <PaymentOptions
                            onPaymentSet={(amount, token) => {
                                setPaymentAmount(amount);
                                setPaymentToken(token);
                                setShowPayment(false);
                            }}
                            onCancel={() => {
                                setShowPayment(false);
                                setPaymentAmount(undefined);
                                setPaymentToken(undefined);
                            }}
                        />
                    )}
                </div>
            )}

            {(ipfsHash || paymentAmount) && (
                <div style={{ marginBottom: '0.75rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
                    {ipfsHash && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                            <span style={{ fontSize: '0.75rem', color: '#c7d2fe' }}>File: {ipfsHash.slice(0, 12)}...</span>
                            <button
                                onClick={() => {
                                    setIpfsHash(null);
                                    setMediaType(0);
                                    setFileSize(BigInt(0));
                                }}
                                style={{ background: 'transparent', border: 'none', color: '#818cf8', cursor: 'pointer', padding: 0 }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#6366f1'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#818cf8'}
                            >
                                <X style={{ width: '0.875rem', height: '0.875rem' }} />
                            </button>
                        </div>
                    )}
                    {paymentAmount && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                            <span style={{ fontSize: '0.75rem', color: '#c7d2fe' }}>Payment: {paymentAmount.toString()} wei</span>
                            <button
                                onClick={() => {
                                    setPaymentAmount(undefined);
                                    setPaymentToken(undefined);
                                }}
                                style={{ background: 'transparent', border: 'none', color: '#818cf8', cursor: 'pointer', padding: 0 }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#6366f1'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#818cf8'}
                            >
                                <X style={{ width: '0.875rem', height: '0.875rem' }} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                        onClick={() => {
                            setShowFileUpload(!showFileUpload);
                            setShowPayment(false);
                        }}
                        disabled={disabled}
                        style={{
                            padding: '0.625rem',
                            borderRadius: '0.5rem',
                            background: showFileUpload ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                            border: showFileUpload ? '1px solid rgba(99, 102, 241, 0.3)' : 'none',
                            color: showFileUpload ? '#818cf8' : 'rgba(255, 255, 255, 0.6)',
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            opacity: disabled ? 0.5 : 1,
                        }}
                        onMouseEnter={(e) => !disabled && !showFileUpload && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
                        onMouseLeave={(e) => !disabled && !showFileUpload && (e.currentTarget.style.background = 'transparent')}
                    >
                        <Paperclip style={{ width: '1rem', height: '1rem' }} />
                    </button>
                    <button
                        onClick={() => {
                            setShowPayment(!showPayment);
                            setShowFileUpload(false);
                        }}
                        disabled={disabled}
                        style={{
                            padding: '0.625rem',
                            borderRadius: '0.5rem',
                            background: showPayment ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                            border: showPayment ? '1px solid rgba(99, 102, 241, 0.3)' : 'none',
                            color: showPayment ? '#818cf8' : 'rgba(255, 255, 255, 0.6)',
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            opacity: disabled ? 0.5 : 1,
                        }}
                        onMouseEnter={(e) => !disabled && !showPayment && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
                        onMouseLeave={(e) => !disabled && !showPayment && (e.currentTarget.style.background = 'transparent')}
                    >
                        <Coins style={{ width: '1rem', height: '1rem' }} />
                    </button>
                </div>

                <div style={{ flex: 1, borderRadius: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '0.75rem' }}>
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={disabled || isSending}
                        placeholder={placeholder}
                        rows={1}
                        style={{
                            width: '100%',
                            resize: 'none',
                            background: 'transparent',
                            fontSize: '0.875rem',
                            color: '#ffffff',
                            border: 'none',
                            outline: 'none',
                            minHeight: '24px',
                            maxHeight: '120px',
                        }}
                    />
                </div>

                <button
                    onClick={handleSend}
                    disabled={(!input.trim() && !ipfsHash) || isSending || disabled}
                    style={{
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        background: '#6366f1',
                        border: 'none',
                        color: '#ffffff',
                        cursor: (!input.trim() && !ipfsHash) || isSending || disabled ? 'not-allowed' : 'pointer',
                        opacity: (!input.trim() && !ipfsHash) || isSending || disabled ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                        if (!(!input.trim() && !ipfsHash) && !isSending && !disabled) {
                            e.currentTarget.style.background = '#4f46e5';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!(!input.trim() && !ipfsHash) && !isSending && !disabled) {
                            e.currentTarget.style.background = '#6366f1';
                        }
                    }}
                >
                    {isSending ? (
                        <Loader2 style={{ width: '1.25rem', height: '1.25rem', animation: 'spin 1s linear infinite' }} />
                    ) : (
                        <Send style={{ width: '1.25rem', height: '1.25rem' }} />
                    )}
                </button>
            </div>
        </div>
    );
}
