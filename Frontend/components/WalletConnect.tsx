'use client';

import { Wallet, Loader2, AlertCircle, Mail, ChevronRight, ArrowDownLeft } from 'lucide-react';
import { useState } from 'react';
import { ZeroAddress } from 'ethers';
import { usePrivy } from '@privy-io/react-auth';
import { BASE_CHAIN } from '@/lib/blockchain';
import { getErrorMessage } from '@/lib/errors';
import { useActiveWallet, useWallet } from '@/hooks/useWallet';
import type { WalletBalance } from '@/hooks/useWalletBalance';
import { CopyAddress, shortAddress } from './CopyAddress';

type WalletConnectProps = {
	onConnect: () => void | Promise<void>;
	connectedAddress?: string;
	balance?: WalletBalance;
	/** Opens the wallet screen (receive, send, account). */
	onOpenWallet?: () => void;
};

const WALLET_NAMES: Record<string, string> = {
	privy: 'Scarf wallet',
	'privy-v2': 'Scarf wallet',
	metamask: 'MetaMask',
	coinbase_wallet: 'Coinbase Wallet',
	base_account: 'Base Account',
	rainbow: 'Rainbow',
	phantom: 'Phantom',
	rabby_wallet: 'Rabby',
	wallet_connect: 'WalletConnect',
	wallet_connect_v2: 'WalletConnect',
};

/** How to name the signed-in wallet: the email for Scarf (embedded) wallets, else the wallet app. */
export function useWalletIdentity() {
	const { user } = usePrivy();
	const wallet = useActiveWallet();
	const isEmbedded = wallet?.walletClientType === 'privy' || wallet?.walletClientType === 'privy-v2';
	const walletName = wallet ? WALLET_NAMES[wallet.walletClientType] ?? wallet.walletClientType.replace(/_/g, ' ') : 'Wallet';
	const login = user?.email?.address ?? user?.google?.email;
	return {
		isEmbedded,
		title: walletName,
		subtitle: isEmbedded ? login : undefined,
	};
}

/** Sidebar wallet card: log in when signed out; a compact summary that opens the wallet when signed in. */
export function WalletConnect({ onConnect, connectedAddress, balance, onOpenWallet }: WalletConnectProps) {
	const [isConnecting, setIsConnecting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { isConnecting: privyLoading, error: loginError } = useWallet();
	const { isEmbedded, title, subtitle } = useWalletIdentity();

	const handleConnect = async () => {
		setIsConnecting(true);
		setError(null);

		try {
			await onConnect();
		} catch (err) {
			setError(getErrorMessage(err, 'Failed to connect wallet'));
		} finally {
			setIsConnecting(false);
		}
	};

	if (connectedAddress) {
		const tokenCount = balance?.assets.filter((a) => a.token !== ZeroAddress).length ?? 0;

		return (
			<div className="card p-3">
				<div className="flex items-center gap-3">
					<span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-good/15 text-good">
						{isEmbedded ? <Mail size={16} strokeWidth={1.8} /> : <Wallet size={16} strokeWidth={1.8} />}
						<span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--card-bg)] bg-good" />
					</span>
					<div className="min-w-0 flex-1">
						<p className="label truncate text-[10px]!" title={subtitle}>
							{subtitle ?? title}
						</p>
						<div className="flex items-center gap-0.5">
							<p className="truncate font-mono text-[13px]" title={connectedAddress}>
								{shortAddress(connectedAddress)}
							</p>
							<CopyAddress text={connectedAddress} size={13} />
						</div>
					</div>
					<span className="pill h-6! shrink-0 px-2.5! font-mono text-[10px] text-dim">{BASE_CHAIN.name}</span>
				</div>

				<button
					onClick={onOpenWallet}
					className="inset-panel group mt-3 flex w-full items-center gap-3 rounded-[var(--r-inset)] p-3 text-left transition-colors hover:bg-[color-mix(in_srgb,var(--fg)_4%,transparent)]"
				>
					<span className="min-w-0 flex-1">
						<span className="label block text-[10px]!">Balance</span>
						<span className="mt-1 flex items-baseline gap-1.5">
							<span className="font-display text-[24px] font-medium leading-none tracking-[-0.02em]">
								{balance?.eth ? balance.eth.formatted : '—'}
							</span>
							<span className="text-[12.5px] text-dim">ETH</span>
							{tokenCount > 0 && <span className="text-[11.5px] text-mute">+{tokenCount} token{tokenCount > 1 ? 's' : ''}</span>}
						</span>
						{balance?.lastIncrease && (
							<span className="pop mt-1.5 flex items-center gap-1 text-[11.5px] text-good">
								<ArrowDownLeft size={12} strokeWidth={2} />+{balance.lastIncrease.formatted} {balance.lastIncrease.symbol} received
							</span>
						)}
					</span>
					<span className="flex shrink-0 items-center gap-0.5 text-[12px] font-medium text-accent">
						Open wallet
						<ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
					</span>
				</button>
			</div>
		);
	}

	return (
		<div>
			<button onClick={handleConnect} disabled={isConnecting || privyLoading} className="btn btn-accent w-full disabled:opacity-60">
				{isConnecting || privyLoading ? (
					<>
						<Loader2 size={16} className="animate-spin" />
						Connecting…
					</>
				) : (
					<>
						<Wallet size={16} strokeWidth={2} />
						Log in or connect wallet
					</>
				)}
			</button>
			<p className="mt-2 px-1 text-[11.5px] leading-relaxed text-mute">
				Use an existing wallet, or sign in with email or Google and we&apos;ll create one for you.
			</p>
			{(error || loginError) && (
				<div className="inset-panel mt-2 rounded-[var(--r-inset)] p-3">
					<div className="flex items-start gap-2">
						<AlertCircle size={15} strokeWidth={1.8} className="mt-0.5 shrink-0 text-bad" />
						<p className="flex-1 text-[12px] leading-relaxed text-dim">{error || loginError}</p>
					</div>
				</div>
			)}
		</div>
	);
}
