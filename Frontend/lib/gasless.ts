'use client';

import type { Signer } from 'ethers';
import { Interface } from 'ethers';
import { JsonRpcProvider } from 'ethers';
import {
	BASE_CHAIN,
	FORWARDER_ADDRESS,
	PAYMASTER_ADDRESS,
	WHISPERCHAIN_ADDRESS,
	getForwarderContract,
	getPaymasterContract,
} from './blockchain';

export interface ForwardRequest {
	from: string;
	to: string;
	value: bigint;
	gas: bigint;
	nonce: bigint;
	data: string;
}

const EIP712_DOMAIN = {
	name: 'MinimalForwarder',
	version: '0.0.1',
	chainId: BASE_CHAIN.id,
} as const;

const FORWARD_REQUEST_TYPES = {
	ForwardRequest: [
		{ name: 'from', type: 'address' },
		{ name: 'to', type: 'address' },
		{ name: 'value', type: 'uint256' },
		{ name: 'gas', type: 'uint256' },
		{ name: 'nonce', type: 'uint256' },
		{ name: 'data', type: 'bytes' },
	],
} as const;

export function isGaslessConfigured(): boolean {
	return Boolean(
		typeof window !== 'undefined' &&
			FORWARDER_ADDRESS &&
			(PAYMASTER_ADDRESS || FORWARDER_ADDRESS)
	);
}

export async function getForwardRequestNonce(userAddress: string): Promise<bigint> {
	if (!FORWARDER_ADDRESS) throw new Error('Forwarder not configured');
	const provider = new JsonRpcProvider(BASE_CHAIN.rpcUrl);
	const forwarder = getForwarderContract(provider);
	return forwarder.getNonce(userAddress);
}

const GAS_ESTIMATE_BUFFER = BigInt(80_000);

export async function buildForwardRequest(params: {
	from: string;
	to?: string;
	value?: bigint;
	gasLimit?: bigint;
	data: string;
}): Promise<ForwardRequest> {
	const provider = new JsonRpcProvider(BASE_CHAIN.rpcUrl);
	const target = params.to ?? WHISPERCHAIN_ADDRESS;
	const value = params.value ?? BigInt(0);
	let gas = params.gasLimit;
	if (gas === undefined || gas === BigInt(0)) {
		const estimated = await provider.estimateGas({
			from: params.from,
			to: target,
			data: params.data,
			value,
		});
		gas = estimated + GAS_ESTIMATE_BUFFER;
	}
	const nonce = await getForwardRequestNonce(params.from);
	return {
		from: params.from,
		to: target,
		value,
		gas,
		nonce,
		data: params.data,
	};
}

export async function signForwardRequest(
	signer: Signer,
	request: ForwardRequest
): Promise<string> {
	if (!FORWARDER_ADDRESS) throw new Error('Forwarder not configured');
	const domain = { ...EIP712_DOMAIN, verifyingContract: FORWARDER_ADDRESS };
	const payload = {
		types: FORWARD_REQUEST_TYPES,
		domain,
		primaryType: 'ForwardRequest' as const,
		message: {
			from: request.from,
			to: request.to,
			value: request.value,
			gas: request.gas,
			nonce: request.nonce,
			data: request.data,
		},
	};
	return signer.signTypedData(
		payload.domain,
		{ ForwardRequest: [...FORWARD_REQUEST_TYPES.ForwardRequest] },
		payload.message
	);
}

function requestToTuple(req: ForwardRequest): [string, string, bigint, bigint, bigint, string] {
	return [req.from, req.to, req.value, req.gas, req.nonce, req.data];
}

export async function submitViaPaymaster(
	request: ForwardRequest,
	signature: string,
	relayerAddress: string,
	reimbursement: bigint,
	signerOrProvider: import('ethers').Signer | import('ethers').Provider
): Promise<{ hash: string }> {
	if (!PAYMASTER_ADDRESS) throw new Error('Paymaster not configured');
	const paymaster = getPaymasterContract(signerOrProvider as import('ethers').ContractRunner);
	const tx = await paymaster.relay(
		requestToTuple(request),
		signature,
		relayerAddress,
		reimbursement,
		{ value: request.value }
	);
	const receipt = await tx.wait();
	return { hash: receipt?.hash ?? tx.hash };
}

