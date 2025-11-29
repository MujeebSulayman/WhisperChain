'use client';

import { Send, Paperclip, Loader2, Coins, X, Image, Video, Music, FileText } from 'lucide-react';
import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { FileUpload } from './FileUpload';
import { PaymentOptions } from './PaymentOptions';
import { uploadToIPFS, getMediaTypeFromFile } from '@WhisperChain/lib/ipfs';
import { isIPFSHashUsed } from '@WhisperChain/lib/whisperchainActions';
import { formatEther } from 'ethers';
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
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

            // Upload file if selected
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

    return (
        <div
            style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                background: '#1a1a1a',
                padding: '1rem',
            }}
        >
            {(showFileUpload || showPayment) && (
                <div style={{ marginBottom: '1rem' }}>
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
                <div
                    style={{
                        marginBottom: '0.75rem',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}
                >
                    {selectedFile && (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '0.5rem',
                                background: 'rgba(99, 102, 241, 0.1)',
                                border: '1px solid rgba(99, 102, 241, 0.2)',
                            }}
                        >
                            {getFileIcon(selectedFile)}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                                <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 500 }}>
                                    {selectedFile.name}
                                </span>
                                <span style={{ fontSize: '0.6875rem', color: 'rgba(255, 255, 255, 0.6)', fontFamily: 'monospace' }}>
                                    {formatFileSize(selectedFile.size)}
                                </span>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedFile(null);
                                }}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    cursor: 'pointer',
                                    padding: 0,
                                    transition: 'color 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = '#ef4444';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                                }}
                            >
                                <X style={{ width: '0.875rem', height: '0.875rem' }} />
                            </button>
                        </div>
                    )}
                    {paymentAmount && (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '0.5rem',
                                background: 'rgba(245, 158, 11, 0.1)',
                                border: '1px solid rgba(245, 158, 11, 0.2)',
                            }}
                        >
                            <Coins style={{ width: '1rem', height: '1rem', color: '#fbbf24' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                                <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 500 }}>
                                    {formatEther(paymentAmount)} ETH
                                </span>
                                {paymentToken && paymentToken !== '0x0000000000000000000000000000000000000000' && (
                                    <span style={{ fontSize: '0.6875rem', color: 'rgba(255, 255, 255, 0.6)', fontFamily: 'monospace' }}>
                                        Token: {String(paymentToken).slice(0, 6)}...{String(paymentToken).slice(-4)}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => {
                                    setPaymentAmount(undefined);
                                    setPaymentToken(undefined);
                                }}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    cursor: 'pointer',
                                    padding: 0,
                                    transition: 'color 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = '#ef4444';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                                }}
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
                            background: showFileUpload ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                            border: `1px solid ${showFileUpload ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)'}`,
                            color: showFileUpload ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            opacity: disabled ? 0.5 : 1,
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            if (!disabled && !showFileUpload) {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!disabled && !showFileUpload) {
                                e.currentTarget.style.background = 'transparent';
                            }
                        }}
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
                            background: showPayment ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                            border: `1px solid ${showPayment ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)'}`,
                            color: showPayment ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            opacity: disabled ? 0.5 : 1,
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            if (!disabled && !showPayment) {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!disabled && !showPayment) {
                                e.currentTarget.style.background = 'transparent';
                            }
                        }}
                    >
                        <Coins style={{ width: '1rem', height: '1rem' }} />
                    </button>
                </div>

                <div
                    style={{
                        flex: 1,
                        borderRadius: '0.5rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        padding: '0.75rem',
                    }}
                >
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
                    disabled={(!input.trim() && !selectedFile) || isSending || disabled}
                    style={{
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        background: '#ffffff',
                        border: 'none',
                        color: '#0f0f0f',
                        cursor: (!input.trim() && !selectedFile) || isSending || disabled ? 'not-allowed' : 'pointer',
                        opacity: (!input.trim() && !selectedFile) || isSending || disabled ? 0.6 : 1,
                        transition: 'opacity 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}
                >
                    {isSending ? (
                        <>
                            <Loader2 style={{ width: '1.25rem', height: '1.25rem', animation: 'spin 1s linear infinite' }} />
                            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                {selectedFile ? 'Uploading & Sending...' : 'Sending...'}
                            </span>
                        </>
                    ) : (
                        <>
                            <Send style={{ width: '1.25rem', height: '1.25rem' }} />
                            {(selectedFile || paymentAmount) && (
                                <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                                    {selectedFile && paymentAmount ? 'Send All' : selectedFile ? 'Send File' : 'Send Payment'}
                                </span>
                            )}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
