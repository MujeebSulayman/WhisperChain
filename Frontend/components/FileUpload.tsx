'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X, Image, Video, Music, FileText, AlertCircle } from 'lucide-react';
import { getMediaTypeFromFile } from '@WhisperChain/lib/ipfs';

// Contract constant
const MAX_FILE_SIZE = 50000000; // 50MB

type FileUploadProps = {
    onFileSelected?: (file: File) => void;
    onCancel?: () => void;
    selectedFile?: File | null;
};

export function FileUpload({ onFileSelected, onCancel, selectedFile: externalFile }: FileUploadProps) {
    const [file, setFile] = useState<File | null>(externalFile || null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync with external file prop
    useEffect(() => {
        if (externalFile !== undefined) {
            setFile(externalFile);
        }
    }, [externalFile]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (selectedFile.size > MAX_FILE_SIZE) {
            setError(`File size exceeds ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB limit (contract limit)`);
            return;
        }

        setFile(selectedFile);
        setError(null);
        onFileSelected?.(selectedFile);
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

                    <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', marginTop: '0.5rem' }}>
                        File will be uploaded when you send the message
                    </p>
                </div>
            )}
        </div>
    );
}
