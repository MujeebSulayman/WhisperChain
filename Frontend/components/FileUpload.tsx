'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image, Video, Music, FileText, Loader2 } from 'lucide-react';
import { uploadToIPFS, getMediaTypeFromFile } from '@WhisperChain/lib/ipfs';
import { isIPFSHashUsed } from '@WhisperChain/lib/whisperchainActions';

type FileUploadProps = {
    onUploadComplete: (ipfsHash: string, mediaType: number, fileSize: bigint) => void;
    onCancel?: () => void;
    maxSize?: number;
};

export function FileUpload({ onUploadComplete, onCancel, maxSize = 50 * 1024 * 1024 }: FileUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (selectedFile.size > maxSize) {
            setError(`File size exceeds ${(maxSize / 1024 / 1024).toFixed(0)}MB limit`);
            return;
        }

        setFile(selectedFile);
        setError(null);
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setError(null);

        try {
            const ipfsHash = await uploadToIPFS(file, file.name, async (hash) => {
                try {
                    return await isIPFSHashUsed(hash);
                } catch {
                    return false;
                }
            });
            const mediaType = getMediaTypeFromFile(file);
            const fileSize = BigInt(file.size);

            onUploadComplete(ipfsHash, mediaType, fileSize);
            setFile(null);
        } catch (err: any) {
            setError(err.message || 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const getFileIcon = (file: File) => {
        const type = file.type.toLowerCase();
        if (type.startsWith('image/')) return <Image style={{ width: '1.25rem', height: '1.25rem', color: '#00ffff' }} />;
        if (type.startsWith('video/')) return <Video style={{ width: '1.25rem', height: '1.25rem', color: '#ff00ff' }} />;
        if (type.startsWith('audio/')) return <Music style={{ width: '1.25rem', height: '1.25rem', color: '#8b00ff' }} />;
        return <FileText style={{ width: '1.25rem', height: '1.25rem', color: '#00ffff' }} />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    };

    return (
        <div
            style={{
                borderRadius: '0.75rem',
                border: '1px solid rgba(0, 255, 255, 0.2)',
                background: 'rgba(10, 10, 15, 0.95)',
                padding: '1rem',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.1)',
            }}
        >
            {!file ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '2px dashed rgba(0, 255, 255, 0.3)',
                        padding: '2rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.5)';
                        e.currentTarget.style.background = 'rgba(0, 255, 255, 0.05)';
                        e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.3)';
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    <Upload style={{ width: '2rem', height: '2rem', color: 'rgba(0, 255, 255, 0.6)' }} />
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#00ffff', marginBottom: '0.25rem' }}>
                            Click to upload file
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'rgba(0, 255, 255, 0.5)', fontFamily: 'monospace' }}>
                            Max size: {(maxSize / 1024 / 1024).toFixed(0)}MB
                        </p>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                    />
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            borderRadius: '0.5rem',
                            border: '1px solid rgba(0, 255, 255, 0.2)',
                            background: 'rgba(0, 255, 255, 0.05)',
                            padding: '0.75rem',
                        }}
                    >
                        {getFileIcon(file)}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                                style={{
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    color: '#00ffff',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {file.name}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: 'rgba(0, 255, 255, 0.5)', fontFamily: 'monospace' }}>
                                {formatFileSize(file.size)}
                            </p>
                        </div>
                        <button
                            onClick={() => setFile(null)}
                            style={{
                                borderRadius: '0.5rem',
                                padding: '0.375rem',
                                background: 'transparent',
                                border: '1px solid rgba(0, 255, 255, 0.3)',
                                color: '#00ffff',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            <X style={{ width: '1rem', height: '1rem' }} />
                        </button>
                    </div>

                    {error && (
                        <div
                            style={{
                                borderRadius: '0.5rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                padding: '0.75rem',
                            }}
                        >
                            <p style={{ fontSize: '0.75rem', color: '#fca5a5' }}>{error}</p>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={handleUpload}
                            disabled={isUploading}
                            style={{
                                flex: 1,
                                borderRadius: '0.5rem',
                                background: 'linear-gradient(135deg, #00ffff 0%, #8b00ff 100%)',
                                border: 'none',
                                padding: '0.75rem 1rem',
                                fontSize: '0.875rem',
                                fontWeight: 700,
                                color: '#0a0a0f',
                                cursor: isUploading ? 'not-allowed' : 'pointer',
                                opacity: isUploading ? 0.5 : 1,
                                boxShadow: '0 0 20px rgba(0, 255, 255, 0.4)',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                if (!isUploading) {
                                    e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 255, 255, 0.6)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isUploading) {
                                    e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.4)';
                                }
                            }}
                        >
                            {isUploading ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />
                                    <span>UPLOADING...</span>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <Upload style={{ width: '1rem', height: '1rem' }} />
                                    <span>UPLOAD TO IPFS</span>
                                </div>
                            )}
                        </button>
                        {onCancel && (
                            <button
                                onClick={onCancel}
                                disabled={isUploading}
                                style={{
                                    borderRadius: '0.5rem',
                                    border: '1px solid rgba(0, 255, 255, 0.3)',
                                    background: 'transparent',
                                    padding: '0.75rem 1rem',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: '#00ffff',
                                    cursor: isUploading ? 'not-allowed' : 'pointer',
                                    opacity: isUploading ? 0.5 : 1,
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isUploading) {
                                        e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isUploading) {
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}
                            >
                                CANCEL
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
