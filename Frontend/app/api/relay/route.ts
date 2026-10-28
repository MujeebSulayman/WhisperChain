import { NextResponse } from 'next/server';
import { Contract, Interface, JsonRpcProvider, Wallet, getAddress, isAddress, isHexString } from 'ethers';
import paymasterAbi from '@/blockchain/ScarfPaymaster.json';
import forwarderAbi from '@/blockchain/ScarfForwarder.json';
import type { InterfaceAbi } from 'ethers';
import { FORWARDER_ADDRESS, PAYMASTER_ADDRESS, SCARF_ADDRESS, findPaymentAsset } from '@/lib/deployments';

const RPC_URL = process.env.NEXT_PUBLIC_BASE_RPC ?? '';
const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY ?? '';
const REIMBURSEMENT_WEI = BigInt(process.env.RELAYER_REIMBURSEMENT_WEI ?? '50000000000000');

// Upper bound on the gas a single request may ask the relayer to spend.
const MAX_GAS = BigInt(process.env.RELAYER_MAX_GAS ?? '3000000');

/*
 * Rate limits per sender address and per client IP. They live in this server instance's
 * memory, so on serverless hosts each instance counts separately: a speed bump, not a
 * guarantee. Use a shared store (e.g. Upstash Redis) if the relayer gets abused.
 */
const LIMITS = {
	perSenderPerMinute: Number(process.env.RELAYER_LIMIT_PER_SENDER_MINUTE ?? '10'),
	perSenderPerDay: Number(process.env.RELAYER_LIMIT_PER_SENDER_DAY ?? '300'),
	perIpPerMinute: Number(process.env.RELAYER_LIMIT_PER_IP_MINUTE ?? '30'),
};

// Only the Scarf calls a user makes for themselves. Anything else is refused.
const RELAYABLE = new Interface([
	'function registerUser(bytes32 publicKey, string username)',
	'function updatePublicKey(bytes32 newPublicKey)',
	'function updateLastSeen()',
	'function sendMessage(address recipient, bytes32 messageHash, address paymentToken, uint256 paymentAmount, string ipfsHash, uint8 mediaType, uint256 fileSize, string textContent)',
	'function sendBatchMessages(address[] recipients, bytes32[] messageHashes, address[] paymentTokens, uint256[] paymentAmounts, string[] ipfsHashes, uint8[] mediaTypes, uint256[] fileSizes, string[] textContents)',
	'function createConversation(address[] participants, bytes32 conversationKeyHash)',
	'function deleteMessage(bytes32 messageId)',
	'function clearStorage()',
]);

type RelayBody = {
	request: {
		from: string;
		to: string;
		value: string;
		gas: string;
		nonce: string;
		data: string;
	};
	signature: string;
};

const hits = new Map<string, number[]>();

/** Records a hit for `key` and reports whether it is still under `limit` within `windowMs`. */
function allow(key: string, limit: number, windowMs: number): boolean {
	const now = Date.now();
	const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
	if (recent.length >= limit) {
		hits.set(key, recent);
		return false;
	}
	recent.push(now);
	hits.set(key, recent);
	// Keep the map from growing without bound.
	if (hits.size > 10_000) {
		for (const [k, ts] of hits) {
			if (ts.every((t) => now - t >= 24 * 60 * 60 * 1000)) hits.delete(k);
		}
	}
	return true;
}

function fail(error: string, status: number) {
	return NextResponse.json({ error }, { status });
}

function toUint(value: unknown): bigint | null {
	try {
		const n = BigInt(String(value ?? '0'));
		return n >= BigInt(0) ? n : null;
	} catch {
		return null;
	}
}

