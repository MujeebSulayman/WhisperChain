'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { ConversationsSidebar } from './ConversationsSidebar';
import { ChatHeader } from './ChatHeader';
import { EmptyState } from './EmptyState';
import { ErrorToast } from './ErrorToast';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { UserRegistration } from './UserRegistration';
import { CreateConversation } from './CreateConversation';
import { ProfileSettings } from './ProfileSettings';
import { BatchMessaging } from './BatchMessaging';
import { PaymentNotification } from './PaymentNotification';
import { PaymentHistory } from './PaymentHistory';
import {
	sendWhisper,
	sendWhisperGasless,
	submitSignedForwardRequest,
	waitForTransaction,
	fetchUserMessages,
	fetchMessage,
	fetchConversation,
	getIPFSHash,
	getMediaType,
	isUserRegistered,
	getUserConversations,
	getUserPublicKey,
} from '@WhisperChain/lib/whisperchainActions';
import { isGaslessConfigured } from '@WhisperChain/lib/gasless';
import { getErrorMessage, REQUEST_CANCELLED_MESSAGE } from '@WhisperChain/lib/errors';
import { useWhisperChain } from '../hooks/useWhisperChain';
import { useWallet } from '../hooks/useWallet';
import { useIsMobile } from '../hooks/useMediaQuery';
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
	paymentAmount?: bigint;
	paymentToken?: string;
	sender?: string;
	recipient?: string;
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

const CHAT_PARAM = 'c';

