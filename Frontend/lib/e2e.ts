'use client';

/*
 * End-to-end encryption for Whispr messages and files. The chain and IPFS only ever see ciphertext.
 *
 * Keys: each wallet has an X25519 keypair derived from a signature over a fixed message, so the
 * same wallet gets the same key on every device. The public key goes in the contract's
 * `publicKey` slot (bytes32), and the secret key never leaves the browser.
 *
 * Telling real keys from old ones: accounts registered before encryption have a random hash in
 * that slot, and any 32 bytes is a usable X25519 key, so a sender can't tell them apart by shape.
 * Real keys are therefore ground until sha256("scarf-e2e-v1" || key) starts with KEY_PROOF_BITS
 * zero bits. A random hash passes that check about once in 8,192 tries (with the top-bit check).
 *
 * Messages: a fresh content key K encrypts the payload (text plus the file's key), and K is
 * wrapped for each reader (sender and recipient) with an ephemeral X25519 key. Every key is used
 * exactly once, so a fixed zero nonce is safe.
 */
import { x25519 } from '@noble/curves/ed25519.js';
import { xchacha20poly1305 } from '@noble/ciphers/chacha.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { hkdf } from '@noble/hashes/hkdf.js';
import { bytesToHex, concatBytes, hexToBytes, randomBytes, utf8ToBytes } from '@noble/hashes/utils.js';
import { decodeBase64, encodeBase64, getBytes } from 'ethers';
import type { PrivatePayment } from './privatePay';

export type KeyPair = { secretKey: Uint8Array; publicKey: Uint8Array };

/** What a message encrypts: its text, how to open an attachment, and how to claim a private payment. */
export type Payload = {
	t: string;
	f?: FileKey;
	p?: PrivatePayment;
};

/** The key to an encrypted file on IPFS, plus the name and type it had before encryption. */
export type FileKey = { k: string; n: string; m: string };

export const ENVELOPE_PREFIX = 'scarf:e1:';
const VERSION = 1;
const KEY_PROOF_BITS = 12;
const DOMAIN = utf8ToBytes('scarf-e2e-v1');
const ZERO_NONCE = new Uint8Array(24);

export const keyMessage = (address: string) =>
	`Whispr inbox key\n\nSign to unlock your private messages on this device. This is free and sends no transaction.\n\nWallet: ${address.toLowerCase()}\nVersion: ${VERSION}`;

/** True if `publicKey` was made by keyPairFromSignature, i.e. its owner can read what we encrypt to it. */
export function isEncryptionKey(publicKey: Uint8Array): boolean {
	if (publicKey.length !== 32 || publicKey[31] & 0x80) return false;
	const h = sha256(concatBytes(DOMAIN, publicKey));
	let bits = KEY_PROOF_BITS;
	for (let i = 0; bits > 0; i++, bits -= 8) {
		const mask = bits >= 8 ? 0xff : (0xff << (8 - bits)) & 0xff;
		if (h[i] & mask) return false;
	}
	return true;
}

/** Derives the wallet's keypair from its signature over keyMessage(). Yields to the UI while it grinds. */
export async function keyPairFromSignature(signature: string): Promise<KeyPair> {
	const seed = sha256(concatBytes(DOMAIN, getBytes(signature)));
	const counter = new Uint8Array(4);
	for (let i = 0; ; i++) {
		new DataView(counter.buffer).setUint32(0, i);
		const secretKey = sha256(concatBytes(seed, counter));
		const publicKey = x25519.getPublicKey(secretKey);
		if (isEncryptionKey(publicKey)) return { secretKey, publicKey };
		if (i % 256 === 255) await new Promise((r) => setTimeout(r, 0));
	}
}

export const keyPairFromSecret = (secretKey: Uint8Array): KeyPair => ({
	secretKey,
	publicKey: x25519.getPublicKey(secretKey),
});

const keyStorageId = (address: string) => `scarf:e2e:${address.toLowerCase()}`;

export function loadStoredKeys(address: string): KeyPair | null {
	try {
		const hex = localStorage.getItem(keyStorageId(address));
		if (!hex) return null;
		const keys = keyPairFromSecret(hexToBytes(hex));
		return isEncryptionKey(keys.publicKey) ? keys : null;
	} catch {
		return null;
	}
}

