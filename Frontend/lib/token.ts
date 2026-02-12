'use client';

import { Contract, JsonRpcProvider, ZeroAddress } from 'ethers';
import { BASE_CHAIN } from './blockchain';

const ERC20_ABI = [
	'function symbol() external view returns (string)',
	'function decimals() external view returns (uint8)',
];

const cache = new Map<string, { symbol: string; decimals: number }>();

export type TokenInfo = { symbol: string; decimals: number };

export async function getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
	if (!tokenAddress || tokenAddress === ZeroAddress) {
		return { symbol: 'ETH', decimals: 18 };
	}
	const key = tokenAddress.toLowerCase();
	if (cache.has(key)) return cache.get(key)!;
	const provider = new JsonRpcProvider(BASE_CHAIN.rpcUrl);
	const contract = new Contract(tokenAddress, ERC20_ABI, provider);
	try {
		const [symbol, decimals] = await Promise.all([
			contract.symbol().catch(() => '???'),
			contract.decimals().catch(() => 18),
		]);
		const info = { symbol: String(symbol), decimals: Number(decimals) };
		cache.set(key, info);
		return info;
	} catch {
		const fallback = { symbol: '???', decimals: 18 };
		cache.set(key, fallback);
		return fallback;
	}
}

export function formatTokenAmount(amountRaw: bigint, decimals: number): string {
	if (decimals <= 0) return String(amountRaw);
	const divisor = 10 ** decimals;
	const whole = amountRaw / BigInt(divisor);
	const frac = amountRaw % BigInt(divisor);
	const fracStr = frac.toString().padStart(decimals, '0').replace(/0+$/, '') || '0';
	return fracStr ? `${whole}.${fracStr}` : String(whole);
}
