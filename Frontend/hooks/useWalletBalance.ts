'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Contract, JsonRpcProvider, ZeroAddress } from 'ethers';
import { BASE_CHAIN } from '@/lib/blockchain';
import { formatDisplayAmount, getTokenInfo } from '@/lib/token';

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
 * The wallet's on-chain balances: ETH plus any ERC-20s in `tokens` (e.g. ones it has been
 * paid in). Polls while the tab is visible and reports increases so the UI can say
 * "you received X", including transfers that never went through Scarf.
 */
export function useWalletBalance(address?: string, tokens: string[] = []) {
	const [assets, setAssets] = useState<WalletAsset[]>([]);
	const [loading, setLoading] = useState(false);
	const [lastIncrease, setLastIncrease] = useState<BalanceIncrease | null>(null);
	const previous = useRef<Map<string, bigint>>(new Map());
	const tokenKey = [...new Set(tokens.map((t) => t.toLowerCase()))]
		.filter((t) => t !== ZeroAddress)
		.sort()
		.join(',');

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
			const tokenList = tokenKey ? tokenKey.split(',') : [];

			const eth = provider.getBalance(address).then((raw) => ({
				token: ZeroAddress,
				symbol: 'ETH',
				decimals: 18,
				raw,
			}));
			const erc20s = tokenList.map(async (token) => {
				const [info, raw] = await Promise.all([
					getTokenInfo(token),
					new Contract(token, BALANCE_ABI, provider).balanceOf(address) as Promise<bigint>,
				]);
				return { token, ...info, raw };
			});

			const settled = await Promise.allSettled([eth, ...erc20s]);
			const next: WalletAsset[] = settled
				.filter((r): r is PromiseFulfilledResult<Omit<WalletAsset, 'formatted'>> => r.status === 'fulfilled')
				.map(({ value }) => ({ ...value, formatted: formatDisplayAmount(value.raw, value.decimals) }))
				// ETH always shows; tokens only once there is something to show.
				.filter((a) => a.token === ZeroAddress || a.raw > BigInt(0));

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
	}, [address, tokenKey]);

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
