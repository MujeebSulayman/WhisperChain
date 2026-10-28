/*
 * Turns raw on-chain messages into the inbox: one thread per person (direct chats) plus one
 * per group conversation.
 *
 * The contract only knows 1:1 messages (sender -> recipient). Two app-level conventions
 * layer groups on top without a contract change:
 *  - A group message is a batch send to every other member, and its messageHash is the
 *    group's tag (groupTag). That is how a recipient files it under the group, not the DM.
 *  - The contract refuses to reuse an IPFS hash, so each copy of a file in a batch gets a
 *    "#n" suffix. Gateways ignore URL fragments, so the link still works; baseIpfsHash
 *    strips it for comparison.
 */
import { keccak256, solidityPacked, ZeroAddress } from 'ethers';
import { findPaymentAsset } from './deployments';
import { formatDisplayAmount } from './token';

export type RawMessage = {
	id: string;
	sender: string;
	recipient: string;
	messageHash: string;
	timestamp: number;
	paymentAmount: bigint;
	paymentToken: string;
	ipfsHash: string;
	mediaType: number;
	fileSize: bigint;
	textContent: string;
};

export type RawConversation = {
	id: string;
	participants: string[];
	createdAt: number;
};

export type ChatMessage = {
	id: string;
	messageId: string;
	author: string;
	timestamp: number;
	body: string;
	isSelf: boolean;
	/** "pending" only while it's being sent; anything read from the chain is "delivered". */
	status: 'pending' | 'delivered' | 'read';
	messageHash?: string;
	ipfsHash?: string;
	mediaType?: number;
	fileSize?: bigint;
	sender: string;
	recipient: string;
	paymentAmount?: bigint;
	paymentToken?: string;
};

export type Thread = {
	id: string;
	kind: 'direct' | 'group';
	title: string;
	participants: string[];
	lastMessage: string;
	/** Unix seconds of the latest message, or of creation for an empty group. */
	lastAt: number;
	unreadCount: number;
	createdAt?: number;
};

export const MAX_GROUP_RECIPIENTS = 10;
/** Placeholder text the composer sends for a file with no caption. */
export const NO_CAPTION = 'Media message';

export const shortAddress = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`;

export const groupTag = (conversationId: string) =>
	keccak256(solidityPacked(['string', 'bytes32'], ['scarf-group', conversationId]));

export const baseIpfsHash = (hash: string) => hash.split('#')[0];

const MEDIA_LABEL: Record<number, string> = { 1: '📷 Photo', 2: '🎬 Video', 3: '🎵 Audio', 4: '📄 Document' };

function paymentLabel(m: Pick<ChatMessage, 'paymentAmount' | 'paymentToken'>) {
	if (!m.paymentAmount || m.paymentAmount <= BigInt(0)) return '';
	const asset = findPaymentAsset(m.paymentToken ?? ZeroAddress);
	return asset ? `💸 ${formatDisplayAmount(m.paymentAmount, asset.decimals)} ${asset.symbol}` : '💸 Payment';
}

/** One line for the thread list: "You: hi", "0x12…34: 📷 Photo", "💸 5 USDC". */
export function previewText(m: ChatMessage, inGroup: boolean) {
	const content = m.body || MEDIA_LABEL[m.mediaType ?? 0] || paymentLabel(m) || 'Message';
	const prefix = m.isSelf ? 'You: ' : inGroup ? `${shortAddress(m.sender)}: ` : '';
	return prefix + content;
}

export function groupTitle(me: string, participants: string[]) {
	const others = participants.filter((p) => p.toLowerCase() !== me.toLowerCase());
	const names = others.slice(0, 2).map(shortAddress).join(', ');
	return others.length > 2 ? `${names} +${others.length - 2}` : names;
}

function toChatMessage(me: string, r: RawMessage): ChatMessage {
	const isSelf = r.sender.toLowerCase() === me;
	const caption = r.textContent === NO_CAPTION ? '' : r.textContent;
	return {
		id: r.id,
		messageId: r.id,
		author: isSelf ? 'You' : shortAddress(r.sender),
		timestamp: r.timestamp,
		body: caption,
		isSelf,
		status: 'delivered',
		messageHash: r.messageHash,
		ipfsHash: r.ipfsHash || undefined,
		mediaType: r.mediaType,
		fileSize: r.fileSize,
		sender: r.sender,
		recipient: r.recipient,
		paymentAmount: r.paymentAmount,
		paymentToken: r.paymentToken,
	};
}

export function buildInbox(
	meRaw: string,
	raws: RawMessage[],
	conversations: RawConversation[],
	lastRead: Record<string, number>,
) {
	const me = meRaw.toLowerCase();
	const lower = (a: string) => a.toLowerCase();
	const mine = conversations.filter((c) => c.participants.some((p) => lower(p) === me));
	const groups = mine.filter((c) => c.participants.length > 2);
	const groupByTag = new Map(groups.map((g) => [lower(groupTag(g.id)), g]));

	const byThread: Record<string, ChatMessage[]> = {};
	// A group send is one batch: N copies with the same sender, time and content. Show it once.
	const groupSends = new Set<string>();

	for (const r of raws) {
		const group = groupByTag.get(lower(r.messageHash));
		const members = group?.participants.map(lower);
		const inGroup = Boolean(members?.includes(lower(r.sender)) && members?.includes(lower(r.recipient)));
		const isSelf = lower(r.sender) === me;
		const threadId = inGroup ? group!.id : lower(isSelf ? r.recipient : r.sender);

		if (inGroup && isSelf) {
			const key = [threadId, r.timestamp, baseIpfsHash(r.ipfsHash), r.textContent].join('|');
			if (groupSends.has(key)) continue;
			groupSends.add(key);
		}
		(byThread[threadId] ??= []).push(toChatMessage(me, r));
	}
	for (const list of Object.values(byThread)) list.sort((a, b) => a.timestamp - b.timestamp);

	const threads = new Map<string, Thread>();
	const unread = (id: string) =>
		(byThread[id] ?? []).filter((m) => !m.isSelf && m.timestamp > (lastRead[id] ?? 0)).length;

	for (const g of groups) {
		const last = byThread[g.id]?.at(-1);
		threads.set(g.id, {
			id: g.id,
			kind: 'group',
			title: groupTitle(me, g.participants),
			participants: g.participants,
			lastMessage: last ? previewText(last, true) : 'Group created',
			lastAt: last?.timestamp ?? g.createdAt,
			unreadCount: unread(g.id),
			createdAt: g.createdAt,
		});
	}

	const addDirect = (other: string, createdAt?: number) => {
		const id = lower(other);
		if (threads.has(id)) return;
		const last = byThread[id]?.at(-1);
		threads.set(id, {
			id,
			kind: 'direct',
			title: shortAddress(other),
			participants: [meRaw, other],
			lastMessage: last ? previewText(last, false) : 'No messages yet',
			lastAt: last?.timestamp ?? createdAt ?? 0,
			unreadCount: unread(id),
			createdAt,
		});
	};
	for (const id of Object.keys(byThread)) if (!threads.has(id)) addDirect(byThread[id][0].isSelf ? byThread[id][0].recipient : byThread[id][0].sender);
	// Older 2-person on-chain conversations are just direct chats.
	for (const c of mine.filter((c) => c.participants.length === 2)) {
		const other = c.participants.find((p) => lower(p) !== me);
		if (other) addDirect(other, c.createdAt);
	}

	return {
		threads: [...threads.values()].sort((a, b) => b.lastAt - a.lastAt),
		messagesByThread: byThread,
	};
}