export function storeKeys(address: string, keys: KeyPair) {
	try {
		localStorage.setItem(keyStorageId(address), bytesToHex(keys.secretKey));
	} catch {
		// Blocked storage: the user just signs again next visit.
	}
}

export function forgetKeys(address: string) {
	try {
		localStorage.removeItem(keyStorageId(address));
	} catch {
		// Nothing stored.
	}
}

function wrappingKey(shared: Uint8Array, ephemeral: Uint8Array, reader: Uint8Array) {
	return hkdf(sha256, shared, concatBytes(ephemeral, reader), DOMAIN, 32);
}

export const isEnvelope = (text: string) => text.startsWith(ENVELOPE_PREFIX);

/** Encrypts `payload` so that only the holders of `readers` (public keys) can open it. */
export function seal(payload: Payload, readers: Uint8Array[]): string {
	const contentKey = randomBytes(32);
	const ephemeralSecret = randomBytes(32);
	const ephemeral = x25519.getPublicKey(ephemeralSecret);
	const slots = readers.map((reader) => {
		const kek = wrappingKey(x25519.getSharedSecret(ephemeralSecret, reader), ephemeral, reader);
		return xchacha20poly1305(kek, ZERO_NONCE).encrypt(contentKey);
	});
	const body = xchacha20poly1305(contentKey, ZERO_NONCE).encrypt(utf8ToBytes(JSON.stringify(payload)));
	return ENVELOPE_PREFIX + encodeBase64(concatBytes(new Uint8Array([VERSION]), ephemeral, new Uint8Array([slots.length]), ...slots, body));
}

/** Opens an envelope made by seal(), or returns null if `keys` isn't one of its readers. */
export function open(envelope: string, keys: KeyPair): Payload | null {
	try {
		const bytes = decodeBase64(envelope.slice(ENVELOPE_PREFIX.length));
		if (bytes[0] !== VERSION) return null;
		const ephemeral = bytes.subarray(1, 33);
		const count = bytes[33];
		const slotsEnd = 34 + count * 48;
		const kek = wrappingKey(x25519.getSharedSecret(keys.secretKey, ephemeral), ephemeral, keys.publicKey);
		for (let i = 0; i < count; i++) {
			let contentKey: Uint8Array;
			try {
				contentKey = xchacha20poly1305(kek, ZERO_NONCE).decrypt(bytes.subarray(34 + i * 48, 34 + (i + 1) * 48));
			} catch {
				continue;
			}
			const body = xchacha20poly1305(contentKey, ZERO_NONCE).decrypt(bytes.subarray(slotsEnd));
			const payload = JSON.parse(new TextDecoder().decode(body));
			return typeof payload?.t === 'string' ? payload : null;
		}
		return null;
	} catch {
		return null;
	}
}

/** Encrypts a file's bytes with a fresh key. Upload `data`; the key travels inside the message. */
export function encryptFile(plain: Uint8Array): { key: string; data: Uint8Array } {
	const key = randomBytes(32);
	return { key: bytesToHex(key), data: xchacha20poly1305(key, ZERO_NONCE).encrypt(plain) };
}

export function decryptFile(data: Uint8Array, key: string): Uint8Array {
	return xchacha20poly1305(hexToBytes(key), ZERO_NONCE).decrypt(data);
}

const recipientKeys = new Map<string, { key: Uint8Array; at: number }>();
const RECIPIENT_KEY_TTL_MS = 60_000;

/** The recipient's encryption key from the contract, or an error if they haven't set one up. */
export async function getRecipientKey(address: string): Promise<Uint8Array> {
	const id = address.toLowerCase();
	const cached = recipientKeys.get(id);
	if (cached && Date.now() - cached.at < RECIPIENT_KEY_TTL_MS) return cached.key;

	const { getUserPublicKey } = await import('./scarfActions');
	const key = getBytes(await getUserPublicKey(address));
	if (!isEncryptionKey(key)) {
		throw new Error(
			`${address.slice(0, 6)}…${address.slice(-4)} hasn't set up private messages yet. Ask them to open Whispr once, then try again.`,
		);
	}
	recipientKeys.set(id, { key, at: Date.now() });
	return key;
}

/** Seals `payload` for the sender (so they can read their own copy) and one recipient. */
export async function sealFor(payload: Payload, senderKey: Uint8Array, recipient: string): Promise<string> {
	return seal(payload, [senderKey, await getRecipientKey(recipient)]);
}
