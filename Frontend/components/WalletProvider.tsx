'use client';

import { useEffect, type ReactNode } from 'react';
import { PrivyProvider, addRpcUrlOverrideToChain } from '@privy-io/react-auth';
import { base, baseSepolia } from 'viem/chains';
import { BASE_CHAIN, registerActiveWallet } from '@/lib/blockchain';
import { useActiveWallet } from '@/hooks/useWallet';

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

const viemChain = BASE_CHAIN.id === base.id ? base : baseSepolia;
const scarfChain = BASE_CHAIN.rpcUrl
	? addRpcUrlOverrideToChain(viemChain, BASE_CHAIN.rpcUrl)
	: viemChain;

// Hands the active Privy wallet to lib/blockchain so connectScarf() can sign with it.
function PrivyWalletBridge() {
	const wallet = useActiveWallet();

	useEffect(() => {
		registerActiveWallet(
			wallet
				? {
						address: wallet.address,
						getEthereumProvider: () => wallet.getEthereumProvider(),
						switchChain: (chainId) => wallet.switchChain(chainId),
					}
				: null,
		);
	}, [wallet]);

	return null;
}

export function WalletProvider({ children }: { children: ReactNode }) {
	if (!PRIVY_APP_ID) {
		return (
			<div className="mx-auto max-w-md p-6 text-center text-[14px] text-dim">
				Wallet login isn&apos;t configured. Set <code className="font-mono">NEXT_PUBLIC_PRIVY_APP_ID</code> in{' '}
				<code className="font-mono">.env.local</code>.
			</div>
		);
	}

	return (
		<PrivyProvider
			appId={PRIVY_APP_ID}
			config={{
				loginMethods: ['wallet', 'email', 'google'],
				defaultChain: scarfChain,
				supportedChains: [scarfChain],
				embeddedWallets: {
					ethereum: { createOnLogin: 'users-without-wallets' },
				},
				appearance: {
					theme: 'dark',
					walletChainType: 'ethereum-only',
				},
			}}
		>
			<PrivyWalletBridge />
			{children}
		</PrivyProvider>
	);
}
