'use client';

import { useState, useCallback } from 'react';
import { usePrivy, useWallets, useLogin, type ConnectedWallet } from '@privy-io/react-auth';
import { isUserRejectedError } from '@/lib/errors';

/*
 * The wallet Scarf signs with: the user's primary linked wallet if it is connected in this
 * browser, otherwise the first one Privy has (an embedded wallet for email/social logins).
 */
export function useActiveWallet(): ConnectedWallet | undefined {
	const { authenticated, user } = usePrivy();
	const { wallets } = useWallets();
	if (!authenticated) return undefined;

	const primary = user?.wallet?.address?.toLowerCase();
	return wallets.find((w) => w.address.toLowerCase() === primary) ?? wallets[0];
}

export function useWallet() {
	const { ready, authenticated, logout, connectWallet } = usePrivy();
	const wallet = useActiveWallet();
	const [error, setError] = useState<string | null>(null);

	const { login } = useLogin({
		onError: (err) => {
			if (!isUserRejectedError(err) && err !== 'exited_auth_flow') {
				setError(String(err));
			}
		},
	});

	const connect = useCallback(async () => {
		setError(null);
		// Logged in but no wallet connected in this browser (e.g. an external wallet after a reload).
		if (authenticated) {
			connectWallet();
		} else {
			login();
		}
	}, [authenticated, connectWallet, login]);

	const disconnect = useCallback(async () => {
		await logout();
	}, [logout]);

	const switchAccount = useCallback(async () => {
		await logout();
		login();
	}, [logout, login]);

	return {
		connectedAddress: wallet?.address,
		isConnecting: !ready,
		error,
		connect,
		disconnect,
		switchAccount,
	};
}
