'use client';

import type { InterfaceAbi, JsonRpcSigner } from 'ethers';
import {
	BrowserProvider,
	Contract,
	JsonRpcProvider,
	type ContractRunner,
	type Eip1193Provider,
} from 'ethers';
import { WhisperChain__factory } from '@WhisperChain/typechain/factories/WhisperChain__factory';
import type { WhisperChain } from '@WhisperChain/typechain/WhisperChain';
import forwarderAbi from '@/blockchain/Forwarder.json';
import paymasterAbi from '@/blockchain/WhisperChainPaymaster.json';

export type { WhisperChain } from '@WhisperChain/typechain/WhisperChain';

export const BASE_CHAIN = {
	id: 84532,
	name: 'Base Sepolia',
	rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC ?? '',
	explorer: 'https://sepolia.basescan.org',
} as const;

const DEPLOYED = {
	whisperChain: '0x65c050Ce0b516e633d350BE645537b41C3Ac97E5',
	forwarder: '0x8e586796a694A8Ac7aE355e959fD2aA7605518a1',
	paymaster: '0x5e4173440C48dd44EFF8F07523A9c5d33E6d9eED',
} as const;

export const WHISPERCHAIN_ADDRESS =
	process.env.NEXT_PUBLIC_WHISPERCHAIN_ADDRESS ?? DEPLOYED.whisperChain;

export const FORWARDER_ADDRESS =
	process.env.NEXT_PUBLIC_FORWARDER_ADDRESS ?? DEPLOYED.forwarder;

export const PAYMASTER_ADDRESS =
	process.env.NEXT_PUBLIC_PAYMASTER_ADDRESS ?? DEPLOYED.paymaster;

export const WHISPERCHAIN_ABI = WhisperChain__factory.abi;
export const FORWARDER_ABI = forwarderAbi as InterfaceAbi;
export const PAYMASTER_ABI = paymasterAbi as InterfaceAbi;

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
	const metamaskUrl = `https://metamask.app.link/dapp/${encodeURIComponent(
		currentUrl
	)}`;

	window.location.href = metamaskUrl;

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

	const provider = new BrowserProvider(ethereum);

	try {
		const network = await provider.getNetwork();
		if (Number(network.chainId) !== BASE_CHAIN.id) {
			try {
				await ethereum.request({
					method: 'wallet_switchEthereumChain',
					params: [{ chainId: `0x${BASE_CHAIN.id.toString(16)}` }],
				});
			} catch (switchError: any) {
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
