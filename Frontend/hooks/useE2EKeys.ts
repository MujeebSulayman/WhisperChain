'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getBytes, hexlify } from 'ethers';
import { connectScarf } from '@/lib/blockchain';
import {
	getUserPublicKey,
	submitSignedForwardRequest,
	updatePublicKey,
	updatePublicKeyGasless,
	waitForTransaction,
} from '@/lib/scarfActions';
import { isGaslessConfigured } from '@/lib/gasless';
import { getErrorMessage } from '@/lib/errors';
import {
	isEncryptionKey,
	keyMessage,
	keyPairFromSignature,
	loadStoredKeys,
	storeKeys,
	type KeyPair,
} from '@/lib/e2e';

/**
 * locked: no key on this device yet (waiting for the signature).
 * mismatch: the contract holds a different real key, so others encrypt to a key this device lacks.
 */
export type E2EStatus = 'locked' | 'unlocking' | 'ready' | 'mismatch' | 'error';

const sameKey = (a: Uint8Array, b: Uint8Array) => a.length === b.length && a.every((v, i) => v === b[i]);

async function publishKey(publicKey: Uint8Array) {
	const hex = hexlify(publicKey);
	if (isGaslessConfigured()) {
		const { request, signature } = await updatePublicKeyGasless(hex);
		await submitSignedForwardRequest(request, signature);
	} else {
		await waitForTransaction(Promise.resolve(await updatePublicKey(hex)));
	}
}

/*
 * The connected wallet's encryption keys. They're derived from a signature (asked for once per
 * device, then kept in localStorage) and published to the contract so others can encrypt to them.
 * Accounts registered before encryption get their old placeholder key replaced automatically.
 */
export function useE2EKeys(address: string | undefined, isRegistered: boolean) {
	const [keys, setKeys] = useState<KeyPair | null>(null);
	const [status, setStatus] = useState<E2EStatus>('locked');
	const [error, setError] = useState<string | null>(null);
	const unlocking = useRef<Promise<KeyPair> | null>(null);

	const unlock = useCallback(async (): Promise<KeyPair> => {
		if (!address) throw new Error('Connect your wallet first');
		const stored = loadStoredKeys(address);
		if (stored) {
			setKeys(stored);
			setStatus('ready');
			return stored;
		}
		// One signature prompt even if several callers ask at once.
		unlocking.current ??= (async () => {
			setStatus('unlocking');
			setError(null);
			try {
				const { signer } = await connectScarf();
				const pair = await keyPairFromSignature(await signer.signMessage(keyMessage(address)));
				storeKeys(address, pair);
				setKeys(pair);
				setStatus('ready');
				return pair;
			} catch (err) {
				setStatus('error');
				setError(getErrorMessage(err, "Couldn't unlock your messages"));
				throw err;
			} finally {
				unlocking.current = null;
			}
		})();
		return unlocking.current;
	}, [address]);

	useEffect(() => {
		setKeys(null);
		setStatus('locked');
		setError(null);
		if (address) unlock().catch(() => {});
	}, [address, unlock]);

	// Make sure the contract holds this device's key.
	useEffect(() => {
		if (!address || !keys || !isRegistered) return;
		let cancelled = false;
		(async () => {
			try {
				const onChain = getBytes(await getUserPublicKey(address));
				if (cancelled) return;
				if (sameKey(onChain, keys.publicKey)) return setStatus('ready');
				// A real key that isn't ours: don't overwrite it without asking.
				if (isEncryptionKey(onChain)) return setStatus('mismatch');
				await publishKey(keys.publicKey);
				if (!cancelled) setStatus('ready');
			} catch (err) {
				if (cancelled) return;
				setStatus('error');
				setError(getErrorMessage(err, "Couldn't publish your encryption key"));
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [address, keys, isRegistered]);

	/** Replaces the key on the contract with this device's. Messages sent to the old key stay unreadable here. */
	const adoptThisDeviceKey = useCallback(async () => {
		if (!keys) return;
		setError(null);
		try {
			await publishKey(keys.publicKey);
			setStatus('ready');
		} catch (err) {
			setError(getErrorMessage(err, "Couldn't publish your encryption key"));
		}
	}, [keys]);

	return { keys, status, error, unlock, adoptThisDeviceKey };
}
