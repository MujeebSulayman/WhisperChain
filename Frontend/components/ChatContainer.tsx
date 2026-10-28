'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { Modal } from './Modal';
import { WalletHub, type WalletTab } from './WalletHub';
import {
	sendChatMessage,
	sendChatMessageGasless,
	sendBatchMessages,
	sendBatchMessagesGasless,
	submitSignedForwardRequest,
	waitForTransaction,
	fetchMessage,
	isUserRegistered,
	getUserPublicKey,
} from '@/lib/scarfActions';
import { getReadOnlyContract } from '@/lib/blockchain';
import { NO_CAPTION, groupTag, groupTitle, shortAddress, type Thread } from '@/lib/inbox';
import { isGaslessConfigured } from '@/lib/gasless';
import { getErrorMessage, REQUEST_CANCELLED_MESSAGE } from '@/lib/errors';
import { useScarf } from '../hooks/useScarf';
import { useWallet } from '../hooks/useWallet';
import { useWalletBalance } from '../hooks/useWalletBalance';
import { useInbox } from '../hooks/useInbox';
import { useIsMobile } from '../hooks/useMediaQuery';
import { ethers } from 'ethers';

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
	const [error, setError] = useState<string | null>(null);
	const [needsRegistration, setNeedsRegistration] = useState(false);
	const [showCreateConversation, setShowCreateConversation] = useState(false);
	const [showProfileSettings, setShowProfileSettings] = useState(false);
	const [showBatchMessaging, setShowBatchMessaging] = useState(false);
	const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
	const [conversationsSidebarOpen, setConversationsSidebarOpen] = useState(!isMobile || (isMobile && !!connectedAddress));
	const [userPublicKey, setUserPublicKey] = useState<string>('');
	const [paymentNotification, setPaymentNotification] = useState<{
		amount: bigint;
		token?: string;
		isReceived: boolean;
		from?: string;
		to?: string;
	} | null>(null);
	const [showPaymentHistory, setShowPaymentHistory] = useState(false);
	const [walletTab, setWalletTab] = useState<WalletTab | null>(null);

	const { profile, isRegistered, refresh } = useScarf(connectedAddress);

	const balance = useWalletBalance(connectedAddress);
	const inbox = useInbox(connectedAddress, activeThreadId);
	const { threads, messagesByThread: messages, addPlaceholder } = inbox;

	const handleDisconnect = () => {
		disconnect();
		setActiveThreadId('');
	};

	const activeThread = threads.find((t) => t.id === activeThreadId);
	const peerAddress = useMemo(() => {
		if (activeThread?.kind !== 'direct') return undefined;
		return activeThread.participants.find((p) => p.toLowerCase() !== connectedAddress?.toLowerCase());
	}, [activeThread, connectedAddress]);

	/** Opens the direct chat with `other`, listing it right away even before any message. */
	const openDirectChat = useCallback(
		(other: string) => {
			if (!connectedAddress) return;
			const id = other.toLowerCase();
			addPlaceholder({
				id,
				kind: 'direct',
				title: shortAddress(other),
				participants: [connectedAddress, other],
				lastMessage: 'No messages yet',
				lastAt: Math.floor(Date.now() / 1000),
				unreadCount: 0,
			});
			setActiveThreadId(id);
		},
		[connectedAddress, addPlaceholder, setActiveThreadId]
	);

	// On desktop, land in the most recent conversation instead of an empty pane.
	useEffect(() => {
		if (!isMobile && !activeThreadId && !cFromUrl && threads.length > 0) setActiveThreadId(threads[0].id);
	}, [isMobile, activeThreadId, cFromUrl, threads, setActiveThreadId]);

	// Chat invite links (/app?to=0x…): open that chat, or prefill a new one, once we can act on it.
	const toFromUrl = searchParams.get('to');
	useEffect(() => {
		if (!toFromUrl || !connectedAddress || !isRegistered) return;
		const params = new URLSearchParams(searchParams.toString());
		params.delete('to');

		const other = toFromUrl.toLowerCase();
		if (ethers.isAddress(other) && other !== connectedAddress.toLowerCase()) {
			addPlaceholder({
				id: other,
				kind: 'direct',
				title: shortAddress(other),
				participants: [connectedAddress, other],
				lastMessage: 'No messages yet',
				lastAt: Math.floor(Date.now() / 1000),
				unreadCount: 0,
			});
			setActiveThreadIdState(other);
			params.set(CHAT_PARAM, other);
			isUserRegistered(other)
				.then((ok) => !ok && setError('That address hasn’t activated Scarf yet, so it can’t receive messages.'))
				.catch(() => {});
		}

		const qs = params.toString();
		router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
	}, [toFromUrl, connectedAddress, isRegistered, searchParams, pathname, router, addPlaceholder]);

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
		if (connectedAddress) checkRegistration();
	}, [connectedAddress]);

	// "Payment received" toasts. The inbox itself refreshes through useInbox.
	useEffect(() => {
		if (!connectedAddress) return;
		const contract = getReadOnlyContract();
		const me = connectedAddress.toLowerCase();
		const onPayment = async (messageId: string, amount: bigint) => {
			try {
				const msg = await fetchMessage(messageId);
				if (msg.recipient.toLowerCase() !== me) return;
				setPaymentNotification({ amount, token: msg.paymentToken, isReceived: true, from: msg.sender });
				balance.refresh();
			} catch (error) {
				console.error('Failed to load payment details:', error);
			}
		};
		contract.on(contract.getEvent('PaymentSettled'), onPayment).catch(() => {});
		return () => {
			contract.off(contract.getEvent('PaymentSettled'), onPayment).catch(() => {});
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
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

	const handleSendMessage = async (args: {
		text: string;
		ipfsHash?: string;
		mediaType?: number;
		fileSize?: bigint;
		paymentAmount?: ethers.BigNumberish;
		paymentToken?: ethers.AddressLike;
	}) => {
		if (!connectedAddress) {
			setError('Please connect your wallet first');
			throw new Error('Wallet not connected');
		}
		const thread = activeThread;
		if (!thread) {
			setError('Pick a conversation first');
			throw new Error('No active thread');
		}
		const me = connectedAddress.toLowerCase();
		const recipients = thread.participants.filter((p) => p.toLowerCase() !== me);
		if (recipients.length === 0) {
			setError('No recipients in this conversation');
			throw new Error('No recipients in conversation');
		}

		const isGroup = thread.kind === 'group';
		const amount = args.paymentAmount ? BigInt(args.paymentAmount) : BigInt(0);
		const paymentToken = args.paymentToken ? String(args.paymentToken) : ethers.ZeroAddress;
		if (isGroup && amount > BigInt(0)) {
			setError('Payments can only be sent in direct chats');
			throw new Error('Payments are direct-only');
		}

		const isText = !args.ipfsHash;
		const mediaType = isText ? 0 : (args.mediaType ?? 0);
		const fileSize = isText ? BigInt(0) : (args.fileSize ?? BigInt(0));
		// Captions travel with files too; the composer's "no caption" placeholder doesn't.
		const textContent = args.text === NO_CAPTION ? '' : args.text;
		// Group messages carry the group's tag so every member files them under the group.
		const messageHash = isGroup ? groupTag(thread.id) : ethers.keccak256(ethers.toUtf8Bytes(args.text));
		// The ETH payment check below; the paymaster can't relay ETH, so those go from the wallet.
		const paysEth = paymentToken === ethers.ZeroAddress && amount > BigInt(0);

		const pendingId = `pending-${Date.now()}`;
		inbox.addPending(thread.id, {
			id: pendingId,
			messageId: pendingId,
			author: 'You',
			timestamp: Math.floor(Date.now() / 1000),
			body: textContent,
			isSelf: true,
			status: 'pending',
			ipfsHash: args.ipfsHash,
			mediaType,
			fileSize,
			sender: connectedAddress,
			recipient: recipients[0],
			...(amount > BigInt(0) ? { paymentAmount: amount, paymentToken } : {}),
		});

		try {
			if (paysEth && balance.eth && balance.eth.raw < amount) {
				throw new Error(`Not enough ETH: you have ${balance.eth.formatted} ETH, and the network fee comes on top`);
			}

			if (isGroup) {
				// One batch, one copy per member. Each copy of a file needs its own IPFS string.
				const payload = {
					recipients,
					messageHashes: recipients.map(() => messageHash),
					ipfsHashes: recipients.map((_, i) => (isText ? '' : i === 0 ? args.ipfsHash! : `${args.ipfsHash}#${i}`)),
					mediaTypes: recipients.map(() => mediaType),
					fileSizes: recipients.map(() => fileSize),
					textContents: recipients.map(() => textContent),
				};
				if (isGaslessConfigured()) {
					const { request, signature } = await sendBatchMessagesGasless(payload);
					await submitSignedForwardRequest(request, signature);
				} else {
					await waitForTransaction(Promise.resolve(await sendBatchMessages(payload)));
				}
			} else {
				const message = {
					recipient: recipients[0],
					messageHash,
					ipfsHash: args.ipfsHash ?? '',
					mediaType,
					fileSize,
					paymentToken,
					paymentAmount: amount,
					textContent,
				};
				if (isGaslessConfigured() && !paysEth) {
					const { request, signature } = await sendChatMessageGasless(message);
					await submitSignedForwardRequest(request, signature);
				} else {
					const tx = await sendChatMessage({ ...message, value: paysEth ? amount : undefined });
					await waitForTransaction(Promise.resolve(tx));
				}
			}

			if (amount > BigInt(0)) {
				balance.refresh();
				setPaymentNotification({ amount, token: paymentToken, isReceived: false, to: recipients[0] });
			}
			await inbox.reload();
			refresh();
		} catch (error) {
			setError(getErrorMessage(error, 'Failed to send message'));
			throw error;
		} finally {
			inbox.removePending(thread.id, pendingId);
		}
	};

	const closeDrawers = () => {
		setSidebarOpen(false);
		setConversationsSidebarOpen(false);
	};
	const drawerOpen = isMobile && (sidebarOpen || conversationsSidebarOpen);

	if (needsRegistration && connectedAddress) {
		return (
			<div className='grid min-h-[calc(100svh-var(--bar-h))] place-items-center p-4'>
				<div className='w-full max-w-[30rem]'>
					<UserRegistration
						address={connectedAddress}
						onRegistered={() => {
							setNeedsRegistration(false);
							checkRegistration();
							inbox.reload();
						}}
					/>
				</div>
			</div>
		);
	}

	return (
		// Fills the viewport below the site bar.
		<div className='mx-auto h-[calc(100svh-var(--bar-h))] w-full max-w-[1480px] p-3 lg:p-4'>
			<div className='relative flex h-full gap-4'>
				{drawerOpen && <div className='scrim z-[55]' aria-hidden onClick={closeDrawers} />}

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
					balance={balance}
					onOpenWallet={(tab) => {
						setWalletTab(tab);
						if (isMobile) setSidebarOpen(false);
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

				<main className='glass relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-[var(--r-card)]' data-lg='surface' data-lg-r='28' data-lg-tint='card'>
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
							key={activeThreadId}
							thread={activeThreadId ? activeThread : undefined}
							connectedAddress={connectedAddress}
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
							<div className='relative min-h-0 flex-1 overflow-y-auto'>
								<MessageList
									key={activeThreadId}
									messages={messages[activeThreadId] ?? []}
									thread={activeThread}
									isLoading={inbox.loading}
									onDeleted={(id) => {
										inbox.markDeleted(id);
										refresh();
									}}
									onError={setError}
									connectedAddress={connectedAddress}
								/>
							</div>
							<MessageInput
								key={activeThreadId}
								onSend={handleSendMessage}
								disabled={!connectedAddress || !isRegistered}
								allowPayments={activeThread?.kind !== 'group'}
								placeholder={
									activeThread?.kind === 'group'
										? `Message ${activeThread.participants.length} people…`
										: activeThread
											? `Message ${activeThread.title}…`
											: undefined
								}
							/>
						</>
					) : (
						<EmptyState
							connected={Boolean(connectedAddress)}
							onShareAddress={() => setWalletTab('receive')}
							onNewConversation={() => {
								if (!connectedAddress) {
									setError('Please connect your wallet to create a new conversation');
									return;
								}
								setShowCreateConversation(true);
							}}
						/>
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
					onNewConversation={() => {
						setShowCreateConversation(true);
						if (isMobile) setConversationsSidebarOpen(false);
					}}
				/>
			</div>

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
				<Modal onDismiss={() => setShowCreateConversation(false)}>
					<CreateConversation
						currentUser={connectedAddress}
						onCreated={(threadId, participants) => {
							setShowCreateConversation(false);
							if (participants.length <= 2) {
								const other = participants.find((p) => p.toLowerCase() !== connectedAddress.toLowerCase());
								if (other) openDirectChat(other);
								return;
							}
							const group: Thread = {
								id: threadId,
								kind: 'group',
								title: groupTitle(connectedAddress, participants),
								participants,
								lastMessage: 'Group created',
								lastAt: Math.floor(Date.now() / 1000),
								unreadCount: 0,
							};
							inbox.addPlaceholder(group);
							setActiveThreadId(threadId);
							inbox.reload();
						}}
						onCancel={() => setShowCreateConversation(false)}
					/>
				</Modal>
			)}

			{walletTab && connectedAddress && (
				<WalletHub
					address={connectedAddress}
					balance={balance}
					tab={walletTab}
					onTabChange={setWalletTab}
					defaultRecipient={peerAddress}
					onPaymentHistory={() => {
						setWalletTab(null);
						setShowPaymentHistory(true);
					}}
					onDisconnect={() => {
						setWalletTab(null);
						handleDisconnect();
					}}
					onClose={() => setWalletTab(null)}
				/>
			)}

			{showProfileSettings && (
				<Modal onDismiss={() => setShowProfileSettings(false)}>
					<ProfileSettings
						onUpdate={() => {
							refresh();
							inbox.reload();
						}}
						onClose={() => setShowProfileSettings(false)}
					/>
				</Modal>
			)}

			{showBatchMessaging && (
				<Modal maxWidth='42rem' onDismiss={() => setShowBatchMessaging(false)}>
					<BatchMessaging
						onComplete={() => {
							setShowBatchMessaging(false);
							inbox.reload();
							refresh();
						}}
						onCancel={() => setShowBatchMessaging(false)}
					/>
				</Modal>
			)}
		</div>
	);

}
