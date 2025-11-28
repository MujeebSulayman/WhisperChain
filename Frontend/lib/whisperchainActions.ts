'use client';

import type { AddressLike, BigNumberish, BytesLike } from 'ethers';
import { ZeroAddress } from 'ethers';

import {
	connectWhisperChain,
	getReadOnlyContract,
	type WhisperChain,
} from './blockchain';

async function getSignerContract() {
	const { contract } = await connectWhisperChain();
	return contract;
}

function toMediaType(value: BigNumberish | undefined) {
	return value ?? 0;
}

export async function waitForTransaction(
	txPromise: Promise<{ wait: () => Promise<any> }>
) {
	try {
		const tx = await txPromise;
		const receipt = await tx.wait();
		return receipt;
	} catch (error: any) {
		if (error?.code === 4001) {
			throw new Error('Transaction rejected by user');
		}
		if (error?.reason) {
			throw new Error(`Transaction failed: ${error.reason}`);
		}
		if (error?.message) {
			throw new Error(`Transaction failed: ${error.message}`);
		}
		throw error;
	}
}

export async function registerUser(args: {
	publicKey: BytesLike;
	username: string;
}) {
	const contract = await getSignerContract();
	return contract.registerUser(args.publicKey, args.username);
}

export async function updatePublicKey(newKey: BytesLike) {
	const contract = await getSignerContract();
	return contract.updatePublicKey(newKey);
}

export async function sendWhisper(args: {
	recipient: AddressLike;
	messageHash: BytesLike;
	ipfsHash: string;
	mediaType?: BigNumberish;
	fileSize: BigNumberish;
	paymentToken?: AddressLike;
	paymentAmount?: BigNumberish;
	value?: BigNumberish;
}) {
	const contract = await getSignerContract();
	const paymentToken = args.paymentToken ?? ZeroAddress;
	const paymentAmount = args.paymentAmount ?? BigInt(0);
	const overrides =
		args.value !== undefined
			? { value: args.value }
			: paymentToken === ZeroAddress && paymentAmount
			? { value: paymentAmount }
			: undefined;

	if (overrides) {
		return contract.sendMessage(
			args.recipient,
			args.messageHash,
			paymentToken,
			paymentAmount,
			args.ipfsHash,
			toMediaType(args.mediaType),
			args.fileSize,
			overrides
		);
	}

	return contract.sendMessage(
		args.recipient,
		args.messageHash,
		paymentToken,
		paymentAmount,
		args.ipfsHash,
		toMediaType(args.mediaType),
		args.fileSize
	);
}

export async function markDelivered(messageId: BytesLike) {
	const contract = await getSignerContract();
	return contract.markAsDelivered(messageId);
}

export async function markRead(messageId: BytesLike) {
	const contract = await getSignerContract();
	return contract.markAsRead(messageId);
}

export async function deleteWhisper(messageId: BytesLike) {
	const contract = await getSignerContract();
	return contract.deleteMessage(messageId);
}

export async function createConversation(args: {
	participants: AddressLike[];
	conversationKeyHash: BytesLike;
}) {
	const contract = await getSignerContract();
	return contract.createConversation(
		args.participants,
		args.conversationKeyHash
	);
}

export async function fetchUserProfile(user: AddressLike) {
	try {
		const contract = getReadOnlyContract();
		return await contract.userProfiles(user);
	} catch (error: any) {
		throw new Error(`Failed to fetch user profile: ${error.message}`);
	}
}

export async function fetchConversation(conversationId: BytesLike) {
	try {
		const contract = getReadOnlyContract();
		return await contract.getConversation(conversationId);
	} catch (error: any) {
		throw new Error(`Failed to fetch conversation: ${error.message}`);
	}
}

export async function fetchMessage(messageId: BytesLike) {
	try {
		const contract = getReadOnlyContract();
		return await contract.getMessage(messageId);
	} catch (error: any) {
		throw new Error(`Failed to fetch message: ${error.message}`);
	}
}

export async function fetchUserMessages(user: AddressLike) {
	try {
		const contract = getReadOnlyContract();
		return await contract.getUserMessages(user);
	} catch (error: any) {
		throw new Error(`Failed to fetch user messages: ${error.message}`);
	}
}

