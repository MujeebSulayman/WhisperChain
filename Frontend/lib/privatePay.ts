'use client';

/*
 * Private payments through WhisprStealthPay. Money goes to a one-time stealth address (lib/stealth),
 * and the details the recipient needs travel encrypted inside the chat message, so the chain
 * never links the payment to the recipient or to the conversation.
 *
 * USDC moves with permit signatures through the forwarder and the stealth paymaster, so neither
 * sending nor claiming needs ETH. ETH can't be relayed: it's sent from the payer's wallet, and a
 * claim pays its own gas out of the payment.
 */
import { Contract, Interface, Signature, Transaction, Wallet, ZeroAddress, getBytes, type Signer } from 'ethers';
import { STEALTH_PAY_ADDRESS, connectScarf, getReadOnlyProvider } from './blockchain';
import { buildForwardRequest, signForwardRequest } from './gasless';
import { submitSignedForwardRequest } from './scarfActions';
import { generateStealthPayment, isMetaAddress, stealthPrivateKey, type StealthKeys } from './stealth';

/** What a private payment's message carries (encrypted) so the recipient can claim it. */
export type PrivatePayment = {
	/** Stealth address holding the funds. */
	s: string;
	/** Ephemeral public key the recipient derives the stealth key from. */
	e: string;
	/** Amount in the token's smallest unit, as a decimal string. */
	a: string;
	/** Token address; the zero address is ETH. */
	k: string;
};

const STEALTH_ABI = [
	'function stealthMetaAddressOf(address) view returns (bytes)',
	'function registerKeys(bytes stealthMetaAddress)',
	'function sendEth(address stealthAddress, bytes ephemeralPubKey, bytes metadata) payable',
	'function sendToken(address token, address stealthAddress, uint256 amount, bytes ephemeralPubKey, bytes metadata, uint256 deadline, uint8 v, bytes32 r, bytes32 s)',
	'function claimToken(address token, address to, uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s)',
];
const stealthInterface = new Interface(STEALTH_ABI);
const TOKEN_ABI = [
	'function name() view returns (string)',
	'function version() view returns (string)',
	'function nonces(address) view returns (uint256)',
	'function balanceOf(address) view returns (uint256)',
];
/** Base's gas price oracle, which prices the L1 data part of a transaction. */
const GAS_PRICE_ORACLE = '0x420000000000000000000000000000000000000F';
const PERMIT_LIFETIME_S = 60 * 60;

export const isPrivatePaymentConfigured = () => Boolean(STEALTH_PAY_ADDRESS);

// The stealth keys of the connected wallet, kept current by useE2EKeys (like blockchain's active wallet).
let currentKeys: StealthKeys | null = null;
export function setStealthKeys(keys: StealthKeys | null) {
	currentKeys = keys;
}

const readContract = () => new Contract(STEALTH_PAY_ADDRESS, STEALTH_ABI, getReadOnlyProvider());

export async function getMetaAddress(address: string): Promise<string | null> {
	const meta: string = await readContract().stealthMetaAddressOf(address);
	return isMetaAddress(meta) ? meta : null;
}

async function relayStealthCall(signer: Signer, data: string) {
	const from = await signer.getAddress();
	const request = await buildForwardRequest({ from, to: STEALTH_PAY_ADDRESS, data });
	const signature = await signForwardRequest(signer, request);
	return submitSignedForwardRequest(request, signature);
}

/** Publishes the connected wallet's stealth meta-address (gasless). */
export async function registerStealthKeys(metaAddress: string) {
	const { signer } = await connectScarf();
	await relayStealthCall(signer, stealthInterface.encodeFunctionData('registerKeys', [metaAddress]));
}

/** An EIP-2612 permit letting WhisprStealthPay move `amount` of `token` from `owner`. */
async function signPermit(owner: Signer, token: string, amount: bigint) {
	const erc20 = new Contract(token, TOKEN_ABI, getReadOnlyProvider());
	const ownerAddress = await owner.getAddress();
	const [name, version, nonce, network] = await Promise.all([
		erc20.name() as Promise<string>,
		(erc20.version() as Promise<string>).catch(() => '1'),
		erc20.nonces(ownerAddress) as Promise<bigint>,
		getReadOnlyProvider().getNetwork(),
	]);
	const deadline = BigInt(Math.floor(Date.now() / 1000) + PERMIT_LIFETIME_S);
	const sig = Signature.from(
		await owner.signTypedData(
			{ name, version, chainId: network.chainId, verifyingContract: token },
			{
				Permit: [
					{ name: 'owner', type: 'address' },
					{ name: 'spender', type: 'address' },
					{ name: 'value', type: 'uint256' },
					{ name: 'nonce', type: 'uint256' },
					{ name: 'deadline', type: 'uint256' },
				],
			},
			{ owner: ownerAddress, spender: STEALTH_PAY_ADDRESS, value: amount, nonce, deadline },
		),
	);
	return [deadline, sig.v, sig.r, sig.s] as const;
}

