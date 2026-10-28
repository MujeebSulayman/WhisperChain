'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getReadOnlyContract } from '@/lib/blockchain';
import { buildInbox, type ChatMessage, type RawConversation, type RawMessage, type Thread } from '@/lib/inbox';

const POLL_MS = 10_000;
/** How many of the newest messages to keep in the inbox. */
const MAX_MESSAGES = 300;
const FETCH_CONCURRENCY = 20;
const ZERO_ID = '0x' + '0'.repeat(64);

const readKey = (address: string) => `scarf:lastRead:${address.toLowerCase()}`;

function loadLastRead(address: string): Record<string, number> | null {
	try {
		const raw = localStorage.getItem(readKey(address));
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

function saveLastRead(address: string, value: Record<string, number>) {
	try {
		localStorage.setItem(readKey(address), JSON.stringify(value));
	} catch {
		// Private mode or blocked storage: unread counts just won't persist.
	}
}

async function fetchRawMessage(id: string): Promise<RawMessage | null> {
	const contract = getReadOnlyContract();
	const [m, deleted] = await Promise.all([contract.getMessage(id), contract.isMessageDeleted(id).catch(() => false)]);
	if (deleted || m.sender === '0x0000000000000000000000000000000000000000') return null;

	const raw: RawMessage = {
		id,
		sender: m.sender,
		recipient: m.recipient,
		messageHash: m.messageHash,
		timestamp: Number(m.timestamp),
		paymentAmount: m.paymentAmount,
		paymentToken: m.paymentToken,
		ipfsHash: (m.ipfsHash ?? '').trim(),
		mediaType: Number(m.mediaType),
		fileSize: m.fileSize,
		textContent: (m.textContent ?? '').trim(),
	};
	// Very old text messages stored their text on IPFS instead of in the contract.
	if (raw.mediaType === 0 && !raw.textContent && raw.ipfsHash && !raw.ipfsHash.startsWith('text-')) {
		try {
			const { downloadTextFromIPFS } = await import('@/lib/ipfs');
			raw.textContent = await downloadTextFromIPFS(raw.ipfsHash);
		} catch {
			raw.textContent = '';
		}
	}
	return raw;
}

/*
 * The connected wallet's inbox, read from the Scarf contract. Messages never change once sent,
 * so each is fetched once and cached; polling only asks for the id list and anything new.
 * `activeThreadId` is marked read as messages arrive in it.
 */
export function useInbox(address: string | undefined, activeThreadId: string) {
	const [raws, setRaws] = useState<RawMessage[]>([]);
	const [conversations, setConversations] = useState<RawConversation[]>([]);
	const [loaded, setLoaded] = useState(false);
	const [pending, setPending] = useState<Record<string, ChatMessage[]>>({});
	const [placeholders, setPlaceholders] = useState<Record<string, Thread>>({});
	const [lastRead, setLastRead] = useState<Record<string, number>>({});

	const messageCache = useRef(new Map<string, RawMessage | null>());
	const conversationIds = useRef<string[]>([]);
	const conversationCache = useRef(new Map<string, RawConversation>());
	const running = useRef<Promise<void> | null>(null);
	// No saved read state yet (first visit on this device): treat existing history as read.
	const seedReadState = useRef(false);

	useEffect(() => {
		messageCache.current = new Map();
		conversationIds.current = [];
		conversationCache.current = new Map();
		setRaws([]);
		setConversations([]);
		setPending({});
		setPlaceholders({});
		setLoaded(false);
		if (!address) return;
		const saved = loadLastRead(address);
		seedReadState.current = saved === null;
		setLastRead(saved ?? {});
	}, [address]);

	const load = useCallback(async () => {
		if (!address) return;
		try {
			const contract = getReadOnlyContract();

			// New conversation ids are appended, so only look past the ones already known.
			for (let i = conversationIds.current.length; i < 200; i++) {
				let id: string;
				try {
					id = await contract.userConversations(address, i);
				} catch {
					break;
				}
				if (!id || id === ZERO_ID) break;
				conversationIds.current.push(id);
			}
			await Promise.all(
				conversationIds.current
					.filter((id) => !conversationCache.current.has(id))
					.map(async (id) => {
						try {
							const c = await contract.getConversation(id);
							conversationCache.current.set(id, {
								id,
								participants: [...c.participants],
								createdAt: Number(c.createdAt),
							});
						} catch {
							// Skip a conversation that can't be read; it's retried next poll.
						}
					}),
			);

			const ids: string[] = [...(await contract.getUserMessages(address))].slice(-MAX_MESSAGES);
			const missing = ids.filter((id) => !messageCache.current.has(id));
			for (let i = 0; i < missing.length; i += FETCH_CONCURRENCY) {
				await Promise.all(
					missing.slice(i, i + FETCH_CONCURRENCY).map(async (id) => {
						try {
							messageCache.current.set(id, await fetchRawMessage(id));
						} catch {
							// Not cached, so it's retried on the next poll.
						}
					}),
				);
			}

			setConversations([...conversationCache.current.values()]);
			setRaws(ids.map((id) => messageCache.current.get(id)).filter((m): m is RawMessage => Boolean(m)));
			setLoaded(true);
		} catch (err) {
			console.error('Failed to load inbox:', err);
		}
	}, [address]);

	// Runs one load at a time. A caller arriving mid-load waits for it and then loads again,
	// so a message that just landed is never missed by a load that started before it.
	const reload = useCallback(async () => {
		while (running.current) await running.current;
		const run = load();
		running.current = run;
		try {
			await run;
		} finally {
			if (running.current === run) running.current = null;
		}
	}, [load]);

	// Poll while the tab is visible, and react to contract events touching this wallet.
	useEffect(() => {
		if (!address) return;
		reload();
		const timer = setInterval(() => document.visibilityState === 'visible' && reload(), POLL_MS);
		const onVisible = () => document.visibilityState === 'visible' && reload();
		document.addEventListener('visibilitychange', onVisible);

		const contract = getReadOnlyContract();
		const me = address.toLowerCase();
		const onMessage = (_id: string, sender: string, recipient: string) => {
			if (sender.toLowerCase() === me || recipient.toLowerCase() === me) reload();
		};
		const onConversation = (_id: string, participants: string[]) => {
			if (participants.some((p) => p.toLowerCase() === me)) reload();
		};
		contract.on(contract.getEvent('MessageSent'), onMessage).catch(() => {});
		contract.on(contract.getEvent('ConversationCreated'), onConversation).catch(() => {});

		return () => {
			clearInterval(timer);
			document.removeEventListener('visibilitychange', onVisible);
			contract.off(contract.getEvent('MessageSent'), onMessage).catch(() => {});
			contract.off(contract.getEvent('ConversationCreated'), onConversation).catch(() => {});
		};
	}, [address, reload]);

	const inbox = useMemo(
		() => (address ? buildInbox(address, raws, conversations, lastRead) : { threads: [], messagesByThread: {} }),
		[address, raws, conversations, lastRead],
	);

	const markRead = useCallback(
		(updates: Record<string, number>) => {
			if (!address) return;
			setLastRead((prev) => {
				const next = { ...prev };
				let changed = false;
				for (const [id, at] of Object.entries(updates)) {
					if ((next[id] ?? 0) < at) {
						next[id] = at;
						changed = true;
					}
				}
				if (!changed) return prev;
				saveLastRead(address, next);
				return next;
			});
		},
		[address],
	);

	useEffect(() => {
		if (!loaded || !seedReadState.current) return;
		seedReadState.current = false;
		markRead(Object.fromEntries(inbox.threads.map((t) => [t.id, t.lastAt])));
	}, [loaded, inbox.threads, markRead]);

	// Opening a thread, or a message landing in the open one, marks it read.
	const activeLastAt = inbox.messagesByThread[activeThreadId]?.at(-1)?.timestamp ?? 0;
	useEffect(() => {
		if (activeThreadId && activeLastAt) markRead({ [activeThreadId]: activeLastAt });
	}, [activeThreadId, activeLastAt, markRead]);

	const threads = useMemo(() => {
		const real = new Set(inbox.threads.map((t) => t.id));
		const extra = Object.values(placeholders).filter((t) => !real.has(t.id));
		return [...extra, ...inbox.threads].map((t) => (t.id === activeThreadId ? { ...t, unreadCount: 0 } : t));
	}, [inbox.threads, placeholders, activeThreadId]);

	const messagesByThread = useMemo(() => {
		const merged: Record<string, ChatMessage[]> = { ...inbox.messagesByThread };
		for (const [id, list] of Object.entries(pending)) merged[id] = [...(merged[id] ?? []), ...list];
		return merged;
	}, [inbox.messagesByThread, pending]);

	return {
		threads,
		messagesByThread,
		/** True only for the very first load, so polling never flickers a spinner. */
		loading: Boolean(address) && !loaded,
		reload,
		/** Shows a message immediately while it's being sent. */
		addPending: useCallback((threadId: string, message: ChatMessage) => {
			setPending((prev) => ({ ...prev, [threadId]: [...(prev[threadId] ?? []), message] }));
		}, []),
		removePending: useCallback((threadId: string, id: string) => {
			setPending((prev) => ({ ...prev, [threadId]: (prev[threadId] ?? []).filter((m) => m.id !== id) }));
		}, []),
		/** Lists a thread before it has any messages (a new DM, or a group still being indexed). */
		addPlaceholder: useCallback((thread: Thread) => {
			setPlaceholders((prev) => ({ ...prev, [thread.id]: thread }));
		}, []),
		/** Hides a message the user just deleted without waiting for a reload. */
		markDeleted: useCallback((id: string) => {
			messageCache.current.set(id, null);
			setRaws((prev) => prev.filter((m) => m.id !== id));
		}, []),
	};
}
