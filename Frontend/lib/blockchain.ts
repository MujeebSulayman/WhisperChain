'use client';

import type { JsonRpcSigner } from 'ethers';
import {
	BrowserProvider,
	JsonRpcProvider,
	type ContractRunner,
	type Eip1193Provider,
} from 'ethers';
import { WhisperChain__factory } from '@WhisperChain/typechain/factories/WhisperChain__factory';
import type { WhisperChain } from '@WhisperChain/typechain/WhisperChain';

export type { WhisperChain } from '@WhisperChain/typechain/WhisperChain';

export const BASE_CHAIN = {
	id: 8453,
	name: 'Base',
	rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC ?? 'https://mainnet.base.org',
	explorer: 'https://basescan.org',
} as const;

const DEPLOYED_ADDRESS_FALLBACK = '0xCCA7f351fA1689b33F22b66A8a69509F6b428718';

export const WHISPERCHAIN_ADDRESS =
	process.env.NEXT_PUBLIC_WHISPERCHAIN_ADDRESS ?? DEPLOYED_ADDRESS_FALLBACK;

export const WHISPERCHAIN_ABI = WhisperChain__factory.abi;

export type WhisperChainContract = WhisperChain;

export function getWhisperChainContract(runner: ContractRunner) {
	return WhisperChain__factory.connect(WHISPERCHAIN_ADDRESS, runner);
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
		throw new Error('No EIP-1193 wallet detected');
	}

	const provider = new BrowserProvider(ethereum);
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
