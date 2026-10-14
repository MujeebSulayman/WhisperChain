/*
 * Where Scarf is deployed. Kept free of ethers and 'use client' so server components
 * (the landing page) can read it as well as the app.
 */

export const BASE_CHAIN = {
	id: 84532,
	name: 'Base Sepolia',
	rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC ?? '',
	explorer: 'https://sepolia.basescan.org',
} as const;

const DEPLOYED = {
	scarf: '0x03825A9458BFE8F66D6464Ba126f94eB4D02AE43',
	forwarder: '0x61d6789168986B18Eb1423894c5147De1B5afCf1',
	paymaster: '0xA3bFa5c5c950D58A4fa7bB0fD8DBB0464AF65F4f',
} as const;

export const SCARF_ADDRESS =
	process.env.NEXT_PUBLIC_SCARF_ADDRESS ?? DEPLOYED.scarf;

export const FORWARDER_ADDRESS =
	process.env.NEXT_PUBLIC_FORWARDER_ADDRESS ?? DEPLOYED.forwarder;

export const PAYMASTER_ADDRESS =
	process.env.NEXT_PUBLIC_PAYMASTER_ADDRESS ?? DEPLOYED.paymaster;
