'use client';

import { useState, useEffect } from 'react';
import { ZeroAddress } from 'ethers';
import { getTokenInfo } from '@WhisperChain/lib/token';

export function useTokenInfo(tokenAddress: string | undefined) {
	const [info, setInfo] = useState<{ symbol: string; decimals: number } | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!tokenAddress || tokenAddress === ZeroAddress) {
			setInfo({ symbol: 'ETH', decimals: 18 });
			setLoading(false);
			return;
		}
		let cancelled = false;
		setLoading(true);
		getTokenInfo(tokenAddress).then((res) => {
			if (!cancelled) {
				setInfo(res);
				setLoading(false);
			}
		}).catch(() => {
			if (!cancelled) {
				setInfo({ symbol: '???', decimals: 18 });
				setLoading(false);
			}
		});
		return () => { cancelled = true; };
	}, [tokenAddress]);

	return { symbol: info?.symbol ?? '...', decimals: info?.decimals ?? 18, loading };
}
