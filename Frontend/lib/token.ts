'use client';

import { Contract, JsonRpcProvider, ZeroAddress, formatUnits } from 'ethers';
import { BASE_CHAIN } from './blockchain';
import { findPaymentAsset } from './deployments';

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
	const known = findPaymentAsset(key);
	if (known) return { symbol: known.symbol, decimals: known.decimals };
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

/** A balance for display: grouped, at most `maxDecimals` places, "<0.000001" for dust. */
export function formatDisplayAmount(amountRaw: bigint, decimals: number, maxDecimals = 6): string {
	if (amountRaw === BigInt(0)) return '0';
	const value = Number(formatUnits(amountRaw, decimals));
	const floor = 10 ** -maxDecimals;
	if (value > 0 && value < floor) return `<${floor.toFixed(maxDecimals)}`;
	return value.toLocaleString(undefined, { maximumFractionDigits: maxDecimals });
}
