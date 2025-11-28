'use client';

import { useState, useEffect, useMemo } from 'react';
import { WalletConnect } from './WalletConnect';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ThreadList } from './ThreadList';
import { UserRegistration } from './UserRegistration';
import { UserStats } from './UserStats';
import { CreateConversation } from './CreateConversation';
import { ProfileSettings } from './ProfileSettings';
import { StorageManagement } from './StorageManagement';
import { BatchMessaging } from './BatchMessaging';
import { MessageSquarePlus, Sparkles, Loader2, RefreshCw, User, Settings, X, Send } from 'lucide-react';
import {
    sendWhisper,
    waitForTransaction,
    fetchUserMessages,
    fetchMessage,
    fetchConversation,
    isUserRegistered,
    getUserConversations,
    markDelivered,
    markRead,
    deleteWhisper,
} from '@WhisperChain/lib/whisperchainActions';
import { getExplorerUrl, WHISPERCHAIN_ADDRESS } from '@WhisperChain/lib/blockchain';
import { useWhisperChain } from '../hooks/useWhisperChain';
import { ethers } from 'ethers';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

type Message = {
    id: string;
    author: string;
    role?: string;
    timestamp: number | string;
    body: string;
    isSelf: boolean;
    status: 'pending' | 'delivered' | 'read';
    messageHash?: string;
    messageId?: string;
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

export function ChatContainer() {
    const [connectedAddress, setConnectedAddress] = useState<string>();
    const [activeThreadId, setActiveThreadId] = useState<string>('');
    const [messages, setMessages] = useState<Record<string, Message[]>>({});
    const [threads, setThreads] = useState<Thread[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [needsRegistration, setNeedsRegistration] = useState(false);
    const [showCreateConversation, setShowCreateConversation] = useState(false);
    const [showProfileSettings, setShowProfileSettings] = useState(false);
    const [showBatchMessaging, setShowBatchMessaging] = useState(false);

    const { profile, isRegistered, refresh } = useWhisperChain(connectedAddress);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    useEffect(() => {
        if (connectedAddress) {
            checkRegistration();
            loadUserData();
        }
    }, [connectedAddress]);

    const checkRegistration = async () => {
        if (!connectedAddress) return;
        try {
            const registered = await isUserRegistered(connectedAddress);
            setNeedsRegistration(!registered);
        } catch (err: any) {
            console.error('Registration check failed:', err);
        }
    };

    const loadUserData = async () => {
        if (!connectedAddress) return;
        setIsLoading(true);
        try {
            const messageIds = await fetchUserMessages(connectedAddress);
            const conversationIds = await getUserConversations(connectedAddress);

            const messageData = await Promise.all(
                messageIds.slice(0, 100).map(async (id) => {
                    try {
                        const msg = await fetchMessage(id);
                        const isSelf = msg.sender.toLowerCase() === connectedAddress.toLowerCase();
                        const otherAddress = isSelf ? msg.recipient : msg.sender;

                        return {
                            id: id,
                            messageId: id,
                            author: isSelf ? 'You' : otherAddress.slice(0, 6) + '...',
                            timestamp: Number(msg.timestamp),
                            body: msg.ipfsHash ? `Media: ${msg.ipfsHash.slice(0, 12)}...` : 'Message',
                            isSelf: isSelf,
                            status: msg.read ? 'read' : msg.delivered ? 'delivered' : 'pending',
                            messageHash: msg.messageHash,
                            ipfsHash: msg.ipfsHash,
                            mediaType: Number(msg.mediaType),
                        } as Message;
                    } catch {
                        return null;
                    }
                })
            );

            const validMessages = messageData.filter((m): m is Message => m !== null);
            const messagesByThread: Record<string, Message[]> = {};

            validMessages.forEach((msg) => {
                const otherAddress = msg.isSelf
                    ? (validMessages.find((m) => m.messageId === msg.messageId && !m.isSelf)?.author || activeThreadId)
                    : msg.messageId || connectedAddress;

                if (!messagesByThread[otherAddress]) {
                    messagesByThread[otherAddress] = [];
                }
                messagesByThread[otherAddress].push(msg);
            });

            setMessages(messagesByThread);

            const conversationData = await Promise.all(
                conversationIds.slice(0, 20).map(async (id) => {
                    try {
                        const conv = await fetchConversation(id);
                        const lastMsg = messagesByThread[id]?.[messagesByThread[id].length - 1];
                        return {
                            id: id,
                            title: `Conversation ${id.slice(0, 8)}`,
                            subtitle: `${conv.participants.length} participants`,
                            unreadCount: 0,
                            lastMessage: lastMsg?.body || 'No messages',
                            timestamp: formatDistanceToNow(new Date(Number(conv.createdAt) * 1000), { addSuffix: true }),
                            participants: conv.participants,
                        } as Thread;
                    } catch {
                        return null;
                    }
                })
            );

            const validThreads = conversationData.filter((t): t is Thread => t !== null);
            setThreads(validThreads);

            if (validThreads.length > 0 && !activeThreadId) {
                setActiveThreadId(validThreads[0].id);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (args: {
        text: string;
        ipfsHash?: string;
        mediaType?: number;
        fileSize?: bigint;
        paymentAmount?: any;
        paymentToken?: any;
    }) => {
        if (!connectedAddress) {
            setError('Please connect your wallet first');
            throw new Error('Wallet not connected');
        }

        if (!activeThreadId) {
            setError('Please select a conversation');
            throw new Error('No active thread');
        }

        setError(null);

        const messageHash = ethers.keccak256(ethers.toUtf8Bytes(args.text));
        const ipfsHash = args.ipfsHash || `ipfs-${Date.now()}`;
        const mediaType = args.mediaType ?? 0;
        const fileSize = args.fileSize ?? BigInt(args.text.length);

        const pendingMessage: Message = {
            id: `pending-${Date.now()}`,
            author: 'You',
            timestamp: Math.floor(Date.now() / 1000),
            body: args.text,
            isSelf: true,
            status: 'pending',
            messageHash: messageHash,
        };

        setMessages((prev) => ({
            ...prev,
            [activeThreadId]: [...(prev[activeThreadId] ?? []), pendingMessage],
        }));

        try {
            const tx = await sendWhisper({
                recipient: activeThreadId,
                messageHash: messageHash,
                ipfsHash: ipfsHash,
                mediaType: mediaType,
                fileSize: fileSize,
                paymentToken: args.paymentToken,
                paymentAmount: args.paymentAmount,
                value: args.paymentToken === '0x0000000000000000000000000000000000000000' ? args.paymentAmount : undefined,
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

            refresh();
        } catch (error: any) {
            setError(error.message || 'Failed to send message');
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

    const handleMarkRead = async (messageId: string) => {
        try {
            await markRead(messageId);
            setMessages((prev) => {
                const updated = { ...prev };
                Object.keys(updated).forEach((threadId) => {
                    updated[threadId] = updated[threadId].map((msg) =>
                        msg.messageId === messageId ? { ...msg, status: 'read' as const } : msg
                    );
                });
                return updated;
            });
        } catch (err: any) {
            setError(err.message);
        }
    };

    const activeMessages = messages[activeThreadId] ?? [];

    if (needsRegistration && connectedAddress) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
                <div className="w-full max-w-md">
                    <UserRegistration
                        address={connectedAddress}
                        onRegistered={() => {
                            setNeedsRegistration(false);
                            checkRegistration();
                            loadUserData();
                        }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 overflow-hidden">
            <aside className="w-80 border-r border-white/5 bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-sm p-6 flex flex-col shadow-2xl">
                <div className="mb-6 animate-in fade-in slide-in-from-top-2">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                                WhisperChain
                            </p>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
                                Messages
                            </h1>
                        </div>
                    </div>

                    <WalletConnect
                        connectedAddress={connectedAddress}
                        onConnect={setConnectedAddress}
                    />

                    {profile && connectedAddress && (
                        <>
                            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-gradient-to-br from-sky-500 to-violet-500" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-white truncate">{profile.username || 'User'}</p>
                                        <p className="text-xs text-slate-400 font-mono truncate">
                                            {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4">
                                <UserStats userAddress={connectedAddress} />
                            </div>
                            <button
                                onClick={() => setShowProfileSettings(true)}
                                className="mt-4 w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-slate-800 hover:text-white flex items-center justify-center gap-2"
                            >
                                <Settings className="size-4" />
                                Profile Settings
                            </button>
                            <div className="mt-4">
                                <StorageManagement
                                    userAddress={connectedAddress}
                                    onUpdate={() => {
                                        loadUserData();
                                        refresh();
                                    }}
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="mb-4 space-y-2">
                    <button
                        onClick={() => setShowCreateConversation(true)}
                        className="group w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 border border-white/10 px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:from-white/20 hover:to-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                    >
                        <MessageSquarePlus className="size-4 transition-transform group-hover:scale-110 group-hover:rotate-12" />
                        New Conversation
                    </button>
                    <button
                        onClick={() => setShowBatchMessaging(true)}
                        className="group w-full flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-sm font-medium text-slate-300 transition-all duration-300 hover:bg-slate-800 hover:text-white hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Send className="size-4" />
                        Batch Send
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto scroll-smooth" style={{ scrollbarWidth: 'thin' }}>
                    {isLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-20 rounded-2xl bg-slate-800/50 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <ThreadList
                            threads={threads}
                            activeThreadId={activeThreadId}
                            onSelectThread={setActiveThreadId}
                        />
                    )}
                </div>

                <div className="mt-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-950/60 to-slate-900/60 p-4 backdrop-blur-sm transition-all duration-300 hover:border-white/10">
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
                            <MessageList
                                messages={activeMessages}
                                isLoading={isLoading}
                                onMessageUpdate={() => {
                                    loadUserData();
                                    refresh();
                                }}
                            />
                        </div>
                        <MessageInput
                            onSend={handleSendMessage}
                            disabled={!connectedAddress || !isRegistered}
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

            {showCreateConversation && connectedAddress && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="w-full max-w-md animate-in slide-in-from-bottom-4">
                        <CreateConversation
                            currentUser={connectedAddress}
                            onCreated={(conversationId) => {
                                setShowCreateConversation(false);
                                setActiveThreadId(conversationId);
                                loadUserData();
                            }}
                            onCancel={() => setShowCreateConversation(false)}
                        />
                    </div>
                </div>
            )}

            {showProfileSettings && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="w-full max-w-md animate-in slide-in-from-bottom-4">
                        <ProfileSettings
                            onUpdate={() => {
                                refresh();
                                loadUserData();
                            }}
                            onClose={() => setShowProfileSettings(false)}
                        />
                    </div>
                </div>
            )}

            {showBatchMessaging && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="w-full max-w-2xl animate-in slide-in-from-bottom-4">
                        <BatchMessaging
                            onComplete={() => {
                                setShowBatchMessaging(false);
                                loadUserData();
                                refresh();
                            }}
                            onCancel={() => setShowBatchMessaging(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
