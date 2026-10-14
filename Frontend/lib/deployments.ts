/*
 * Where WhisperChain is deployed. Kept free of ethers and 'use client' so server components
 * (the landing page) can read it as well as the app.
 */

export const BASE_CHAIN = {
	id: 84532,
	name: 'Base Sepolia',
	rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC ?? '',
	explorer: 'https://sepolia.basescan.org',
} as const;

const DEPLOYED = {
	whisperChain: '0x65c050Ce0b516e633d350BE645537b41C3Ac97E5',
	forwarder: '0x8e586796a694A8Ac7aE355e959fD2aA7605518a1',
	paymaster: '0x5e4173440C48dd44EFF8F07523A9c5d33E6d9eED',
} as const;

export const WHISPERCHAIN_ADDRESS =
	process.env.NEXT_PUBLIC_WHISPERCHAIN_ADDRESS ?? DEPLOYED.whisperChain;

export const FORWARDER_ADDRESS =
	process.env.NEXT_PUBLIC_FORWARDER_ADDRESS ?? DEPLOYED.forwarder;

export const PAYMASTER_ADDRESS =
	process.env.NEXT_PUBLIC_PAYMASTER_ADDRESS ?? DEPLOYED.paymaster;
