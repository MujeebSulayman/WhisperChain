'use client';

import { Send, Paperclip, Loader2, Coins, X, Image, Video, Music, FileText } from 'lucide-react';
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
    placeholder = 'Type a message...',
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

    return (
        <div
            style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                background: 'linear-gradient(180deg, rgba(12, 12, 14, 0.6) 0%, rgba(10, 10, 12, 0.95) 100%)',
                backdropFilter: 'blur(16px)',
                padding: isMobile ? '0.875rem 0.75rem' : '1rem 1.5rem 1.25rem',
                position: 'sticky',
                bottom: 0,
                zIndex: 10,
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
                        marginBottom: '0.875rem',
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
                                padding: '0.5rem 0.875rem',
                                borderRadius: '9999px',
                                background: 'rgba(99, 102, 241, 0.08)',
                                border: '1px solid rgba(99, 102, 241, 0.15)',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.15)',
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
                                padding: '0.5rem 0.875rem',
                                borderRadius: '9999px',
                                background: 'rgba(245, 158, 11, 0.08)',
                                border: '1px solid rgba(245, 158, 11, 0.15)',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.15)',
                            }}
                        >
                            <Coins style={{ width: '1rem', height: '1rem', color: '#fbbf24' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                                <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 500 }}>
                                    {paymentTokenInfo.loading ? '...' : formatTokenAmount(BigInt(paymentAmount ?? 0), paymentTokenInfo.decimals)}{' '}
                                    {paymentTokenStr === ZeroAddress ? 'Base ETH' : paymentTokenInfo.symbol}
                                </span>
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

            <div
                className="message-input-bar"
                style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '0.625rem',
                    borderRadius: '9999px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    padding: isMobile ? '0.375rem 0.5rem 0.375rem 0.875rem' : '0.5rem 0.625rem 0.5rem 1rem',
                }}
            >
                <button
                    onClick={() => {
                        setShowFileUpload(!showFileUpload);
                        setShowPayment(false);
                    }}
                    disabled={disabled}
                    style={{
                        padding: '0.5rem',
                        borderRadius: '50%',
                        background: showFileUpload ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                        border: 'none',
                        color: showFileUpload ? '#a5b4fc' : 'rgba(255, 255, 255, 0.55)',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        opacity: disabled ? 0.5 : 1,
                        transition: 'all 0.2s',
                        width: isMobile ? '2.5rem' : '2.75rem',
                        height: isMobile ? '2.5rem' : '2.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        touchAction: 'manipulation',
                    }}
                    onMouseEnter={(e) => {
                        if (!isMobile && !disabled && !showFileUpload) {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.color = '#ffffff';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isMobile && !disabled && !showFileUpload) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                        }
                    }}
                    onTouchStart={(e) => {
                        if (!disabled) {
                            e.currentTarget.style.background = showFileUpload ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.1)';
                        }
                    }}
                    onTouchEnd={(e) => {
                        if (!disabled) {
                            e.currentTarget.style.background = showFileUpload ? 'rgba(99, 102, 241, 0.15)' : 'transparent';
                        }
                    }}
                    title="Attach file"
                >
                    <Paperclip style={{ width: isMobile ? '1.25rem' : '1.125rem', height: isMobile ? '1.25rem' : '1.125rem' }} />
                </button>
                <button
                    onClick={() => {
                        setShowPayment(!showPayment);
                        setShowFileUpload(false);
                    }}
                    disabled={disabled}
                    style={{
                        padding: '0.5rem',
                        borderRadius: '50%',
                        background: showPayment ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                        border: 'none',
                        color: showPayment ? '#fbbf24' : 'rgba(255, 255, 255, 0.55)',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        opacity: disabled ? 0.5 : 1,
                        transition: 'all 0.2s',
                        width: isMobile ? '2.5rem' : '2.75rem',
                        height: isMobile ? '2.5rem' : '2.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        touchAction: 'manipulation',
                    }}
                    onMouseEnter={(e) => {
                        if (!isMobile && !disabled && !showPayment) {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.color = '#fbbf24';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isMobile && !disabled && !showPayment) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                        }
                    }}
                    onTouchStart={(e) => {
                        if (!disabled) {
                            e.currentTarget.style.background = showPayment ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.1)';
                        }
                    }}
                    onTouchEnd={(e) => {
                        if (!disabled) {
                            e.currentTarget.style.background = showPayment ? 'rgba(245, 158, 11, 0.15)' : 'transparent';
                        }
                    }}
                    title="Add payment"
                >
                    <Coins style={{ width: isMobile ? '1.25rem' : '1.125rem', height: isMobile ? '1.25rem' : '1.125rem' }} />
                </button>

                <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
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
                            fontSize: isMobile ? '0.875rem' : '0.9375rem',
                            color: '#ffffff',
                            border: 'none',
                            outline: 'none',
                            minHeight: isMobile ? '20px' : '24px',
                            maxHeight: isMobile ? '100px' : '120px',
                            lineHeight: '1.5',
                            padding: '0.125rem 0',
                            margin: 0,
                        }}
                    />
                </div>

                <button
                    onClick={handleSend}
                    disabled={(!input.trim() && !selectedFile) || isSending || disabled}
                    style={{
                        padding: '0.5rem',
                        borderRadius: '50%',
                        background: (!input.trim() && !selectedFile) || isSending || disabled
                            ? 'rgba(99, 102, 241, 0.15)'
                            : 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                        border: 'none',
                        color: '#ffffff',
                        cursor: (!input.trim() && !selectedFile) || isSending || disabled ? 'not-allowed' : 'pointer',
                        opacity: (!input.trim() && !selectedFile) || isSending || disabled ? 0.5 : 1,
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: isMobile ? '2.5rem' : '2.75rem',
                        height: isMobile ? '2.5rem' : '2.75rem',
                        flexShrink: 0,
                        boxShadow: (!input.trim() && !selectedFile) || isSending || disabled
                            ? 'none'
                            : '0 2px 10px rgba(99, 102, 241, 0.35), 0 1px 2px rgba(0, 0, 0, 0.2)',
                        touchAction: 'manipulation',
                    }}
                    onMouseEnter={(e) => {
                        if (!isMobile && !((!input.trim() && !selectedFile) || isSending || disabled)) {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.4)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isMobile) {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = (!input.trim() && !selectedFile) || isSending || disabled
                                ? 'none'
                                : '0 4px 12px rgba(99, 102, 241, 0.3)';
                        }
                    }}
                    onTouchStart={(e) => {
                        if (!((!input.trim() && !selectedFile) || isSending || disabled)) {
                            e.currentTarget.style.transform = 'scale(0.95)';
                        }
                    }}
                    onTouchEnd={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    {isSending ? (
                        <Loader2 style={{ width: isMobile ? '1.125rem' : '1.25rem', height: isMobile ? '1.125rem' : '1.25rem', animation: 'spin 1s linear infinite' }} />
                    ) : (
                        <Send style={{ width: isMobile ? '1.125rem' : '1.25rem', height: isMobile ? '1.125rem' : '1.25rem' }} />
                    )}
                </button>
            </div>
        </div>
    );
}
