'use client';

import { useState, useEffect } from 'react';
import { WalletConnect } from './WalletConnect';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ThreadList } from './ThreadList';
import { MessageSquarePlus, Sparkles, Loader2 } from 'lucide-react';
import {
    sendWhisper,
    waitForTransaction,
    fetchUserMessages,
} from '@WhisperChain/lib/whisperchainActions';
import { getExplorerUrl, WHISPERCHAIN_ADDRESS } from '@WhisperChain/lib/blockchain';
import Link from 'next/link';

type Message = {
    id: string;
    author: string;
    role?: string;
    timestamp: number | string;
    body: string;
    isSelf: boolean;
    status: 'pending' | 'delivered' | 'read';
    messageHash?: string;
};

type Thread = {
    id: string;
    title: string;
    subtitle?: string;
    unreadCount?: number;
    lastMessage: string;
    timestamp: string;
    participants?: string[];
};

type ChatContainerProps = {
    initialThreads?: Thread[];
    initialMessages?: Record<string, Message[]>;
};

export function ChatContainer({
    initialThreads = [],
    initialMessages = {},
}: ChatContainerProps) {
    const [connectedAddress, setConnectedAddress] = useState<string>();
    const [activeThreadId, setActiveThreadId] = useState<string>(
        initialThreads[0]?.id ?? ''
    );
    const [messages, setMessages] = useState<Record<string, Message[]>>(
        initialMessages
    );
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const activeMessages = messages[activeThreadId] ?? [];

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleSendMessage = async (text: string) => {
        if (!connectedAddress) {
            setError('Please connect your wallet first');
            throw new Error('Wallet not connected');
        }

        if (!activeThreadId) {
            setError('Please select a conversation');
            throw new Error('No active thread');
        }

        setError(null);

        const messageHash = new TextEncoder()
            .encode(text)
            .reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '');

        const pendingMessage: Message = {
            id: `pending-${Date.now()}`,
            author: 'You',
            timestamp: Math.floor(Date.now() / 1000),
            body: text,
            isSelf: true,
            status: 'pending',
            messageHash: `0x${messageHash.slice(0, 64)}`,
        };

        setMessages((prev) => ({
            ...prev,
            [activeThreadId]: [...(prev[activeThreadId] ?? []), pendingMessage],
        }));

        try {
            const tx = await sendWhisper({
                recipient: activeThreadId,
                messageHash: `0x${messageHash.slice(0, 64)}`,
                ipfsHash: `ipfs-${Date.now()}`,
                mediaType: 0,
                fileSize: BigInt(text.length),
            });

            const receipt = await waitForTransaction(tx);

            setMessages((prev) => {
                const updated = [...(prev[activeThreadId] ?? [])];
                const idx = updated.findIndex((m) => m.id === pendingMessage.id);
                if (idx >= 0) {
                    updated[idx] = {
                        ...updated[idx],
                        status: 'delivered',
                        messageHash: receipt.hash,
                    };
                }
                return { ...prev, [activeThreadId]: updated };
            });
        } catch (error: any) {
            setError(error.message || 'Failed to send message');
            setMessages((prev) => {
                const updated = [...(prev[activeThreadId] ?? [])];
                const idx = updated.findIndex((m) => m.id === pendingMessage.id);
                if (idx >= 0) {
                    updated[idx] = {
                        ...updated[idx],
                        status: 'failed' as any,
                    };
                }
                return { ...prev, [activeThreadId]: updated };
            });
            throw error;
        }
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 overflow-hidden">
            <aside className="w-80 border-r border-white/5 bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-sm p-6 flex flex-col shadow-2xl">
                <div className="mb-6 animate-in fade-in slide-in-from-top-2">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                                WhisperChain
                            </p>
                            <h1 className="text-xl font-bold text-white bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
                                Messages
                            </h1>
                        </div>
                    </div>

                    <WalletConnect
                        connectedAddress={connectedAddress}
                        onConnect={setConnectedAddress}
                    />
                </div>

                <button className="group mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 border border-white/10 px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:from-white/20 hover:to-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-[0.98] shadow-lg">
                    <MessageSquarePlus className="size-4 transition-transform group-hover:scale-110 group-hover:rotate-12" />
                    New Conversation
                </button>

                <div className="flex-1 overflow-y-auto scroll-smooth" style={{ scrollbarWidth: 'thin' }}>
                    <ThreadList
                        threads={initialThreads}
                        activeThreadId={activeThreadId}
                        onSelectThread={setActiveThreadId}
                    />
                </div>

                <div className="mt-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-950/60 to-slate-900/60 p-4 backdrop-blur-sm transition-all duration-300 hover:border-white/10 animate-in fade-in slide-in-from-bottom-2">
                    <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                        <span>Contract</span>
                        <Link
                            href={getExplorerUrl()}
                            target="_blank"
                            className="text-sky-300 hover:text-sky-200 transition-colors flex items-center gap-1 group"
                        >
                            <span>View</span>
                            <Sparkles className="size-3 transition-transform group-hover:scale-110" />
                        </Link>
                    </div>
                    <p className="font-mono text-[10px] text-slate-500">
                        {WHISPERCHAIN_ADDRESS.slice(0, 10)}...
                    </p>
                </div>
            </aside>

            <main className="flex flex-1 flex-col relative">
                {error && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 shadow-lg animate-in fade-in slide-in-from-top-2">
                        <Loader2 className="size-4 text-red-400 animate-spin" />
                        <p className="text-sm text-red-400 font-medium">{error}</p>
                    </div>
                )}
                {activeThreadId ? (
                    <>
                        <div className="flex-1 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/50 pointer-events-none" />
                            <MessageList messages={activeMessages} isLoading={isLoading} />
                        </div>
                        <MessageInput
                            onSend={handleSendMessage}
                            disabled={!connectedAddress}
                        />
                    </>
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="mx-auto mb-6 size-20 rounded-full bg-gradient-to-br from-sky-500/20 to-violet-500/20 flex items-center justify-center shadow-2xl shadow-sky-500/20">
                                <MessageSquarePlus className="size-10 text-slate-600" />
                            </div>
                            <p className="text-lg font-semibold text-slate-300 mb-2">
                                Select a conversation
                            </p>
                            <p className="text-sm text-slate-500">
                                Choose a thread from the sidebar to start messaging
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
