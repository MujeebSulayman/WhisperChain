'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image, Video, Music, FileText, Loader2, AlertCircle } from 'lucide-react';
import { uploadToIPFS, getMediaTypeFromFile } from '@WhisperChain/lib/ipfs';
import { isIPFSHashUsed } from '@WhisperChain/lib/whisperchainActions';

// Contract constant
const MAX_FILE_SIZE = 50000000; // 50MB

type FileUploadProps = {
    onUploadComplete: (ipfsHash: string, mediaType: number, fileSize: bigint) => void;
    onCancel?: () => void;
};

export function FileUpload({ onUploadComplete, onCancel }: FileUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (selectedFile.size > MAX_FILE_SIZE) {
            setError(`File size exceeds ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB limit (contract limit)`);
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
        if (type.startsWith('image/')) return <Image style={{ width: '1.25rem', height: '1.25rem', color: 'rgba(255, 255, 255, 0.7)' }} />;
        if (type.startsWith('video/')) return <Video style={{ width: '1.25rem', height: '1.25rem', color: 'rgba(255, 255, 255, 0.7)' }} />;
        if (type.startsWith('audio/')) return <Music style={{ width: '1.25rem', height: '1.25rem', color: 'rgba(255, 255, 255, 0.7)' }} />;
        return <FileText style={{ width: '1.25rem', height: '1.25rem', color: 'rgba(255, 255, 255, 0.7)' }} />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    };

    return (
        <div
            style={{
                borderRadius: '0.5rem',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(26, 26, 26, 0.95)',
                padding: '1rem',
                backdropFilter: 'blur(10px)',
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
                        border: '2px dashed rgba(255, 255, 255, 0.1)',
                        padding: '2rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.background = 'transparent';
                    }}
                >
                    <Upload style={{ width: '2rem', height: '2rem', color: 'rgba(255, 255, 255, 0.5)' }} />
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#ffffff', marginBottom: '0.25rem' }}>
                            Click to upload file
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                            Max size: {(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB (contract limit)
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
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            background: 'rgba(255, 255, 255, 0.03)',
                            padding: '0.75rem',
                        }}
                    >
                        {getFileIcon(file)}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                                style={{
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: '#ffffff',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {file.name}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                                {formatFileSize(file.size)}
                            </p>
                        </div>
                        <button
                            onClick={() => setFile(null)}
                            style={{
                                borderRadius: '0.5rem',
                                padding: '0.375rem',
                                background: 'transparent',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: 'rgba(255, 255, 255, 0.7)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
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
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                            }}
                        >
                            <AlertCircle style={{ width: '1rem', height: '1rem', color: '#f87171', flexShrink: 0 }} />
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
                                background: '#ffffff',
                                border: 'none',
                                padding: '0.75rem 1rem',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: '#0f0f0f',
                                cursor: isUploading ? 'not-allowed' : 'pointer',
                                opacity: isUploading ? 0.6 : 1,
                                transition: 'opacity 0.2s',
                            }}
                        >
                            {isUploading ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />
                                    <span>Uploading...</span>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <Upload style={{ width: '1rem', height: '1rem' }} />
                                    <span>Upload to IPFS</span>
                                </div>
                            )}
                        </button>
                        {onCancel && (
                            <button
                                onClick={onCancel}
                                disabled={isUploading}
                                style={{
                                    borderRadius: '0.5rem',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    background: 'transparent',
                                    padding: '0.75rem 1rem',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    cursor: isUploading ? 'not-allowed' : 'pointer',
                                    opacity: isUploading ? 0.5 : 1,
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isUploading) {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                        e.currentTarget.style.color = '#ffffff';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isUploading) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                                    }
                                }}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
