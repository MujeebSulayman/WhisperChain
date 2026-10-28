/*
 * Where Scarf is deployed. Kept free of ethers and 'use client' so server components
 * (the landing page) and the relay route can read it as well as the app.
 *
 * NEXT_PUBLIC_NETWORK picks the Base network: "base-sepolia" (default, where the contracts
 * are deployed today) or "base" (mainnet). Contract addresses default to the deployment
 * on that network; set NEXT_PUBLIC_*_ADDRESS to point at your own.
 */

type NetworkKey = 'base' | 'base-sepolia';

const NETWORKS = {
	base: {
		id: 8453,
		name: 'Base',
		explorer: 'https://basescan.org',
		testnet: false,
		// Circle's native USDC on Base.
		usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
		// Not deployed on mainnet yet: the NEXT_PUBLIC_*_ADDRESS variables are required.
		deployed: { scarf: '', forwarder: '', paymaster: '' },
	},
	'base-sepolia': {
		id: 84532,
		name: 'Base Sepolia',
		explorer: 'https://sepolia.basescan.org',
		testnet: true,
		// Circle's test USDC on Base Sepolia.
		usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
		deployed: {
			scarf: '0x03825A9458BFE8F66D6464Ba126f94eB4D02AE43',
			forwarder: '0x61d6789168986B18Eb1423894c5147De1B5afCf1',
			paymaster: '0xA3bFa5c5c950D58A4fa7bB0fD8DBB0464AF65F4f',
		},
	},
} as const;

const NETWORK_KEY: NetworkKey = process.env.NEXT_PUBLIC_NETWORK === 'base' ? 'base' : 'base-sepolia';
const NETWORK = NETWORKS[NETWORK_KEY];

export const BASE_CHAIN = {
	key: NETWORK_KEY,
	id: NETWORK.id,
	name: NETWORK.name,
	rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC ?? '',
	explorer: NETWORK.explorer,
	testnet: NETWORK.testnet,
} as const;

export const SCARF_ADDRESS =
	process.env.NEXT_PUBLIC_SCARF_ADDRESS ?? NETWORK.deployed.scarf;

export const FORWARDER_ADDRESS =
	process.env.NEXT_PUBLIC_FORWARDER_ADDRESS ?? NETWORK.deployed.forwarder;

export const PAYMASTER_ADDRESS =
	process.env.NEXT_PUBLIC_PAYMASTER_ADDRESS ?? NETWORK.deployed.paymaster;

export const USDC_ADDRESS = NETWORK.usdc;

/** The only assets Scarf lets you pay with. The zero address means native ETH. */
export const PAYMENT_ASSETS = [
	{ token: '0x0000000000000000000000000000000000000000', symbol: 'ETH', decimals: 18 },
	{ token: USDC_ADDRESS, symbol: 'USDC', decimals: 6 },
] as const;

export type PaymentAsset = (typeof PAYMENT_ASSETS)[number];

export function findPaymentAsset(token: string | undefined | null): PaymentAsset | undefined {
	const t = (token || PAYMENT_ASSETS[0].token).toLowerCase();
	return PAYMENT_ASSETS.find((a) => a.token.toLowerCase() === t);
}

/*
 * Other EVM networks where the same address can hold funds. Scarf only runs on Base, so these
 * are read-only: the wallet shows what's there so money sent on the wrong network isn't
 * "lost", and points people to bridge it. Testnets pair with base-sepolia, mainnets with base.
 * Each RPC can be overridden with NEXT_PUBLIC_RPC_<KEY> (e.g. NEXT_PUBLIC_RPC_ARBITRUM).
 */
export type OtherChain = {
	key: string;
	id: number;
	name: string;
	rpcUrl: string;
	explorer: string;
	usdc: string;
};

const OTHER_CHAINS_BY_NETWORK: Record<NetworkKey, OtherChain[]> = {
	base: [
		{
			key: 'ethereum',
			id: 1,
			name: 'Ethereum',
			rpcUrl: process.env.NEXT_PUBLIC_RPC_ETHEREUM ?? 'https://ethereum-rpc.publicnode.com',
			explorer: 'https://etherscan.io',
			usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
		},
		{
			key: 'arbitrum',
			id: 42161,
			name: 'Arbitrum',
			rpcUrl: process.env.NEXT_PUBLIC_RPC_ARBITRUM ?? 'https://arb1.arbitrum.io/rpc',
			explorer: 'https://arbiscan.io',
			usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
		},
		{
			key: 'optimism',
			id: 10,
			name: 'Optimism',
			rpcUrl: process.env.NEXT_PUBLIC_RPC_OPTIMISM ?? 'https://mainnet.optimism.io',
			explorer: 'https://optimistic.etherscan.io',
			usdc: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
		},
	],
	'base-sepolia': [
		{
			key: 'ethereum',
			id: 11155111,
			name: 'Sepolia',
			rpcUrl: process.env.NEXT_PUBLIC_RPC_ETHEREUM ?? 'https://ethereum-sepolia-rpc.publicnode.com',
			explorer: 'https://sepolia.etherscan.io',
			usdc: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
		},
		{
			key: 'arbitrum',
			id: 421614,
			name: 'Arbitrum Sepolia',
			rpcUrl: process.env.NEXT_PUBLIC_RPC_ARBITRUM ?? 'https://sepolia-rollup.arbitrum.io/rpc',
			explorer: 'https://sepolia.arbiscan.io',
			usdc: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
		},
		{
			key: 'optimism',
			id: 11155420,
			name: 'OP Sepolia',
			rpcUrl: process.env.NEXT_PUBLIC_RPC_OPTIMISM ?? 'https://sepolia.optimism.io',
			explorer: 'https://sepolia-optimism.etherscan.io',
			usdc: '0x5fd84259d66Cd46123540766Be93DFE6D43130D7',
		},
	],
};

export const OTHER_CHAINS = OTHER_CHAINS_BY_NETWORK[NETWORK_KEY];
