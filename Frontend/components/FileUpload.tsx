'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X, Image, Video, Music, FileText, AlertCircle } from 'lucide-react';
import { getMediaTypeFromFile } from '@/lib/ipfs';

const MAX_FILE_SIZE = 50000000;

type FileUploadProps = {
    onFileSelected?: (file: File) => void;
    onCancel?: () => void;
    selectedFile?: File | null;
};

export function FileUpload({ onFileSelected, onCancel, selectedFile: externalFile }: FileUploadProps) {
    const [file, setFile] = useState<File | null>(externalFile || null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        if (type.startsWith('image/')) return <Image style={{ width: '1.25rem', height: '1.25rem', color: 'color-mix(in srgb, var(--fg) 70%, transparent)' }} />;
        if (type.startsWith('video/')) return <Video style={{ width: '1.25rem', height: '1.25rem', color: 'color-mix(in srgb, var(--fg) 70%, transparent)' }} />;
        if (type.startsWith('audio/')) return <Music style={{ width: '1.25rem', height: '1.25rem', color: 'color-mix(in srgb, var(--fg) 70%, transparent)' }} />;
        return <FileText style={{ width: '1.25rem', height: '1.25rem', color: 'color-mix(in srgb, var(--fg) 70%, transparent)' }} />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    };

    return (
        <div
            style={{
                borderRadius: '0.875rem',
                border: '1px solid color-mix(in srgb, var(--fg) 8%, transparent)',
                background: 'var(--surface)',
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
                        borderRadius: '0.875rem',
                        border: '2px dashed color-mix(in srgb, var(--fg) 10%, transparent)',
                        padding: '2rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--fg) 20%, transparent)';
                        e.currentTarget.style.background = 'color-mix(in srgb, var(--fg) 2%, transparent)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--fg) 10%, transparent)';
                        e.currentTarget.style.background = 'transparent';
                    }}
                >
                    <Upload style={{ width: '2rem', height: '2rem', color: 'color-mix(in srgb, var(--fg) 50%, transparent)' }} />
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--fg)', marginBottom: '0.25rem' }}>
                            Click to upload file
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'color-mix(in srgb, var(--fg) 50%, transparent)' }}>
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
                            borderRadius: '0.875rem',
                            border: '1px solid color-mix(in srgb, var(--fg) 8%, transparent)',
                            background: 'color-mix(in srgb, var(--fg) 3%, transparent)',
                            padding: '0.75rem',
                        }}
                    >
                        {getFileIcon(file)}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                                style={{
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: 'var(--fg)',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {file.name}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: 'color-mix(in srgb, var(--fg) 50%, transparent)' }}>
                                {formatFileSize(file.size)}
                            </p>
                        </div>
                        <button
                            onClick={() => setFile(null)}
                            style={{
                                borderRadius: '0.875rem',
                                padding: '0.375rem',
                                background: 'transparent',
                                border: '1px solid color-mix(in srgb, var(--fg) 10%, transparent)',
                                color: 'color-mix(in srgb, var(--fg) 70%, transparent)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'color-mix(in srgb, var(--fg) 5%, transparent)';
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
                                borderRadius: '0.875rem',
                                background: 'color-mix(in srgb, var(--bad) 10%, transparent)',
                                border: '1px solid color-mix(in srgb, var(--bad) 20%, transparent)',
                            }}
                        >
                            <AlertCircle style={{ width: '1rem', height: '1rem', color: 'var(--bad)', flexShrink: 0 }} />
                            <p style={{ fontSize: '0.75rem', color: 'var(--bad)' }}>{error}</p>
                        </div>
                    )}

                    <p style={{ fontSize: '0.75rem', color: 'color-mix(in srgb, var(--fg) 50%, transparent)', textAlign: 'center', marginTop: '0.5rem' }}>
                        File will be uploaded when you send the message
                    </p>
                </div>
            )}
        </div>
    );
}
