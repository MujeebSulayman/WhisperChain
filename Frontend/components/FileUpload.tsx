'use client';

import { useState, useRef } from 'react';
import { Upload, X, File, Image, Video, Music, FileText, Loader2 } from 'lucide-react';
import { uploadToIPFS, getMediaTypeFromFile, type MediaType } from '@WhisperChain/lib/ipfs';

type FileUploadProps = {
    onUploadComplete: (ipfsHash: string, mediaType: number, fileSize: bigint) => void;
    onCancel?: () => void;
    maxSize?: number;
};

export function FileUpload({ onUploadComplete, onCancel, maxSize = 50 * 1024 * 1024 }: FileUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
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
            const ipfsHash = await uploadToIPFS(file, file.name);
            const mediaType = getMediaTypeFromFile(file);
            const fileSize = BigInt(file.size);

            onUploadComplete(ipfsHash, mediaType, fileSize);
            setFile(null);
        } catch (err: any) {
            setError(err.message || 'Upload failed');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const getFileIcon = (file: File) => {
        const type = file.type.toLowerCase();
        if (type.startsWith('image/')) return <Image className="size-5 text-emerald-400" />;
        if (type.startsWith('video/')) return <Video className="size-5 text-violet-400" />;
        if (type.startsWith('audio/')) return <Music className="size-5 text-pink-400" />;
        return <FileText className="size-5 text-sky-400" />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    };

    return (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-4 backdrop-blur-sm">
            {!file ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-white/20 p-8 cursor-pointer transition-all hover:border-sky-500/50 hover:bg-slate-800/50"
                >
                    <Upload className="size-8 text-slate-400" />
                    <div className="text-center">
                        <p className="text-sm font-medium text-slate-300">Click to upload file</p>
                        <p className="text-xs text-slate-500 mt-1">
                            Max size: {(maxSize / 1024 / 1024).toFixed(0)}MB
                        </p>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                    />
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-800/50 p-3">
                        {getFileIcon(file)}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{file.name}</p>
                            <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                        </div>
                        <button
                            onClick={() => setFile(null)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                        >
                            <X className="size-4" />
                        </button>
                    </div>

                    {error && (
                        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
                            <p className="text-xs text-red-400">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={handleUpload}
                            disabled={isUploading}
                            className="flex-1 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all hover:from-sky-400 hover:to-sky-500 hover:shadow-xl hover:shadow-sky-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {isUploading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="size-4 animate-spin" />
                                    <span>Uploading...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <Upload className="size-4" />
                                    <span>Upload to IPFS</span>
                                </div>
                            )}
                        </button>
                        {onCancel && (
                            <button
                                onClick={onCancel}
                                disabled={isUploading}
                                className="rounded-xl border border-white/10 bg-slate-800/50 px-4 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-slate-800 hover:text-white disabled:opacity-50"
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

