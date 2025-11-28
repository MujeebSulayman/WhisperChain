'use client';

import { Send, Paperclip, Loader2, Sparkles, Coins, X } from 'lucide-react';
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
    const [isFocused, setIsFocused] = useState(false);
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
        <div className="border-t border-white/5 bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-sm p-4 shadow-2xl">
            {(showFileUpload || showPayment) && (
                <div className="mb-4 animate-in fade-in slide-in-from-bottom-2">
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
                <div className="mb-3 flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                    {ipfsHash && (
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5">
                            <span className="text-xs font-medium text-emerald-300">File: {ipfsHash.slice(0, 12)}...</span>
                            <button
                                onClick={() => {
                                    setIpfsHash(null);
                                    setMediaType(0);
                                    setFileSize(BigInt(0));
                                }}
                                className="text-emerald-400 hover:text-emerald-300"
                            >
                                <X className="size-3" />
                            </button>
                        </div>
                    )}
                    {paymentAmount && (
                        <div className="flex items-center gap-2 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-1.5">
                            <span className="text-xs font-medium text-sky-300">
                                Payment: {paymentAmount.toString()} wei
                            </span>
                            <button
                                onClick={() => {
                                    setPaymentAmount(undefined);
                                    setPaymentToken(undefined);
                                }}
                                className="text-sky-400 hover:text-sky-300"
                            >
                                <X className="size-3" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="mx-auto flex max-w-4xl items-end gap-3">
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setShowFileUpload(!showFileUpload);
                            setShowPayment(false);
                        }}
                        disabled={disabled}
                        className={`group relative rounded-xl border p-3 transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${showFileUpload
                                ? 'border-sky-500/50 bg-sky-500/10 text-sky-300'
                                : 'border-white/10 bg-slate-800/50 text-slate-400 hover:border-sky-500/50 hover:bg-sky-500/10 hover:text-sky-300'
                            }`}
                        title="Attach file"
                    >
                        <Paperclip className="size-4 transition-transform group-hover:rotate-12" />
                    </button>
                    <button
                        onClick={() => {
                            setShowPayment(!showPayment);
                            setShowFileUpload(false);
                        }}
                        disabled={disabled}
                        className={`group relative rounded-xl border p-3 transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${showPayment
                                ? 'border-sky-500/50 bg-sky-500/10 text-sky-300'
                                : 'border-white/10 bg-slate-800/50 text-slate-400 hover:border-sky-500/50 hover:bg-sky-500/10 hover:text-sky-300'
                            }`}
                        title="Add payment"
                    >
                        <Coins className="size-4" />
                    </button>
                </div>

                <div
                    className={`group relative flex-1 rounded-2xl border bg-slate-800/50 p-3 transition-all duration-300 ${isFocused
                            ? 'border-sky-500/50 bg-slate-800 shadow-lg shadow-sky-500/10'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                >
                    {isFocused && (
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-sky-500/0 via-sky-500/5 to-sky-500/0 animate-shimmer pointer-events-none" />
                    )}
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        disabled={disabled || isSending}
                        placeholder={placeholder}
                        rows={1}
                        className="relative w-full resize-none bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none transition-all duration-300"
                        style={{
                            minHeight: '24px',
                            maxHeight: '120px',
                        }}
                    />
                </div>

                <button
                    onClick={handleSend}
                    disabled={(!input.trim() && !ipfsHash) || isSending || disabled}
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 p-3 text-white shadow-lg shadow-sky-500/30 transition-all duration-300 hover:from-sky-400 hover:to-sky-500 hover:shadow-xl hover:shadow-sky-500/40 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    title="Send message"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    {isSending ? (
                        <Loader2 className="relative size-5 animate-spin" />
                    ) : (
                        <Send className="relative size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    )}
                </button>
            </div>
            {input.trim() && (
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 animate-in fade-in slide-in-from-bottom-2">
                    <Sparkles className="size-3 animate-pulse" />
                    <span>Press Enter to send, Shift+Enter for new line</span>
                </div>
            )}
        </div>
    );
}
