'use client';

import { Send, Paperclip, Loader2, Coins, X, Image, Video, Music, FileText, Zap } from 'lucide-react';
import { isGaslessConfigured } from '@WhisperChain/lib/gasless';
import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { FileUpload } from './FileUpload';
import { PaymentOptions } from './PaymentOptions';
import { uploadToIPFS, getMediaTypeFromFile } from '@WhisperChain/lib/ipfs';
import { isIPFSHashUsed } from '@WhisperChain/lib/whisperchainActions';
import { formatTokenAmount } from '@WhisperChain/lib/token';
import { ZeroAddress } from 'ethers';
import { useIsMobile } from '../hooks/useMediaQuery';
import { useTokenInfo } from '../hooks/useTokenInfo';
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
    placeholder = 'Write a message…',
}: MessageInputProps) {
    const isMobile = useIsMobile();
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [showFileUpload, setShowFileUpload] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<BigNumberish | undefined>();
    const [paymentToken, setPaymentToken] = useState<AddressLike | undefined>();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const paymentTokenStr = paymentToken != null ? String(paymentToken) : ZeroAddress;
    const paymentTokenInfo = useTokenInfo(paymentTokenStr);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [input]);

    const handleSend = async () => {
        if ((!input.trim() && !selectedFile) || isSending || disabled) return;

        const message = input.trim() || (selectedFile ? 'Media message' : '');
        const currentInput = input;
        const currentFile = selectedFile;
        setInput('');
        setSelectedFile(null);
        setIsSending(true);

        try {
            let ipfsHash: string | undefined;
            let mediaType: number | undefined;
            let fileSize: bigint | undefined;

            if (currentFile) {
                try {
                    ipfsHash = await uploadToIPFS(currentFile, currentFile.name, async (hash) => {
                        try {
                            return await isIPFSHashUsed(hash);
                        } catch {
                            return false;
                        }
                    });
                    mediaType = getMediaTypeFromFile(currentFile);
                    fileSize = BigInt(currentFile.size);
                } catch (uploadError: any) {
                    console.error('File upload failed:', uploadError);
                    setInput(currentInput);
                    setSelectedFile(currentFile);
                    setIsSending(false);
                    throw new Error(`File upload failed: ${uploadError.message || 'Unknown error'}`);
                }
            }

            await onSend({
                text: message,
                ipfsHash,
                mediaType,
                fileSize,
                paymentAmount,
                paymentToken,
            });
            setPaymentAmount(undefined);
            setPaymentToken(undefined);
        } catch (error) {
            console.error('Failed to send message:', error);
            setInput(currentInput);
            if (currentFile) {
                setSelectedFile(currentFile);
            }
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

    const handleFileSelected = (file: File) => {
        setSelectedFile(file);
        setShowFileUpload(false);
    };

    const getFileIcon = (file: File) => {
        const type = file.type.toLowerCase();
        if (type.startsWith('image/')) return <Image style={{ width: '1rem', height: '1rem' }} />;
        if (type.startsWith('video/')) return <Video style={{ width: '1rem', height: '1rem' }} />;
        if (type.startsWith('audio/')) return <Music style={{ width: '1rem', height: '1rem' }} />;
        return <FileText style={{ width: '1rem', height: '1rem' }} />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    };


    const canSend = Boolean(input.trim() || selectedFile) && !isSending && !disabled;
    const chip = 'flex items-center gap-2 rounded-full py-1.5 pl-3 pr-1.5 text-[12px]';

    return (
        <div className="relative z-10 shrink-0 px-3 pb-3 pt-2 md:px-5 md:pb-4">
            {(showFileUpload || showPayment) && (
                <div className="mb-3">
                    {showFileUpload && (
                        <FileUpload
                            onFileSelected={handleFileSelected}
                            onCancel={() => setShowFileUpload(false)}
                            selectedFile={selectedFile}
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

            {(selectedFile || paymentAmount) && (
                <div className="mb-3 flex flex-wrap items-center gap-2">
                    {selectedFile && (
                        <div className={`${chip} inset-panel`}>
                            <span className="text-accent">{getFileIcon(selectedFile)}</span>
                            <span className="max-w-[14rem] truncate font-medium">{selectedFile.name}</span>
                            <span className="font-mono text-[11px] text-mute">{formatFileSize(selectedFile.size)}</span>
                            <button onClick={() => setSelectedFile(null)} className="icon-btn h-6! w-6!" aria-label="Remove file">
                                <X size={13} strokeWidth={2} />
                            </button>
                        </div>
                    )}
                    {paymentAmount && (
                        <div className={`${chip} pill-accent`}>
                            <Coins size={14} strokeWidth={1.8} />
                            <span className="font-semibold">
                                {paymentTokenInfo.loading ? '…' : formatTokenAmount(BigInt(paymentAmount ?? 0), paymentTokenInfo.decimals)}{' '}
                                {paymentTokenStr === ZeroAddress ? 'Base ETH' : paymentTokenInfo.symbol}
                            </span>
                            <button
                                onClick={() => {
                                    setPaymentAmount(undefined);
                                    setPaymentToken(undefined);
                                }}
                                className="icon-btn h-6! w-6!"
                                aria-label="Remove payment"
                            >
                                <X size={13} strokeWidth={2} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="mx-auto max-w-3xl">
            <div className="card flex items-end gap-1 !rounded-[28px] p-2 pl-2.5">
                <button
                    onClick={() => {
                        setShowFileUpload(!showFileUpload);
                        setShowPayment(false);
                    }}
                    disabled={disabled}
                    className={`icon-btn ${showFileUpload ? 'is-on' : ''}`}
                    title="Attach file"
                    aria-label="Attach file"
                >
                    <Paperclip size={18} strokeWidth={1.8} />
                </button>
                <button
                    onClick={() => {
                        setShowPayment(!showPayment);
                        setShowFileUpload(false);
                    }}
                    disabled={disabled}
                    className={`icon-btn ${showPayment ? 'is-on' : ''}`}
                    title="Add payment"
                    aria-label="Add payment"
                >
                    <Coins size={18} strokeWidth={1.8} />
                </button>

                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled || isSending}
                    placeholder={disabled ? 'Connect and register to send messages' : placeholder}
                    rows={1}
                    className="max-h-[120px] min-h-[40px] flex-1 resize-none bg-transparent px-2 py-[9px] text-[15px] leading-normal text-fg outline-none placeholder:text-mute disabled:cursor-not-allowed"
                />

                {isGaslessConfigured() && !isMobile && (
                    <span className="pill pill-accent mb-1.5 mr-1 h-7! px-3! text-[12px]">
                        <Zap size={12} strokeWidth={2} />
                        Gasless
                    </span>
                )}

                <button onClick={handleSend} disabled={!canSend} className="btn btn-accent shrink-0 !h-10 !px-4" aria-label="Send message">
                    {isSending ? <Loader2 size={17} className="animate-spin" /> : <Send size={16} strokeWidth={2} />}
                    <span className="hidden sm:inline">{isSending ? 'Sending' : 'Send'}</span>
                </button>
            </div>
            <p className="mt-2.5 text-center text-[11px] text-mute">Enter to send · Shift + Enter for a new line</p>
            </div>
        </div>
    );
}
