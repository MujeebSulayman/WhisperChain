'use client';

import type { InterfaceAbi, JsonRpcSigner } from 'ethers';
import {
	BrowserProvider,
	Contract,
	JsonRpcProvider,
	type ContractRunner,
	type Eip1193Provider,
} from 'ethers';
import { Scarf__factory } from '@/typechain/factories/Scarf__factory';
import type { Scarf } from '@/typechain/Scarf';
import forwarderAbi from '@/blockchain/ScarfForwarder.json';
import paymasterAbi from '@/blockchain/ScarfPaymaster.json';
import { BASE_CHAIN, FORWARDER_ADDRESS, PAYMASTER_ADDRESS, SCARF_ADDRESS } from './deployments';

export type { Scarf } from '@/typechain/Scarf';
export { BASE_CHAIN, FORWARDER_ADDRESS, PAYMASTER_ADDRESS, SCARF_ADDRESS };

export const SCARF_ABI = Scarf__factory.abi;
export const FORWARDER_ABI = forwarderAbi as InterfaceAbi;
export const PAYMASTER_ABI = paymasterAbi as InterfaceAbi;

export type ScarfContract = Scarf;

export function getScarfContract(runner: ContractRunner) {
	return Scarf__factory.connect(SCARF_ADDRESS, runner);
}

export function getForwarderContract(runner: ContractRunner) {
	return new Contract(FORWARDER_ADDRESS, FORWARDER_ABI, runner);
}

export function getPaymasterContract(runner: ContractRunner) {
	return new Contract(PAYMASTER_ADDRESS, PAYMASTER_ABI, runner);
}

export function getReadOnlyContract(rpcUrl = BASE_CHAIN.rpcUrl) {
	const provider = new JsonRpcProvider(rpcUrl);
	return getScarfContract(provider);
}

type ConnectResult = {
	provider: BrowserProvider;
	signer: JsonRpcSigner;
	contract: ScarfContract;
};

/*
 * The wallet Privy has active for this session. PrivyWalletBridge keeps it current so
 * plain functions (scarfActions, PaymentOptions) can get a signer without React hooks.
 */
export type ActiveWallet = {
	address: string;
	getEthereumProvider: () => Promise<Eip1193Provider>;
	switchChain: (chainId: number) => Promise<void>;
};

let activeWallet: ActiveWallet | null = null;

export function registerActiveWallet(wallet: ActiveWallet | null) {
	activeWallet = wallet;
}

export async function connectScarf(): Promise<ConnectResult> {
	if (typeof window === 'undefined') {
		throw new Error('Wallet connections must run in the browser');
	}

	const wallet = activeWallet;
	if (!wallet) {
		throw new Error('Please connect your wallet first');
	}

	let provider = new BrowserProvider(await wallet.getEthereumProvider());

	try {
		const network = await provider.getNetwork();
		if (Number(network.chainId) !== BASE_CHAIN.id) {
			await wallet.switchChain(BASE_CHAIN.id);
			// BrowserProvider caches the network it first saw, so start fresh after the switch.
			provider = new BrowserProvider(await wallet.getEthereumProvider());
		}
	} catch (error: any) {
		throw new Error(`Failed to switch to ${BASE_CHAIN.name}: ${error.message}`);
	}

	const signer = await provider.getSigner(wallet.address);

	return {
		provider,
		signer,
		contract: getScarfContract(signer),
	};
}

export function getExplorerUrl(address = SCARF_ADDRESS) {
	return `${BASE_CHAIN.explorer}/address/${address}`;
}
