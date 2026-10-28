'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Contract, JsonRpcProvider, ZeroAddress } from 'ethers';
import { BASE_CHAIN } from '@/lib/blockchain';
import { PAYMENT_ASSETS } from '@/lib/deployments';
import { formatDisplayAmount } from '@/lib/token';

export type WalletAsset = {
	/** ZeroAddress for native ETH. */
	token: string;
	symbol: string;
	decimals: number;
	raw: bigint;
	formatted: string;
};

export type BalanceIncrease = { symbol: string; formatted: string; at: number };

const POLL_MS = 15_000;
const BALANCE_ABI = ['function balanceOf(address owner) view returns (uint256)'];

/*
 * The wallet's ETH and USDC balances, the two assets Scarf pays in. Polls while the tab is
 * visible and reports increases so the UI can say "you received X", including transfers
 * that never went through Scarf.
 */
export function useWalletBalance(address?: string) {
	const [assets, setAssets] = useState<WalletAsset[]>([]);
	const [loading, setLoading] = useState(false);
	const [lastIncrease, setLastIncrease] = useState<BalanceIncrease | null>(null);
	const previous = useRef<Map<string, bigint>>(new Map());

	const clearIncrease = useCallback(() => setLastIncrease(null), []);

	useEffect(() => {
		previous.current = new Map();
		setAssets([]);
		setLastIncrease(null);
	}, [address]);

	const refresh = useCallback(async () => {
		if (!address) return;
		setLoading(true);
		try {
			const provider = new JsonRpcProvider(BASE_CHAIN.rpcUrl);
			const settled = await Promise.allSettled(
				PAYMENT_ASSETS.map(async (asset): Promise<Omit<WalletAsset, 'formatted'>> => {
					const raw: bigint =
						asset.token === ZeroAddress
							? await provider.getBalance(address)
							: await new Contract(asset.token, BALANCE_ABI, provider).balanceOf(address);
					return { token: asset.token, symbol: asset.symbol, decimals: asset.decimals, raw };
				}),
			);
			const next: WalletAsset[] = settled
				.filter((r): r is PromiseFulfilledResult<Omit<WalletAsset, 'formatted'>> => r.status === 'fulfilled')
				.map(({ value }) => ({ ...value, formatted: formatDisplayAmount(value.raw, value.decimals) }));

			for (const asset of next) {
				const before = previous.current.get(asset.token);
				if (before !== undefined && asset.raw > before) {
					setLastIncrease({
						symbol: asset.symbol,
						formatted: formatDisplayAmount(asset.raw - before, asset.decimals),
						at: Date.now(),
					});
				}
				previous.current.set(asset.token, asset.raw);
			}
			setAssets(next);
		} catch (err) {
			console.error('Failed to load wallet balance:', err);
		} finally {
			setLoading(false);
		}
	}, [address]);

	useEffect(() => {
		if (!address) return;
		refresh();
		const timer = setInterval(() => {
			if (document.visibilityState === 'visible') refresh();
		}, POLL_MS);
		const onVisible = () => document.visibilityState === 'visible' && refresh();
		document.addEventListener('visibilitychange', onVisible);
		return () => {
			clearInterval(timer);
			document.removeEventListener('visibilitychange', onVisible);
		};
	}, [address, refresh]);

	return {
		assets,
		eth: assets.find((a) => a.token === ZeroAddress),
		loading,
		lastIncrease,
		clearIncrease,
		refresh,
	};
}

export type WalletBalance = ReturnType<typeof useWalletBalance>;
