'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchUserProfile } from '@/lib/scarfActions';

type UserProfile = {
	publicKey: string;
	isActive: boolean;
	lastSeen: bigint;
};

/** unknown: not read yet (or every read failed so far); the app treats it as "checking". */
export type RegistrationStatus = 'unknown' | 'registered' | 'unregistered';

const MAX_ATTEMPTS = 5;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/*
 * The connected wallet's profile and whether it has activated Whispr: the one place the app
 * reads registration from. Reads retry with backoff, since a failed RPC call must not leave a
 * registered user locked out until they refresh.
 */
export function useScarf(userAddress?: string) {
	// Tagged with the address it was read for, so switching wallets shows "unknown" at once.
	const [result, setResult] = useState<{ address: string; profile: UserProfile; status: RegistrationStatus } | null>(null);
	// Only the latest load may update state, so a slow read for an old wallet can't win.
	const loadId = useRef(0);

	/** `expectRegistered`: right after registering, keep reading until the chain shows it. */
	const load = useCallback(async (address: string, expectRegistered = false) => {
		const id = ++loadId.current;
		for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
			try {
				const p = await fetchUserProfile(address);
				if (id !== loadId.current) return;
				if (!p.isActive && expectRegistered && attempt < MAX_ATTEMPTS) {
					await sleep(1500);
					continue;
				}
				setResult({
					address,
					profile: { publicKey: p.publicKey, isActive: p.isActive, lastSeen: p.lastSeen },
					status: p.isActive ? 'registered' : 'unregistered',
				});
				return;
			} catch (err) {
				if (id !== loadId.current) return;
				if (attempt === MAX_ATTEMPTS) console.error('Failed to load profile:', err);
				else await sleep(1000 * 2 ** (attempt - 1));
			}
		}
	}, []);

	useEffect(() => {
		// load() only sets state after awaiting the read, not synchronously.
		// eslint-disable-next-line react-hooks/set-state-in-effect
		if (userAddress) load(userAddress);
	}, [userAddress, load]);

	const current = result && userAddress && result.address === userAddress ? result : null;
	const status: RegistrationStatus = current?.status ?? 'unknown';

	const refresh = useCallback(
		(expectRegistered = false) => {
			if (userAddress) load(userAddress, expectRegistered);
		},
		[userAddress, load],
	);

	return {
		profile: current?.profile ?? null,
		status,
		isRegistered: status === 'registered',
		refresh,
	};
}
