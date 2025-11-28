'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { ChatHeader } from './ChatHeader';
import { EmptyState } from './EmptyState';
import { ErrorToast } from './ErrorToast';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ThreadList } from './ThreadList';
import { UserRegistration } from './UserRegistration';
import { CreateConversation } from './CreateConversation';
import { ProfileSettings } from './ProfileSettings';
import { BatchMessaging } from './BatchMessaging';
import {
	sendWhisper,
	waitForTransaction,
	fetchUserMessages,
	fetchMessage,
	fetchConversation,
	isUserRegistered,
	getUserConversations,
	updateLastSeen,
	getUserPublicKey,
} from '@WhisperChain/lib/whisperchainActions';
import { useWhisperChain } from '../hooks/useWhisperChain';
import { ethers } from 'ethers';
import { formatDistanceToNow } from 'date-fns';

type Message = {
	id: string;
	author: string;
	timestamp: number | string;
	body: string;
	isSelf: boolean;
	status: 'pending' | 'delivered' | 'read';
	messageHash?: string;
	messageId?: string;
	ipfsHash?: string;
	mediaType?: number;
	fileSize?: bigint;
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
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [userPublicKey, setUserPublicKey] = useState<string>('');

	const { profile, isRegistered, refresh } = useWhisperChain(connectedAddress);

	// Auto-update last seen every 30 seconds
	useEffect(() => {
		if (!connectedAddress || !isRegistered) return;

		const interval = setInterval(async () => {
			try {
				await updateLastSeen();
			} catch (error) {
				console.error('Failed to update last seen:', error);
			}
		}, 30000);

		return () => clearInterval(interval);
	}, [connectedAddress, isRegistered]);

	// Load user public key
	useEffect(() => {
		if (!connectedAddress) return;

		const loadPublicKey = async () => {
			try {
				const publicKey = await getUserPublicKey(connectedAddress);
				setUserPublicKey(ethers.hexlify(publicKey));
			} catch (error) {
				console.error('Failed to load public key:', error);
			}
		};

		loadPublicKey();
	}, [connectedAddress]);

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
							fileSize: msg.fileSize,
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
					? (validMessages.find((m) => m.messageId === msg.messageId && !m.isSelf)?.author || activeThreadId || 'default')
					: (msg.messageId?.toString() || connectedAddress || 'default');

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
						const idStr = typeof id === 'string' ? id : ethers.hexlify(id);
						const lastMsg = messagesByThread[idStr]?.[messagesByThread[idStr].length - 1];
						return {
							id: idStr,
							title: `Conversation ${idStr.slice(0, 8)}`,
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

			const receipt = await waitForTransaction(Promise.resolve(tx));

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
			loadUserData();
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

	if (needsRegistration && connectedAddress) {
		return (
			<div
				style={{
					display: 'flex',
					height: '100vh',
					alignItems: 'center',
					justifyContent: 'center',
					background: '#0f0f0f',
				}}
			>
				<div style={{ width: '100%', maxWidth: '28rem' }}>
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
		<div
			style={{
				display: 'flex',
				height: '100vh',
				background: '#0f0f0f',
				color: '#e5e5e5',
				position: 'relative',
				overflow: 'hidden',
			}}
		>
			<Sidebar
				isOpen={sidebarOpen}
				onToggle={() => setSidebarOpen(!sidebarOpen)}
				connectedAddress={connectedAddress}
				onConnect={setConnectedAddress}
				profile={profile ? { ...profile, publicKey: userPublicKey } : undefined}
				onNewChat={() => setShowCreateConversation(true)}
				onBatchSend={() => setShowBatchMessaging(true)}
				onSettings={() => setShowProfileSettings(true)}
			/>

			{/* Main Chat Area */}
			<main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', background: '#0f0f0f' }}>
				{error && <ErrorToast message={error} onDismiss={() => setError(null)} />}

				{activeThreadId && (
					<ChatHeader
						threadTitle={threads.find((t) => t.id === activeThreadId)?.title}
						onMenuClick={() => setSidebarOpen(true)}
						showMenu={!sidebarOpen}
					/>
				)}

				{activeThreadId ? (
					<>
						<div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
							<MessageList
								messages={messages[activeThreadId] ?? []}
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
					<EmptyState onNewConversation={() => setShowCreateConversation(true)} />
				)}
			</main>

			{/* Right Sidebar - Threads */}
			{sidebarOpen && (
				<div
					style={{
						width: '16rem',
						background: '#1a1a1a',
						borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
						padding: '1rem',
						overflowY: 'auto',
					}}
				>
					<h3
						style={{
							fontSize: '0.875rem',
							fontWeight: 600,
							marginBottom: '1rem',
							color: 'rgba(255, 255, 255, 0.7)',
						}}
					>
						Conversations
					</h3>
					<ThreadList
						threads={threads}
						activeThreadId={activeThreadId}
						onSelectThread={setActiveThreadId}
					/>
				</div>
			)}

			{/* Modals */}
			{showCreateConversation && connectedAddress && (
				<div
					style={{
						position: 'fixed',
						inset: 0,
						zIndex: 50,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						background: 'rgba(0, 0, 0, 0.8)',
						backdropFilter: 'blur(4px)',
						padding: '1rem',
					}}
				>
					<div style={{ width: '100%', maxWidth: '28rem' }}>
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
				<div
					style={{
						position: 'fixed',
						inset: 0,
						zIndex: 50,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						background: 'rgba(0, 0, 0, 0.8)',
						backdropFilter: 'blur(4px)',
						padding: '1rem',
					}}
				>
					<div style={{ width: '100%', maxWidth: '28rem' }}>
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
				<div
					style={{
						position: 'fixed',
						inset: 0,
						zIndex: 50,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						background: 'rgba(0, 0, 0, 0.8)',
						backdropFilter: 'blur(4px)',
						padding: '1rem',
					}}
				>
					<div style={{ width: '100%', maxWidth: '42rem' }}>
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