export async function POST(req: Request) {
	if (!RELAYER_PRIVATE_KEY) {
		return fail('Relayer not configured (RELAYER_PRIVATE_KEY)', 503);
	}
	if (!FORWARDER_ADDRESS) {
		return fail('Forwarder not configured', 503);
	}

	let body: RelayBody;
	try {
		body = await req.json();
	} catch {
		return fail('Invalid JSON', 400);
	}

	const { request, signature } = body ?? {};
	if (!request?.from || !request?.to || request?.data === undefined || !signature) {
		return fail('Missing request or signature', 400);
	}
	if (!isAddress(request.from) || !isAddress(request.to)) {
		return fail('Invalid address', 400);
	}
	if (!isHexString(request.data) || !isHexString(signature, 65)) {
		return fail('Invalid data or signature', 400);
	}

	// Never spend the relayer's own ETH on someone else's behalf.
	const value = toUint(request.value);
	if (value !== BigInt(0)) {
		return fail('Requests that send ETH must be submitted from your own wallet', 400);
	}
	if (getAddress(request.to) !== getAddress(SCARF_ADDRESS)) {
		return fail('Only Scarf calls can be relayed', 400);
	}
	let call: ReturnType<typeof RELAYABLE.parseTransaction>;
	try {
		call = RELAYABLE.parseTransaction({ data: request.data });
	} catch {
		call = null;
	}
	if (!call) {
		return fail('This call is not relayable', 400);
	}
	const fn = call.name;

	// Payments are ETH or USDC only (and ETH never comes through here, see above).
	const tokens: string[] =
		fn === 'sendMessage' ? [call.args.paymentToken] : fn === 'sendBatchMessages' ? [...call.args.paymentTokens] : [];
	const amounts: bigint[] =
		fn === 'sendMessage' ? [call.args.paymentAmount] : fn === 'sendBatchMessages' ? [...call.args.paymentAmounts] : [];
	if (tokens.some((t, i) => amounts[i] > BigInt(0) && !findPaymentAsset(t))) {
		return fail('Only ETH and USDC payments are supported', 400);
	}

	const gas = toUint(request.gas);
	const nonce = toUint(request.nonce);
	if (!gas || nonce === null) {
		return fail('Invalid gas or nonce', 400);
	}
	if (gas > MAX_GAS) {
		return fail(`Request asks for too much gas (max ${MAX_GAS})`, 400);
	}

	const from = getAddress(request.from);
	const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
	if (
		!allow(`ip:${ip}`, LIMITS.perIpPerMinute, 60_000) ||
		!allow(`from:${from}:m`, LIMITS.perSenderPerMinute, 60_000) ||
		!allow(`from:${from}:d`, LIMITS.perSenderPerDay, 24 * 60 * 60_000)
	) {
		return fail('Too many requests. Wait a moment and try again.', 429);
	}

	const reqTuple = [from, getAddress(request.to), value, gas, nonce, request.data] as const;

	const provider = new JsonRpcProvider(RPC_URL);
	const wallet = new Wallet(RELAYER_PRIVATE_KEY, provider);
	const relayerAddress = wallet.address;
	const forwarder = new Contract(FORWARDER_ADDRESS, forwarderAbi as InterfaceAbi, wallet);

	// Reject bad signatures and stale nonces for free, before any gas is spent.
	try {
		const valid: boolean = await forwarder.verify(reqTuple, signature);
		if (!valid) return fail('Signature does not match the request, or the nonce is stale', 400);
	} catch {
		return fail('Could not verify the request', 400);
	}

	try {
		if (PAYMASTER_ADDRESS) {
			const paymaster = new Contract(PAYMASTER_ADDRESS, paymasterAbi as InterfaceAbi, wallet);
			const args = [reqTuple, signature, relayerAddress, REIMBURSEMENT_WEI] as const;
			// Simulate first: a call that would revert costs the relayer gas for nothing.
			await paymaster.relay.staticCall(...args);
			const tx = await paymaster.relay(...args);
			const receipt = await tx.wait();
			return NextResponse.json({ hash: receipt?.hash ?? tx.hash });
		}

		// Without a paymaster the forwarder reports failure instead of reverting, so check it.
		const [ok] = (await forwarder.execute.staticCall(reqTuple, signature)) as [boolean, string];
		if (!ok) return fail(`The ${fn} call would fail`, 400);
		const tx = await forwarder.execute(reqTuple, signature);
		const receipt = await tx.wait();
		return NextResponse.json({ hash: receipt?.hash ?? tx.hash });
	} catch (err: unknown) {
		const e = err as { shortMessage?: string; reason?: string; message?: string };
		const message = e.reason ?? e.shortMessage ?? (err instanceof Error ? err.message : 'Relay failed');
		return fail(message, 500);
	}
}