export async function submitViaForwarder(
	request: ForwardRequest,
	signature: string,
	signerOrProvider: import('ethers').Signer | import('ethers').Provider
): Promise<{ hash: string }> {
	if (!FORWARDER_ADDRESS) throw new Error('Forwarder not configured');
	const forwarder = getForwarderContract(signerOrProvider as import('ethers').ContractRunner);
	const tx = await forwarder.execute(requestToTuple(request), signature, {
		value: request.value,
	});
	const receipt = await tx.wait();
	return { hash: receipt?.hash ?? tx.hash };
}

export function encodeSendMessageCalldata(params: {
	recipient: string;
	messageHash: string;
	paymentToken: string;
	paymentAmount: bigint;
	ipfsHash: string;
	mediaType: number;
	fileSize: bigint;
	textContent: string;
}): string {
	const iface = new Interface([
		'function sendMessage(address recipient, bytes32 messageHash, address paymentToken, uint256 paymentAmount, string ipfsHash, uint8 mediaType, uint256 fileSize, string textContent)',
	]);
	return iface.encodeFunctionData('sendMessage', [
		params.recipient,
		params.messageHash,
		params.paymentToken,
		params.paymentAmount,
		params.ipfsHash,
		params.mediaType,
		params.fileSize,
		params.textContent,
	]);
}

export function encodeRegisterUserCalldata(publicKey: string, username: string): string {
	const iface = new Interface([
		'function registerUser(bytes32 publicKey, string username)',
	]);
	return iface.encodeFunctionData('registerUser', [publicKey, username]);
}

export function encodeUpdateLastSeenCalldata(): string {
	const iface = new Interface(['function updateLastSeen()']);
	return iface.encodeFunctionData('updateLastSeen', []);
}

export function encodeCreateConversationCalldata(
	participants: string[],
	conversationKeyHash: string
): string {
	const iface = new Interface([
		'function createConversation(address[] participants, bytes32 conversationKeyHash)',
	]);
	return iface.encodeFunctionData('createConversation', [
		participants,
		conversationKeyHash,
	]);
}

export function encodeDeleteMessageCalldata(messageId: string): string {
	const iface = new Interface([
		'function deleteMessage(bytes32 messageId)',
	]);
	return iface.encodeFunctionData('deleteMessage', [messageId]);
}

export function encodeUpdatePublicKeyCalldata(newPublicKey: string): string {
	const iface = new Interface([
		'function updatePublicKey(bytes32 newPublicKey)',
	]);
	return iface.encodeFunctionData('updatePublicKey', [newPublicKey]);
}

export function encodeWithdrawBalanceCalldata(): string {
	const iface = new Interface(['function withdrawBalance()']);
	return iface.encodeFunctionData('withdrawBalance', []);
}

export function encodeClearStorageCalldata(): string {
	const iface = new Interface(['function clearStorage()']);
	return iface.encodeFunctionData('clearStorage', []);
}

export function encodeSendBatchMessagesCalldata(params: {
	recipients: string[];
	messageHashes: string[];
	paymentTokens: string[];
	paymentAmounts: bigint[];
	ipfsHashes: string[];
	mediaTypes: number[];
	fileSizes: bigint[];
	textContents: string[];
}): string {
	const iface = new Interface([
		'function sendBatchMessages(address[] recipients, bytes32[] messageHashes, address[] paymentTokens, uint256[] paymentAmounts, string[] ipfsHashes, uint8[] mediaTypes, uint256[] fileSizes, string[] textContents)',
	]);
	return iface.encodeFunctionData('sendBatchMessages', [
		params.recipients,
		params.messageHashes,
		params.paymentTokens,
		params.paymentAmounts,
		params.ipfsHashes,
		params.mediaTypes,
		params.fileSizes,
		params.textContents,
	]);
}
