'use client';

import type { JsonRpcSigner } from 'ethers';
import {
	BrowserProvider,
	Contract,
	JsonRpcProvider,
	type ContractRunner,
	type Eip1193Provider,
} from 'ethers';
import { WhisperChain__factory } from '@WhisperChain/typechain/factories/WhisperChain__factory';
import type { WhisperChain } from '@WhisperChain/typechain/WhisperChain';

export type { WhisperChain } from '@WhisperChain/typechain/WhisperChain';

export const BASE_CHAIN = {
	id: 84532,
	name: 'Base Sepolia',
	rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC ?? 'https://sepolia.base.org',
	explorer: 'https://sepolia.basescan.org',
} as const;

const DEPLOYED_ADDRESS_FALLBACK = '0x89343A3d8BFb9dea288b5aEF9773892F34c60665';

export const WHISPERCHAIN_ADDRESS =
	process.env.NEXT_PUBLIC_WHISPERCHAIN_ADDRESS ?? DEPLOYED_ADDRESS_FALLBACK;

export const FORWARDER_ADDRESS =
	process.env.NEXT_PUBLIC_FORWARDER_ADDRESS ?? '';

export const PAYMASTER_ADDRESS =
	process.env.NEXT_PUBLIC_PAYMASTER_ADDRESS ?? '';

export const WHISPERCHAIN_ABI = WhisperChain__factory.abi;

export const FORWARDER_ABI = [
	'function getNonce(address from) view returns (uint256)',
	'function execute((address from, address to, uint256 value, uint256 gas, uint256 nonce, bytes data) req, bytes signature) payable returns (bool, bytes)',
] as const;

export const PAYMASTER_ABI = [
	'function relay((address from, address to, uint256 value, uint256 gas, uint256 nonce, bytes data) req, bytes signature, address relayer, uint256 reimbursement) payable',
] as const;

export type WhisperChainContract = WhisperChain;

export function getWhisperChainContract(runner: ContractRunner) {
	return WhisperChain__factory.connect(WHISPERCHAIN_ADDRESS, runner);
}

export function getForwarderContract(runner: ContractRunner) {
	return new Contract(FORWARDER_ADDRESS, FORWARDER_ABI, runner);
}

export function getPaymasterContract(runner: ContractRunner) {
	return new Contract(PAYMASTER_ADDRESS, PAYMASTER_ABI, runner);
}

export function getReadOnlyContract(rpcUrl = BASE_CHAIN.rpcUrl) {
	const provider = new JsonRpcProvider(rpcUrl);
	return getWhisperChainContract(provider);
}

type ConnectResult = {
	provider: BrowserProvider;
	signer: JsonRpcSigner;
	contract: WhisperChainContract;
};

export function isMobileDevice(): boolean {
	if (typeof window === 'undefined') return false;
	return (
		/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
			navigator.userAgent
		) || window.innerWidth <= 768
	);
}

export function openMetaMaskMobile(): void {
	if (typeof window === 'undefined') return;

	const currentUrl = window.location.href;
	// Use MetaMask universal link
	const metamaskUrl = `https://metamask.app.link/dapp/${encodeURIComponent(
		currentUrl
	)}`;

	// Try to open MetaMask app
	window.location.href = metamaskUrl;

	// Fallback: Show instructions after a delay
	setTimeout(() => {
		const userAgent = navigator.userAgent.toLowerCase();
		if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
			alert(
				'Please open this page in MetaMask browser or install MetaMask from the App Store.'
			);
		} else if (userAgent.includes('android')) {
			alert(
				'Please open this page in MetaMask browser or install MetaMask from Google Play Store.'
			);
		}
	}, 1000);
}

export async function connectWhisperChain(): Promise<ConnectResult> {
	if (typeof window === 'undefined') {
		throw new Error('Wallet connections must run in the browser');
	}

	const ethereum = (
		window as typeof window & {
			ethereum?: Eip1193Provider;
		}
	).ethereum;

	if (!ethereum) {
		// On mobile, try to open MetaMask
		if (isMobileDevice()) {
			openMetaMaskMobile();
			throw new Error(
				'Please open this page in MetaMask browser or install MetaMask to continue.'
			);
		}
		throw new Error(
			'No EIP-1193 wallet detected. Please install MetaMask or another Web3 wallet.'
		);
	}

	// Create provider - Base Sepolia doesn't support ENS, so we'll handle errors gracefully
	const provider = new BrowserProvider(ethereum);

	// Check and switch network if needed
	try {
		const network = await provider.getNetwork();
		if (Number(network.chainId) !== BASE_CHAIN.id) {
			try {
				await ethereum.request({
					method: 'wallet_switchEthereumChain',
					params: [{ chainId: `0x${BASE_CHAIN.id.toString(16)}` }],
				});
			} catch (switchError: any) {
				// If the chain doesn't exist, add it
				if (switchError.code === 4902) {
					await ethereum.request({
						method: 'wallet_addEthereumChain',
						params: [
							{
								chainId: `0x${BASE_CHAIN.id.toString(16)}`,
								chainName: BASE_CHAIN.name,
								nativeCurrency: {
									name: 'ETH',
									symbol: 'ETH',
									decimals: 18,
								},
								rpcUrls: [BASE_CHAIN.rpcUrl],
								blockExplorerUrls: [BASE_CHAIN.explorer],
							},
						],
					});
				} else {
					throw switchError;
				}
			}
		}
	} catch (error: any) {
		throw new Error(`Failed to switch to ${BASE_CHAIN.name}: ${error.message}`);
	}

	const signer = await provider.getSigner();

	return {
		provider,
		signer,
		contract: getWhisperChainContract(signer),
	};
}

export function getExplorerUrl(address = WHISPERCHAIN_ADDRESS) {
	return `${BASE_CHAIN.explorer}/address/${address}`;
}