/** Pays `recipient` privately. Returns what the chat message must carry for them to claim it. */
export async function sendPrivatePayment(recipient: string, token: string, amount: bigint): Promise<PrivatePayment> {
	const meta = await getMetaAddress(recipient);
	if (!meta) {
		throw new Error(
			`${recipient.slice(0, 6)}…${recipient.slice(-4)} can't receive private payments yet. Ask them to open Whispr once, then try again.`,
		);
	}
	const payment = generateStealthPayment(meta);
	const viewTag = '0x' + payment.viewTag.toString(16).padStart(2, '0');
	const { signer } = await connectScarf();

	if (token === ZeroAddress) {
		const contract = new Contract(STEALTH_PAY_ADDRESS, STEALTH_ABI, signer);
		const tx = await contract.sendEth(payment.stealthAddress, payment.ephemeralPubKey, viewTag, { value: amount });
		await tx.wait();
	} else {
		const permit = await signPermit(signer, token, amount);
		await relayStealthCall(
			signer,
			stealthInterface.encodeFunctionData('sendToken', [token, payment.stealthAddress, amount, payment.ephemeralPubKey, viewTag, ...permit]),
		);
	}
	return { s: payment.stealthAddress, e: payment.ephemeralPubKey, a: amount.toString(), k: token };
}

/** What's still sitting at a private payment's stealth address. */
export async function privatePaymentBalance(payment: PrivatePayment): Promise<bigint> {
	const provider = getReadOnlyProvider();
	if (payment.k === ZeroAddress) return provider.getBalance(payment.s);
	return new Contract(payment.k, TOKEN_ABI, provider).balanceOf(payment.s);
}

/**
 * True once the funds have moved out. An ETH claim leaves a little dust behind (the fee estimate is
 * padded), so under 1% of the amount counts as claimed.
 */
export async function isPrivatePaymentClaimed(payment: PrivatePayment): Promise<boolean> {
	const balance = await privatePaymentBalance(payment);
	return payment.k === ZeroAddress ? balance * BigInt(100) < BigInt(payment.a) : balance === BigInt(0);
}

/** True if this wallet's stealth keys can claim `payment`. */
export const canClaim = (payment: PrivatePayment) =>
	Boolean(currentKeys && stealthPrivateKey(currentKeys, payment.e, payment.s));

/** Moves a private payment received by this wallet into `to`. */
export async function claimPrivatePayment(payment: PrivatePayment, to: string) {
	const key = currentKeys && stealthPrivateKey(currentKeys, payment.e, payment.s);
	if (!key) throw new Error("This payment wasn't sent to this wallet");
	const provider = getReadOnlyProvider();
	const stealth = new Wallet(key, provider);
	if (await isPrivatePaymentClaimed(payment)) throw new Error('Already claimed');
	const balance = await privatePaymentBalance(payment);

	if (payment.k !== ZeroAddress) {
		const permit = await signPermit(stealth, payment.k, balance);
		await relayStealthCall(stealth, stealthInterface.encodeFunctionData('claimToken', [payment.k, to, balance, ...permit]));
		return;
	}

	// ETH pays its own way out: the gas, plus Base's L1 data fee, comes off the amount.
	const fee = await provider.getFeeData();
	const maxFeePerGas = fee.maxFeePerGas ?? fee.gasPrice ?? BigInt(0);
	const maxPriorityFeePerGas = fee.maxPriorityFeePerGas ?? BigInt(0);
	const { chainId } = await provider.getNetwork();
	const draft = { type: 2, chainId, to, value: balance, gasLimit: BigInt(21000), maxFeePerGas, maxPriorityFeePerGas, nonce: await provider.getTransactionCount(stealth.address) };
	let l1Fee = BigInt(0);
	try {
		const oracle = new Contract(GAS_PRICE_ORACLE, ['function getL1Fee(bytes) view returns (uint256)'], provider);
		l1Fee = ((await oracle.getL1Fee(getBytes(Transaction.from(draft).unsignedSerialized))) as bigint) * BigInt(2);
	} catch {
		// Not an OP-stack chain: there is no L1 fee.
	}
	const value = balance - BigInt(21000) * maxFeePerGas - l1Fee;
	if (value <= BigInt(0)) throw new Error('This payment is too small to cover the network fee to claim it');
	await (await stealth.sendTransaction({ ...draft, value })).wait();
}
