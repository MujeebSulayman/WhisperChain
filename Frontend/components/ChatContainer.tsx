'use client';

import { useState, useEffect } from 'react';
import { WalletConnect } from './WalletConnect';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ThreadList } from './ThreadList';
import { MessageSquarePlus, Settings, RefreshCw } from 'lucide-react';
import { sendWhisper, waitForTransaction, fetchUserMessages } from '@WhisperChain/lib/whisperchainActions';
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

    const activeMessages = messages[activeThreadId] ?? [];

    const handleSendMessage = async (text: string) => {
        if (!connectedAddress) {
            throw new Error('Wallet not connected');
        }

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
            setMessages((prev) => {
                const updated = [...(prev[activeThreadId] ?? [])];
                const idx = updated.findIndex((m) => m.id === pendingMessage.id);
                if (idx >= 0) {
                    updated.splice(idx, 1);
                }
                return { ...prev, [activeThreadId]: updated };
            });
            throw error;
        }
    };

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100">
            <aside className="w-80 border-r border-white/5 bg-slate-900/60 p-6 flex flex-col">
                <div className="mb-6">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-slate-500">
                                WhisperChain
                            </p>
                            <h1 className="text-xl font-semibold text-white">
                                Messages
                            </h1>
                        </div>
                    </div>

                    <WalletConnect
                        connectedAddress={connectedAddress}
                        onConnect={setConnectedAddress}
                    />
                </div>

                <button className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20">
                    <MessageSquarePlus className="size-4" />
                    New Conversation
                </button>

                <div className="flex-1 overflow-y-auto">
                    <ThreadList
                        threads={initialThreads}
                        activeThreadId={activeThreadId}
                        onSelectThread={setActiveThreadId}
                    />
                </div>

                <div className="mt-4 rounded-2xl border border-white/5 bg-slate-950/40 p-4">
                    <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                        <span>Contract</span>
                        <Link
                            href={getExplorerUrl()}
                            target="_blank"
                            className="text-sky-300 hover:text-sky-200"
                        >
                            View
                        </Link>
                    </div>
                    <p className="font-mono text-[10px] text-slate-500">
                        {WHISPERCHAIN_ADDRESS.slice(0, 10)}...
                    </p>
                </div>
            </aside>

            <main className="flex flex-1 flex-col">
                {activeThreadId ? (
                    <>
                        <div className="flex-1 overflow-hidden">
                            <MessageList
                                messages={activeMessages}
                                isLoading={isLoading}
                            />
                        </div>
                        <MessageInput
                            onSend={handleSendMessage}
                            disabled={!connectedAddress}
                        />
                    </>
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                            <MessageSquarePlus className="mx-auto mb-4 size-12 text-slate-600" />
                            <p className="text-slate-400">Select a conversation to start</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

