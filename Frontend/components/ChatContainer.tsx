'use client';

import { useState, useEffect } from 'react';
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
	isUserRegistered,
	getUserConversations,
	getUserPublicKey,
} from '@WhisperChain/lib/whisperchainActions';
import { isGaslessConfigured } from '@WhisperChain/lib/gasless';
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
	const { connectedAddress, connect, disconnect } = useWallet();
	const isMobile = useIsMobile();
	const [activeThreadId, setActiveThreadId] = useState<string>('');
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

	// Close sidebars on mobile when thread is selected
	useEffect(() => {
		if (isMobile && activeThreadId) {
			setSidebarOpen(false);
			setConversationsSidebarOpen(false);
		}
	}, [isMobile, activeThreadId]);

	// Show conversations sidebar on mobile when wallet is connected
	useEffect(() => {
		if (isMobile && connectedAddress && !activeThreadId) {
			setConversationsSidebarOpen(true);
		}
	}, [isMobile, connectedAddress, activeThreadId]);

	// Ensure only one sidebar is open at a time on mobile
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

	// Set up event listeners separately
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

	// Set up real-time event listeners
	const setupEventListeners = async () => {
		if (!connectedAddress) return;

		try {
			const { getReadOnlyContract } = await import('@WhisperChain/lib/blockchain');
			const contract = getReadOnlyContract();

			// Listen for new messages
			const handleMessageSent = async (messageId: string, sender: string, recipient: string) => {
				const senderLower = sender.toLowerCase();
				const recipientLower = recipient.toLowerCase();
				const connectedLower = connectedAddress.toLowerCase();

				// Only process if message is for or from the connected user
				if (senderLower === connectedLower || recipientLower === connectedLower) {
					// Small delay to ensure transaction is mined
					setTimeout(() => {
						loadUserData();
					}, 1000);
				}
			};

			// Listen for MessageSent events using proper TypeChain event types
			const messageSentEvent = contract.getEvent('MessageSent');
			contract.on(messageSentEvent, (messageId, sender, recipient, timestamp, paymentAmount, event) => {
				handleMessageSent(messageId, sender, recipient);
			});

			// Listen for PaymentSettled events
			const paymentSettledEvent = contract.getEvent('PaymentSettled');
			contract.on(paymentSettledEvent, async (messageId, amount, event) => {
				try {
					// Get message details to show notification
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

			// Cleanup function
			return () => {
				contract.removeAllListeners(messageSentEvent);
				contract.removeAllListeners(paymentSettledEvent);
			};
		} catch (error) {
			console.error('Failed to setup event listeners:', error);
		}
	};

	// Polling fallback for real-time updates (every 10 seconds)
	useEffect(() => {
		if (!connectedAddress || !activeThreadId) return;

		const pollInterval = setInterval(() => {
			loadUserData();
		}, 10000); // Poll every 10 seconds

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

			// Load all conversations first
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

			// Load messages and group by conversation
			const messageData = await Promise.all(
				messageIds.slice(0, 100).map(async (id) => {
					try {
						const msg = await fetchMessage(id);
						const isSelf = msg.sender.toLowerCase() === connectedAddress.toLowerCase();
						const otherAddress = isSelf ? msg.recipient : msg.sender;

						// Find which conversation this message belongs to
						let conversationId: string | null = null;
						for (const conv of validConversations) {
							const participants = conv.conversation.participants.map((p: string) => p.toLowerCase());
							if (participants.includes(msg.sender.toLowerCase()) && participants.includes(msg.recipient.toLowerCase())) {
								conversationId = conv.id;
								break;
							}
						}

						// If no conversation found, create a 1-on-1 thread ID
						if (!conversationId) {
							conversationId = otherAddress.toLowerCase();
						}

						// Determine message body based on media type
						let body = 'Message';
						if (Number(msg.mediaType) === 0) {
							// TEXT message - retrieve from contract's textContent field
							// The contract now stores text directly in textContent field
							if (msg.textContent && msg.textContent.length > 0) {
								body = msg.textContent;
							} else if (msg.ipfsHash && msg.ipfsHash.length > 0 && !msg.ipfsHash.startsWith('text-')) {
								// Legacy text message stored on IPFS - try to download
								try {
									const { downloadTextFromIPFS } = await import('@WhisperChain/lib/ipfs');
									body = await downloadTextFromIPFS(msg.ipfsHash);
								} catch {
									body = `Message (IPFS: ${msg.ipfsHash.slice(0, 12)}...)`;
								}
							} else {
								// Fallback: try to get textContent from contract using getTextContent
								try {
									const { getTextContent } = await import('@WhisperChain/lib/whisperchainActions');
									const textContent = await getTextContent(id);
									if (textContent && textContent.length > 0) {
										body = textContent;
									} else {
										body = '[Text message]';
									}
								} catch {
									body = '[Text message]';
								}
							}
						} else if (msg.ipfsHash && msg.ipfsHash.length > 0) {
							// Media message (IMAGE, VIDEO, DOCUMENT) - stored on IPFS
							const { getMediaTypeName, getIPFSUrl } = await import('@WhisperChain/lib/ipfs');
							const mediaTypeName = getMediaTypeName(Number(msg.mediaType));
							body = `${mediaTypeName}: ${getIPFSUrl(msg.ipfsHash)}`;
						}

						return {
							id: id,
							messageId: id,
							author: isSelf ? 'You' : otherAddress.slice(0, 6) + '...' + otherAddress.slice(-4),
							timestamp: Number(msg.timestamp),
							body: body,
							isSelf: isSelf,
							status: msg.read ? 'read' : msg.delivered ? 'delivered' : 'pending',
							messageHash: msg.messageHash,
							ipfsHash: msg.ipfsHash,
							mediaType: Number(msg.mediaType),
							fileSize: msg.fileSize,
							conversationId: conversationId,
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

			// Group messages by conversation ID
			validMessages.forEach((msg) => {
				const threadId = msg.conversationId;
				if (!messagesByThread[threadId]) {
					messagesByThread[threadId] = [];
				}
				messagesByThread[threadId].push(msg);
			});

			// Sort messages by timestamp
			Object.keys(messagesByThread).forEach((threadId) => {
				messagesByThread[threadId].sort((a, b) => {
					const timeA = typeof a.timestamp === 'number' ? a.timestamp : 0;
					const timeB = typeof b.timestamp === 'number' ? b.timestamp : 0;
					return timeA - timeB;
				});
			});

			setMessages(messagesByThread);

			// Create thread list from conversations
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

			// Also add 1-on-1 threads from messages that don't belong to conversations
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

			// Sort threads by last message timestamp
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

		const isTextMessage = !args.ipfsHash && (!args.mediaType || args.mediaType === 0);

		// For TEXT messages, use empty IPFS hash (contract allows it now)
		// For media messages, IPFS hash is required
		const ipfsHash = args.ipfsHash || (isTextMessage ? '' : `ipfs-${Date.now()}`);
		const mediaType = args.mediaType ?? 0;
		// For text messages, fileSize should be 0 since we're not storing on IPFS
		const fileSize = isTextMessage ? BigInt(0) : (args.fileSize ?? BigInt(0));
		// For TEXT messages, store text content directly in the contract
		const textContent = isTextMessage ? args.text : '';

		// Don't add message optimistically - wait for transaction confirmation
		// Track pending transaction
		const txHash = `pending-${Date.now()}`;
		setPendingTransactions((prev) => new Set([...prev, txHash]));

		try {
			// Find the active thread to get recipient(s)
			const activeThread = threads.find(t => t.id === activeThreadId);
			if (!activeThread) {
				throw new Error('Conversation not found');
			}


			const otherParticipants = activeThread.participants?.filter(
				(p: string) => p.toLowerCase() !== connectedAddress.toLowerCase()
			) || [];

			if (otherParticipants.length === 0) {
				throw new Error('No recipients in conversation');
			}

			const recipient = otherParticipants[0];

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
			setError(error.message || 'Failed to send message');
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
			{/* Mobile Backdrop */}
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
						// Error handled by useWallet hook
					}
				}}
				onDisconnect={() => {
					disconnect();
					// Clear state on disconnect
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

			{/* Main Chat Area */}
			<main style={{
				flex: 1,
				display: 'flex',
				flexDirection: 'column',
				position: 'relative',
				background: '#0a0a0a',
				minWidth: 0,
				backdropFilter: isMobile && (sidebarOpen || conversationsSidebarOpen) ? 'blur(8px)' : 'none',
				opacity: isMobile && (sidebarOpen || conversationsSidebarOpen) ? 0.7 : 1,
				transition: 'opacity 0.3s ease-out, backdrop-filter 0.3s ease-out',
			}}>
				{error && <ErrorToast message={error} onDismiss={() => setError(null)} />}

				{/* Always show header on mobile, or when there's an active thread */}
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
						<div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
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

			{/* Right Sidebar - Conversations */}
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

			{/* Payment Notification */}
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

			{/* Payment History */}
			{showPaymentHistory && connectedAddress && (
				<PaymentHistory userAddress={connectedAddress} onClose={() => setShowPaymentHistory(false)} />
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