export async function fetchContractStats() {
	try {
		const contract = getReadOnlyContract();
		const stats = await contract.getContractStats();
		return {
			pendingPayments: stats[0],
			processedMessages: stats[1],
			treasuryBalance: stats[2],
		};
	} catch (error: any) {
		throw new Error(`Failed to fetch contract stats: ${error.message}`);
	}
}

export async function fetchStorageUsage(user: AddressLike) {
	try {
		const contract = getReadOnlyContract();
		const used = await contract.getUserStorageUsed(user);
		const remaining = await contract.getRemainingStorage(user);
		return { used, remaining };
	} catch (error: any) {
		throw new Error(`Failed to fetch storage usage: ${error.message}`);
	}
}

export async function updateLastSeen() {
	const contract = await getSignerContract();
	return contract.updateLastSeen();
}

export async function withdrawBalance() {
	const contract = await getSignerContract();
	return contract.withdrawBalance();
}

export async function clearStorage() {
	const contract = await getSignerContract();
	return contract.clearStorage();
}

export async function isUserRegistered(user: AddressLike) {
	try {
		const contract = getReadOnlyContract();
		return await contract.isUserRegistered(user);
	} catch (error: any) {
		throw new Error(`Failed to check registration: ${error.message}`);
	}
}

export async function getUserConversations(user: AddressLike) {
	try {
		const contract = getReadOnlyContract();
		const conversations: BytesLike[] = [];
		let index = 0;
		while (true) {
			try {
				const convId = await contract.userConversations(user, index);
				if (
					convId ===
					'0x0000000000000000000000000000000000000000000000000000000000000000'
				) {
					break;
				}
				conversations.push(convId);
				index++;
				if (index > 100) break;
			} catch {
				break;
			}
		}
		return conversations;
	} catch (error: any) {
		throw new Error(`Failed to fetch conversations: ${error.message}`);
	}
}

export async function getUserMessageCount(user: AddressLike) {
	try {
		const contract = getReadOnlyContract();
		return await contract.getUserMessageCount(user);
	} catch (error: any) {
		throw new Error(`Failed to fetch message count: ${error.message}`);
	}
}

export async function isMessageDeleted(messageId: BytesLike) {
	try {
		const contract = getReadOnlyContract();
		return await contract.isMessageDeleted(messageId);
	} catch (error: any) {
		throw new Error(`Failed to check message status: ${error.message}`);
	}
}

export async function sendBatchMessages(args: {
	recipients: AddressLike[];
	messageHashes: BytesLike[];
	ipfsHashes: string[];
	mediaTypes?: BigNumberish[];
	fileSizes: BigNumberish[];
	paymentTokens?: AddressLike[];
	paymentAmounts?: BigNumberish[];
	value?: BigNumberish;
}) {
	const contract = await getSignerContract();
	const paymentTokens =
		args.paymentTokens ?? args.recipients.map(() => ZeroAddress);
	const paymentAmounts =
		args.paymentAmounts ?? args.recipients.map(() => BigInt(0));
	const mediaTypes = args.mediaTypes ?? args.recipients.map(() => 0);

	const overrides =
		args.value !== undefined ? { value: args.value } : undefined;

	if (overrides) {
		return contract.sendBatchMessages(
			args.recipients,
			args.messageHashes,
			paymentTokens,
			paymentAmounts,
			args.ipfsHashes,
			mediaTypes,
			args.fileSizes,
			overrides
		);
	}

	return contract.sendBatchMessages(
		args.recipients,
		args.messageHashes,
		paymentTokens,
		paymentAmounts,
		args.ipfsHashes,
		mediaTypes,
		args.fileSizes
	);
}

export async function getUserPublicKey(user: AddressLike) {
	try {
		const contract = getReadOnlyContract();
		return await contract.getUserPublicKey(user);
	} catch (error: any) {
		throw new Error(`Failed to fetch public key: ${error.message}`);
	}
}

export async function isIPFSHashUsed(ipfsHash: string) {
	try {
		const contract = getReadOnlyContract();
		return await contract.isIPFSHashUsed(ipfsHash);
	} catch (error: any) {
		throw new Error(`Failed to check IPFS hash: ${error.message}`);
	}
}

export type WhisperChainRead = ReturnType<typeof getReadOnlyContract>;
export type WhisperChainWrite = WhisperChain;