export function ChatContainer() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { connectedAddress, connect, disconnect } = useWallet();
	const isMobile = useIsMobile();
	const [activeThreadId, setActiveThreadIdState] = useState<string>('');

	const setActiveThreadId = useCallback(
		(threadId: string) => {
			setActiveThreadIdState(threadId);
			const params = new URLSearchParams(searchParams.toString());
			if (threadId) params.set(CHAT_PARAM, threadId);
			else params.delete(CHAT_PARAM);
			const qs = params.toString();
			router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
		},
		[pathname, router, searchParams]
	);

	const cFromUrl = searchParams.get(CHAT_PARAM);
	useEffect(() => {
		if (cFromUrl !== null && cFromUrl !== activeThreadId) setActiveThreadIdState(cFromUrl);
	}, [cFromUrl, activeThreadId]);
	const [messages, setMessages] = useState<Record<string, Message[]>>({});
	const [threads, setThreads] = useState<Thread[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [needsRegistration, setNeedsRegistration] = useState(false);
	const [showCreateConversation, setShowCreateConversation] = useState(false);
	const [showProfileSettings, setShowProfileSettings] = useState(false);
	const [showBatchMessaging, setShowBatchMessaging] = useState(false);
	const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
	const [conversationsSidebarOpen, setConversationsSidebarOpen] = useState(!isMobile || (isMobile && !!connectedAddress));
	const [userPublicKey, setUserPublicKey] = useState<string>('');
	const [pendingTransactions, setPendingTransactions] = useState<Set<string>>(new Set());
	const [paymentNotification, setPaymentNotification] = useState<{
		amount: bigint;
		token?: string;
		isReceived: boolean;
		from?: string;
		to?: string;
	} | null>(null);
	const [showPaymentHistory, setShowPaymentHistory] = useState(false);

	const { profile, isRegistered, refresh } = useWhisperChain(connectedAddress);

	useEffect(() => {
		if (isMobile && activeThreadId) {
			setSidebarOpen(false);
			setConversationsSidebarOpen(false);
		}
	}, [isMobile, activeThreadId]);

	useEffect(() => {
		if (isMobile && connectedAddress && !activeThreadId) {
			setConversationsSidebarOpen(true);
		}
	}, [isMobile, connectedAddress, activeThreadId]);

	useEffect(() => {
		if (isMobile && sidebarOpen && conversationsSidebarOpen) {
			setConversationsSidebarOpen(false);
		}
	}, [isMobile, sidebarOpen]);

	useEffect(() => {
		if (isMobile && conversationsSidebarOpen && sidebarOpen) {
			setSidebarOpen(false);
		}
	}, [isMobile, conversationsSidebarOpen]);

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

	useEffect(() => {
		if (!connectedAddress) return;

		let cleanup: (() => void) | undefined;

		setupEventListeners().then((cleanupFn) => {
			cleanup = cleanupFn;
		});

		return () => {
			if (cleanup) {
				cleanup();
			}
		};
	}, [connectedAddress]);

	const setupEventListeners = async () => {
		if (!connectedAddress) return;

		try {
			const { getReadOnlyContract } = await import('@WhisperChain/lib/blockchain');
			const contract = getReadOnlyContract();

			const handleMessageSent = async (messageId: string, sender: string, recipient: string) => {
				const senderLower = sender.toLowerCase();
				const recipientLower = recipient.toLowerCase();
				const connectedLower = connectedAddress.toLowerCase();

				if (senderLower === connectedLower || recipientLower === connectedLower) {
					setTimeout(() => {
						loadUserData();
					}, 1000);
				}
			};

			const messageSentEvent = contract.getEvent('MessageSent');
			contract.on(messageSentEvent, (messageId, sender, recipient, timestamp, paymentAmount, event) => {
				handleMessageSent(messageId, sender, recipient);
			});

			const paymentSettledEvent = contract.getEvent('PaymentSettled');
			contract.on(paymentSettledEvent, async (messageId, amount, event) => {
				try {
					const msg = await fetchMessage(messageId);
					const isReceived = msg.recipient.toLowerCase() === connectedAddress.toLowerCase();
					if (isReceived) {
						setPaymentNotification({
							amount: amount,
							token: msg.paymentToken,
							isReceived: true,
							from: msg.sender,
						});
					}
					setTimeout(() => {
						loadUserData();
					}, 500);
				} catch (error) {
					console.error('Failed to load payment details:', error);
				}
			});

			return () => {
				contract.removeAllListeners(messageSentEvent);
				contract.removeAllListeners(paymentSettledEvent);
			};
		} catch (error) {
			console.error('Failed to setup event listeners:', error);
		}
	};

	useEffect(() => {
		if (!connectedAddress || !activeThreadId) return;

		const pollInterval = setInterval(() => {
			loadUserData();
		}, 10000);

		return () => clearInterval(pollInterval);
	}, [connectedAddress, activeThreadId]);

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

			const conversations = await Promise.all(
				conversationIds.slice(0, 20).map(async (id) => {
					try {
						const conv = await fetchConversation(id);
						const idStr = typeof id === 'string' ? id : ethers.hexlify(id);
						return { id: idStr, conversation: conv };
					} catch {
						return null;
					}
				})
			);

			const validConversations = conversations.filter((c): c is { id: string; conversation: any } => c !== null);

			const messageData = await Promise.all(
				messageIds.slice(0, 100).map(async (id) => {
					try {
						const [msg, ipfsHash, mediaType] = await Promise.all([
							fetchMessage(id),
							getIPFSHash(id).catch(() => ''),
							getMediaType(id).catch(() => 0),
						]);
						const hash = (typeof ipfsHash === 'string' ? ipfsHash : String(ipfsHash ?? '')).trim();
						const media = Number(mediaType ?? 0);
						const textContent = (typeof msg.textContent === 'string' ? msg.textContent : String((msg as any).textContent ?? '')).trim();
						const isSelf = msg.sender.toLowerCase() === connectedAddress.toLowerCase();
						const otherAddress = isSelf ? msg.recipient : msg.sender;

						let conversationId: string | null = null;
						for (const conv of validConversations) {
							const participants = conv.conversation.participants.map((p: string) => p.toLowerCase());
							if (participants.includes(msg.sender.toLowerCase()) && participants.includes(msg.recipient.toLowerCase())) {
								conversationId = conv.id;
								break;
							}
						}
						if (!conversationId) conversationId = otherAddress.toLowerCase();

						let body: string;
						if (media === 0) {
							body = textContent;
							if (!body && hash && !hash.startsWith('text-')) {
								try {
									const { downloadTextFromIPFS } = await import('@WhisperChain/lib/ipfs');
									body = await downloadTextFromIPFS(hash);
								} catch {
									body = `[IPFS ${hash.slice(0, 12)}...]`;
								}
							}
							if (!body) {
								try {
									const { getTextContent } = await import('@WhisperChain/lib/whisperchainActions');
									body = (await getTextContent(id)) || '[Text]';
								} catch {
									body = '[Text]';
								}
							}
						} else {
							body = '';
						}

						return {
							id,
							messageId: id,
							author: isSelf ? 'You' : otherAddress.slice(0, 6) + '...' + otherAddress.slice(-4),
							timestamp: Number(msg.timestamp),
							body,
							isSelf,
							status: msg.read ? 'read' : msg.delivered ? 'delivered' : 'pending',
							messageHash: msg.messageHash,
							ipfsHash: hash || undefined,
							mediaType: media,
							fileSize: msg.fileSize,
							conversationId,
							sender: msg.sender,
							recipient: msg.recipient,
							paymentAmount: msg.paymentAmount,
							paymentToken: msg.paymentToken,
						} as Message & { conversationId: string; sender: string; recipient: string; paymentAmount?: bigint; paymentToken?: string };
					} catch {
						return null;
					}
				})
			);

			const validMessages = messageData.filter((m): m is Message & { conversationId: string; sender: string; recipient: string } => m !== null);
			const messagesByThread: Record<string, Message[]> = {};

			validMessages.forEach((msg) => {
				const threadId = msg.conversationId;
				if (!messagesByThread[threadId]) {
					messagesByThread[threadId] = [];
				}
				messagesByThread[threadId].push(msg);
			});

			Object.keys(messagesByThread).forEach((threadId) => {
				messagesByThread[threadId].sort((a, b) => {
					const timeA = typeof a.timestamp === 'number' ? a.timestamp : 0;
					const timeB = typeof b.timestamp === 'number' ? b.timestamp : 0;
					return timeA - timeB;
				});
			});

			setMessages(messagesByThread);

			const threadData = validConversations.map((conv) => {
				const idStr = conv.id;
				const lastMsg = messagesByThread[idStr]?.[messagesByThread[idStr].length - 1];
				const otherParticipants = conv.conversation.participants
					.filter((p: string) => p.toLowerCase() !== connectedAddress.toLowerCase())
					.map((p: string) => p.slice(0, 6) + '...' + p.slice(-4));

				return {
					id: idStr,
					title: otherParticipants.length === 1
						? otherParticipants[0]
						: `${conv.conversation.participants.length} participants`,
					subtitle: `${conv.conversation.participants.length} participants`,
					unreadCount: 0,
					lastMessage: lastMsg?.body || 'No messages yet',
					timestamp: formatDistanceToNow(new Date(Number(conv.conversation.createdAt) * 1000), { addSuffix: true }),
					participants: conv.conversation.participants,
				} as Thread;
			});

			const oneOnOneThreads = new Map<string, { lastMsg: Message; otherAddress: string }>();
			validMessages.forEach((msg) => {
				if (!validConversations.find(c => c.id === msg.conversationId)) {
					const otherAddress = msg.isSelf ? msg.recipient : msg.sender;
					const existing = oneOnOneThreads.get(otherAddress);
					if (!existing || (typeof msg.timestamp === 'number' && typeof existing.lastMsg.timestamp === 'number' && msg.timestamp > existing.lastMsg.timestamp)) {
						oneOnOneThreads.set(otherAddress, { lastMsg: msg, otherAddress });
					}
				}
			});

			oneOnOneThreads.forEach((data, otherAddress) => {
				threadData.push({
					id: otherAddress.toLowerCase(),
					title: otherAddress.slice(0, 6) + '...' + otherAddress.slice(-4),
					unreadCount: 0,
					lastMessage: data.lastMsg.body,
					timestamp: typeof data.lastMsg.timestamp === 'number'
						? formatDistanceToNow(new Date(data.lastMsg.timestamp * 1000), { addSuffix: true })
						: 'Just now',
					participants: [connectedAddress, otherAddress],
				} as Thread);
			});

			threadData.sort((a, b) => {
				const msgA = messagesByThread[a.id]?.[messagesByThread[a.id].length - 1];
				const msgB = messagesByThread[b.id]?.[messagesByThread[b.id].length - 1];
				const timeA = msgA && typeof msgA.timestamp === 'number' ? msgA.timestamp : 0;
				const timeB = msgB && typeof msgB.timestamp === 'number' ? msgB.timestamp : 0;
				return timeB - timeA;
			});

			setThreads(threadData);

			if (threadData.length > 0 && !activeThreadId) {
				setActiveThreadId(threadData[0].id);
			}
		} catch (err: any) {
			setError(getErrorMessage(err, 'Failed to load data'));
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

		const isTextMessage = !args.ipfsHash && (!args.mediaType || args.mediaType === 0);

		const ipfsHash = args.ipfsHash || (isTextMessage ? '' : `ipfs-${Date.now()}`);
		const mediaType = args.mediaType ?? 0;
		const fileSize = isTextMessage ? BigInt(0) : (args.fileSize ?? BigInt(0));
		const textContent = isTextMessage ? args.text : '';

		const txHash = `pending-${Date.now()}`;
		setPendingTransactions((prev) => new Set([...prev, txHash]));

		const activeThread = threads.find((t) => t.id === activeThreadId);
		if (!activeThread) {
			setError('Conversation not found');
			throw new Error('Conversation not found');
		}
		const otherParticipants = activeThread.participants?.filter(
			(p: string) => p.toLowerCase() !== connectedAddress.toLowerCase()
		) || [];
		if (otherParticipants.length === 0) {
			setError('No recipients in conversation');
			throw new Error('No recipients in conversation');
		}
		const recipient = otherParticipants[0];

		const optimisticId = `pending-msg-${Date.now()}`;
		const optimisticMessage: Message = {
			id: optimisticId,
			messageId: optimisticId,
			author: 'You',
			timestamp: Math.floor(Date.now() / 1000),
			body: args.text,
			isSelf: true,
			status: 'pending',
			...(args.ipfsHash ? { ipfsHash: args.ipfsHash } : {}),
			...(args.mediaType !== undefined && args.mediaType !== 0 ? { mediaType: args.mediaType } : {}),
			...(args.fileSize !== undefined ? { fileSize: args.fileSize } : {}),
			...(args.paymentAmount && args.paymentAmount > BigInt(0) ? { paymentAmount: args.paymentAmount, paymentToken: args.paymentToken } : {}),
		};
		const optimisticWithMeta: Message = { ...optimisticMessage, sender: connectedAddress, recipient };
		setMessages((prev) => ({
			...prev,
			[activeThreadId]: [...(prev[activeThreadId] ?? []), optimisticWithMeta],
		}));

		try {
			if (isGaslessConfigured()) {
				const { request, signature } = await sendWhisperGasless({
					recipient,
					messageHash,
					ipfsHash,
					mediaType,
					fileSize,
					paymentToken: args.paymentToken,
					paymentAmount: args.paymentAmount,
					value: args.paymentToken === '0x0000000000000000000000000000000000000000' ? args.paymentAmount : undefined,
					textContent,
				});
				await submitSignedForwardRequest(request, signature);
			} else {
				const tx = await sendWhisper({
					recipient,
					messageHash,
					ipfsHash,
					mediaType,
					fileSize,
					paymentToken: args.paymentToken,
					paymentAmount: args.paymentAmount,
					value: args.paymentToken === '0x0000000000000000000000000000000000000000' ? args.paymentAmount : undefined,
					textContent,
				});
				await waitForTransaction(Promise.resolve(tx));
			}

			if (args.paymentAmount && args.paymentAmount > BigInt(0)) {
				setPaymentNotification({
					amount: args.paymentAmount,
					token: args.paymentToken,
					isReceived: false,
					to: recipient,
				});
			}

			setPendingTransactions((prev) => {
				const next = new Set(prev);
				next.delete(txHash);
				return next;
			});

			await loadUserData();
			refresh();
		} catch (error: any) {
			setError(getErrorMessage(error, 'Failed to send message'));
			setMessages((prev) => ({
				...prev,
				[activeThreadId]: (prev[activeThreadId] ?? []).filter((m) => m.id !== optimisticId),
			}));
			setPendingTransactions((prev) => {
				const next = new Set(prev);
				next.delete(txHash);
				return next;
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
					position: 'relative',
					zIndex: 1000,
				}}
			>
				<div style={{ width: '100%', maxWidth: '28rem', position: 'relative', zIndex: 1001 }}>
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
				color: '#ffffff',
				position: 'relative',
				overflow: 'hidden',
			}}
		>
			{isMobile && (sidebarOpen || conversationsSidebarOpen) && (
				<div
					style={{
						position: 'fixed',
						inset: 0,
						background: 'rgba(0, 0, 0, 0.7)',
						backdropFilter: 'blur(4px)',
						zIndex: 40,
					}}
					onClick={() => {
						setSidebarOpen(false);
						setConversationsSidebarOpen(false);
					}}
				/>
			)}

			<Sidebar
				isOpen={sidebarOpen}
				onToggle={() => {
					if (isMobile && conversationsSidebarOpen) {
						setConversationsSidebarOpen(false);
					}
					setSidebarOpen(!sidebarOpen);
				}}
				connectedAddress={connectedAddress}
				onConnect={async () => {
					try {
						await connect();
					} catch (error) {
					}
				}}
				onDisconnect={() => {
					disconnect();
					setActiveThreadId('');
					setMessages({});
					setThreads([]);
				}}
				profile={profile ? { ...profile, publicKey: userPublicKey } : undefined}
				onNewChat={() => {
					if (!connectedAddress) {
						setError('Please connect your wallet to create a new conversation');
						return;
					}
					setShowCreateConversation(true);
					if (isMobile) setSidebarOpen(false);
				}}
				onBatchSend={() => {
					setShowBatchMessaging(true);
					if (isMobile) setSidebarOpen(false);
				}}
				onSettings={() => {
					setShowProfileSettings(true);
					if (isMobile) setSidebarOpen(false);
				}}
				onPaymentHistory={() => {
					setShowPaymentHistory(true);
					if (isMobile) setSidebarOpen(false);
				}}
				isMobile={isMobile}
			/>

			<main style={{
				flex: 1,
				display: 'flex',
				flexDirection: 'column',
				position: 'relative',
				background: 'radial-gradient(ellipse 120% 80% at 50% 0%, rgba(30, 27, 45, 0.4) 0%, transparent 50%), linear-gradient(180deg, #0c0c0e 0%, #0a0a0c 100%)',
				minWidth: 0,
				backdropFilter: isMobile && (sidebarOpen || conversationsSidebarOpen) ? 'blur(8px)' : 'none',
				opacity: isMobile && (sidebarOpen || conversationsSidebarOpen) ? 0.7 : 1,
				transition: 'opacity 0.3s ease-out, backdrop-filter 0.3s ease-out',
			}}>
				{error && (
					<ErrorToast
						message={error}
						onDismiss={() => setError(null)}
						variant={error === REQUEST_CANCELLED_MESSAGE ? 'cancel' : 'error'}
						autoHideDelay={error === REQUEST_CANCELLED_MESSAGE ? 2500 : 5000}
					/>
				)}

				{(isMobile || activeThreadId) && (
					<ChatHeader
						threadTitle={activeThreadId ? threads.find((t) => t.id === activeThreadId)?.title : undefined}
						onMenuClick={() => {
							if (isMobile && conversationsSidebarOpen) {
								setConversationsSidebarOpen(false);
							}
							setSidebarOpen(true);
						}}
						showMenu={isMobile}
						onConversationsClick={() => {
							if (isMobile && sidebarOpen) {
								setSidebarOpen(false);
							}
							setConversationsSidebarOpen(!conversationsSidebarOpen);
						}}
						showConversations={conversationsSidebarOpen}
						isMobile={isMobile}
					/>
				)}

				{activeThreadId ? (
					<>
						<div style={{ flex: 1, overflowY: 'auto', position: 'relative', minHeight: 0 }}>
							<MessageList
								messages={messages[activeThreadId] ?? []}
								isLoading={isLoading}
								onMessageUpdate={() => {
									loadUserData();
									refresh();
								}}
								connectedAddress={connectedAddress}
							/>
						</div>
						<MessageInput
							onSend={handleSendMessage}
							disabled={!connectedAddress || !isRegistered}
						/>
					</>
				) : (
					<EmptyState onNewConversation={() => {
						if (!connectedAddress) {
							setError('Please connect your wallet to create a new conversation');
							return;
						}
						setShowCreateConversation(true);
					}} />
				)}
			</main>

			<ConversationsSidebar
				isOpen={conversationsSidebarOpen}
				onToggle={() => {
					if (isMobile && sidebarOpen) {
						setSidebarOpen(false);
					}
					setConversationsSidebarOpen(!conversationsSidebarOpen);
				}}
				threads={threads}
				activeThreadId={activeThreadId}
				onSelectThread={(threadId) => {
					setActiveThreadId(threadId);
					if (isMobile) setConversationsSidebarOpen(false);
				}}
				connectedAddress={connectedAddress}
				isMobile={isMobile}
			/>

			{paymentNotification && (
				<PaymentNotification
					paymentAmount={paymentNotification.amount}
					paymentToken={paymentNotification.token}
					isReceived={paymentNotification.isReceived}
					from={paymentNotification.from}
					to={paymentNotification.to}
					onDismiss={() => setPaymentNotification(null)}
				/>
			)}

			{showPaymentHistory && connectedAddress && (
				<PaymentHistory userAddress={connectedAddress} onClose={() => setShowPaymentHistory(false)} />
			)}

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
							findExisting1on1Thread={(otherAddress) => {
								const other = otherAddress.toLowerCase();
								const me = connectedAddress?.toLowerCase() ?? '';
								const found = threads.find((t) => {
									const p = t.participants?.map((a) => a.toLowerCase()) ?? [];
									return p.length === 2 && p.includes(me) && p.includes(other);
								});
								return found?.id ?? null;
							}}
							onCreated={(conversationId, participants) => {
								setShowCreateConversation(false);
								const isExisting = threads.some((t) => t.id === conversationId);
								if (!isExisting) {
									const other = participants.filter((p) => p.toLowerCase() !== connectedAddress?.toLowerCase());
									const title = other.length === 1 ? `${other[0].slice(0, 6)}...${other[0].slice(-4)}` : `${participants.length} participants`;
									setThreads((prev) => [
										{ id: conversationId, title, lastMessage: 'No messages yet', timestamp: 'Just now', participants },
										...prev,
									]);
									setMessages((prev) => ({ ...prev, [conversationId]: [] }));
								}
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
