'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AddressLike, BytesLike } from 'ethers';
import {
	fetchUserProfile,
	fetchUserMessages,
	fetchMessage,
	fetchConversation,
	fetchContractStats,
	fetchStorageUsage,
	isUserRegistered,
	getUserConversations,
	getUserMessageCount,
	registerUser,
	updatePublicKey,
	updateLastSeen,
	sendWhisper,
	markDelivered,
	markRead,
	deleteWhisper,
	createConversation,
	waitForTransaction,
} from '@WhisperChain/lib/whisperchainActions';

type UserProfile = {
	publicKey: string;
	isActive: boolean;
	lastSeen: bigint;
	username: string;
};

type Message = {
	sender: string;
	recipient: string;
	messageHash: string;
	timestamp: bigint;
	delivered: boolean;
	read: boolean;
	paymentAmount: bigint;
	paymentToken: string;
	ipfsHash: string;
	mediaType: number;
	fileSize: bigint;
	textContent: string;
};

type Conversation = {
	participants: string[];
	conversationKey: string;
	createdAt: bigint;
	isActive: boolean;
	messageCount: bigint;
};

export function useWhisperChain(userAddress?: string) {
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [isRegistered, setIsRegistered] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const loadProfile = useCallback(async (address: AddressLike) => {
		try {
			setIsLoading(true);
			setError(null);
			const profileData = await fetchUserProfile(address);
			setProfile({
				publicKey: profileData.publicKey,
				isActive: profileData.isActive,
				lastSeen: profileData.lastSeen,
				username: profileData.username,
			});
			setIsRegistered(profileData.isActive);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const loadMessages = useCallback(async (address: AddressLike) => {
		try {
			setIsLoading(true);
			setError(null);
			const messageIds = await fetchUserMessages(address);
			const messagePromises = messageIds.map((id) => fetchMessage(id));
			const messageData = await Promise.all(messagePromises);
			setMessages(
				messageData.map((msg) => ({
					sender: msg.sender,
					recipient: msg.recipient,
					messageHash: msg.messageHash,
					timestamp: msg.timestamp,
					delivered: msg.delivered,
					read: msg.read,
					paymentAmount: msg.paymentAmount,
					paymentToken: msg.paymentToken,
					ipfsHash: msg.ipfsHash,
					mediaType: Number(msg.mediaType),
					fileSize: msg.fileSize,
					textContent: msg.textContent || '',
				}))
			);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const loadConversations = useCallback(async (address: AddressLike) => {
		try {
			setIsLoading(true);
			setError(null);
			const conversationIds = await getUserConversations(address);
			if (Array.isArray(conversationIds)) {
				const conversationPromises = conversationIds.map((id: BytesLike) =>
					fetchConversation(id)
				);
				const conversationData = await Promise.all(conversationPromises);
				setConversations(conversationData);
			}
		} catch (err: any) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const checkRegistration = useCallback(async (address: AddressLike) => {
		try {
			const registered = await isUserRegistered(address);
			setIsRegistered(registered);
			return registered;
		} catch (err: any) {
			setError(err.message);
			return false;
		}
	}, []);

	useEffect(() => {
		if (userAddress) {
			loadProfile(userAddress);
			loadMessages(userAddress);
			loadConversations(userAddress);
			checkRegistration(userAddress);
		}
	}, [
		userAddress,
		loadProfile,
		loadMessages,
		loadConversations,
		checkRegistration,
	]);

	return {
		profile,
		messages,
		conversations,
		isRegistered,
		isLoading,
		error,
		loadProfile,
		loadMessages,
		loadConversations,
		checkRegistration,
		refresh: () => {
			if (userAddress) {
				loadProfile(userAddress);
				loadMessages(userAddress);
				loadConversations(userAddress);
			}
		},
	};
}
