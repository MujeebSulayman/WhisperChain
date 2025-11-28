'use client';

import { useState, useEffect, useCallback } from 'react';
import { connectWhisperChain } from '@WhisperChain/lib/blockchain';

const WALLET_STORAGE_KEY = 'whisperchain_connected_wallet';

export function useWallet() {
	const [connectedAddress, setConnectedAddress] = useState<
		string | undefined
	>();
	const [isConnecting, setIsConnecting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Load saved wallet on mount
	useEffect(() => {
		const loadSavedWallet = async () => {
			if (typeof window === 'undefined') return;

			const savedAddress = localStorage.getItem(WALLET_STORAGE_KEY);
			if (!savedAddress) return;

			// Check if wallet is still connected
			const ethereum = (window as typeof window & { ethereum?: any }).ethereum;
			if (!ethereum) {
				localStorage.removeItem(WALLET_STORAGE_KEY);
				return;
			}

			try {
				// Check if we have permission to access accounts
				const accounts = await ethereum.request({ method: 'eth_accounts' });
				if (
					accounts.length > 0 &&
					accounts[0].toLowerCase() === savedAddress.toLowerCase()
				) {
					// Wallet is still connected, restore state
					setConnectedAddress(accounts[0]);
				} else {
					// Account changed or disconnected, clear storage
					localStorage.removeItem(WALLET_STORAGE_KEY);
				}
			} catch (error) {
				// Failed to check accounts, clear storage
				localStorage.removeItem(WALLET_STORAGE_KEY);
			}
		};

		loadSavedWallet();
	}, []);

	// Listen for account changes
	useEffect(() => {
		if (typeof window === 'undefined') return;

		const ethereum = (window as typeof window & { ethereum?: any }).ethereum;
		if (!ethereum) return;

		const handleAccountsChanged = (accounts: string[]) => {
			if (accounts.length > 0) {
				const address = accounts[0];
				setConnectedAddress(address);
				localStorage.setItem(WALLET_STORAGE_KEY, address);
			} else {
				// User disconnected wallet
				setConnectedAddress(undefined);
				localStorage.removeItem(WALLET_STORAGE_KEY);
			}
		};

		const handleChainChanged = () => {
			// Reload page on chain change to ensure proper state
			window.location.reload();
		};

		ethereum.on('accountsChanged', handleAccountsChanged);
		ethereum.on('chainChanged', handleChainChanged);

		return () => {
			ethereum.removeListener('accountsChanged', handleAccountsChanged);
			ethereum.removeListener('chainChanged', handleChainChanged);
		};
	}, []);

	const connect = useCallback(async () => {
		setIsConnecting(true);
		setError(null);

		try {
			const { signer } = await connectWhisperChain();
			// Get address, catching ENS errors (Base Sepolia doesn't support ENS)
			let address: string;
			try {
				address = await signer.getAddress();
			} catch (ensError: any) {
				// If ENS error, try getting address directly from provider
				if (
					ensError.code === 'UNSUPPORTED_OPERATION' &&
					ensError.operation === 'getEnsAddress'
				) {
					const provider = signer.provider;
					if (provider) {
						const accounts = await (provider as any).send('eth_accounts', []);
						if (accounts && accounts.length > 0) {
							address = accounts[0];
						} else {
							throw new Error('No accounts found');
						}
					} else {
						throw new Error('Provider not available');
					}
				} else {
					throw ensError;
				}
			}
			setConnectedAddress(address);
			localStorage.setItem(WALLET_STORAGE_KEY, address);
		} catch (err: any) {
			setError(err.message || 'Failed to connect wallet');
			throw err;
		} finally {
			setIsConnecting(false);
		}
	}, []);

	const disconnect = useCallback(() => {
		setConnectedAddress(undefined);
		localStorage.removeItem(WALLET_STORAGE_KEY);
	}, []);

	return {
		connectedAddress,
		isConnecting,
		error,
		connect,
		disconnect,
	};
}
