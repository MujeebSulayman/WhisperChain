'use client';

/*
 * Stealth addresses for private payments (ERC-5564, scheme 1: secp256k1 with view tags).
 *
 * A recipient publishes a meta-address: a spending public key S and a viewing public key V.
 * To pay them, the sender picks a random ephemeral key r and pays to the address of
 * S + h·G, where h = keccak256(r·V). Only the recipient can rebuild h (from v·R) and so the
 * private key s + h. The chain sees a payment to a fresh address with no link to the recipient.
 *
 * Both keys are derived from the inbox key (lib/e2e), so no extra signature is needed.
 */
import { SigningKey, computeAddress, concat, getBytes, hexlify, keccak256, randomBytes, toBeHex, toUtf8Bytes } from 'ethers';

const N = BigInt('0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141');

export type StealthKeys = {
	spendingKey: string;
	viewingKey: string;
	/** 66 bytes: compressed spending public key, then compressed viewing public key. */
	metaAddress: string;
};

/** A one-time payment address, plus what the recipient needs to find its key. */
export type StealthPayment = {
	stealthAddress: string;
	ephemeralPubKey: string;
	viewTag: number;
};

const toScalar = (bytes: string) => toBeHex((BigInt(keccak256(bytes)) % (N - BigInt(1))) + BigInt(1), 32);

export function deriveStealthKeys(inboxSecretKey: Uint8Array): StealthKeys {
	const spendingKey = toScalar(concat([toUtf8Bytes('whispr-stealth-spend-v1'), inboxSecretKey]));
	const viewingKey = toScalar(concat([toUtf8Bytes('whispr-stealth-view-v1'), inboxSecretKey]));
	return {
		spendingKey,
		viewingKey,
		metaAddress: concat([SigningKey.computePublicKey(spendingKey, true), SigningKey.computePublicKey(viewingKey, true)]),
	};
}

export function isMetaAddress(meta: string): boolean {
	try {
		const bytes = getBytes(meta);
		if (bytes.length !== 66) return false;
		SigningKey.computePublicKey(bytes.subarray(0, 33), true);
		SigningKey.computePublicKey(bytes.subarray(33), true);
		return true;
	} catch {
		return false;
	}
}

function sharedHash(sharedPoint: string) {
	const h = keccak256(SigningKey.computePublicKey(sharedPoint, true));
	return { h: BigInt(h) % N, viewTag: getBytes(h)[0] };
}

/** A fresh stealth address for the owner of `metaAddress`. */
export function generateStealthPayment(metaAddress: string): StealthPayment {
	const bytes = getBytes(metaAddress);
	const spendingPub = hexlify(bytes.subarray(0, 33));
	const viewingPub = hexlify(bytes.subarray(33));
	const ephemeral = new SigningKey(hexlify(randomBytes(32)));
	const { h, viewTag } = sharedHash(ephemeral.computeSharedSecret(viewingPub));
	const stealthPub = SigningKey.addPoints(spendingPub, SigningKey.computePublicKey(toBeHex(h, 32), true), true);
	return {
		stealthAddress: computeAddress(stealthPub),
		ephemeralPubKey: ephemeral.compressedPublicKey,
		viewTag,
	};
}

/**
 * The private key of a stealth address paid to us, or null if the payment isn't ours.
 * `stealthAddress` is checked, so a wrong ephemeral key can never hand back a wrong key.
 */
export function stealthPrivateKey(keys: StealthKeys, ephemeralPubKey: string, stealthAddress: string): string | null {
	try {
		const { h } = sharedHash(new SigningKey(keys.viewingKey).computeSharedSecret(ephemeralPubKey));
		const key = toBeHex((BigInt(keys.spendingKey) + h) % N, 32);
		return computeAddress(key).toLowerCase() === stealthAddress.toLowerCase() ? key : null;
	} catch {
		return null;
	}
}
