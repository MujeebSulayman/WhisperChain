'use client';

import { Wallet, Loader2, AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { useState } from 'react';
import { BASE_CHAIN } from '@/lib/blockchain';
import { getErrorMessage, isUserRejectedError } from '@/lib/errors';
import { useWallet } from '@/hooks/useWallet';

type WalletConnectProps = {
	onConnect: () => void | Promise<void>;
	onDisconnect?: () => void;
	connectedAddress?: string;
};

export function WalletConnect({ onConnect, onDisconnect, connectedAddress }: WalletConnectProps) {
	const [isConnecting, setIsConnecting] = useState(false);
	const [isSwitching, setIsSwitching] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { switchAccount, isConnecting: privyLoading, error: loginError } = useWallet();

	const handleConnect = async () => {
		setIsConnecting(true);
		setError(null);

		try {
			await onConnect();
		} catch (err: any) {
			setError(getErrorMessage(err, 'Failed to connect wallet'));
		} finally {
			setIsConnecting(false);
		}
	};

	const handleSwitchAccount = async () => {
		setIsSwitching(true);
		setError(null);

		try {
			await switchAccount();
		} catch (err: any) {
			if (!isUserRejectedError(err)) {
				setError(getErrorMessage(err, 'Failed to switch account'));
			}
		} finally {
			setIsSwitching(false);
		}
	};

	const handleDisconnect = () => {
		if (onDisconnect) {
			onDisconnect();
		}
	};

	if (connectedAddress) {
		return (
			<div className="card p-3">
				<div className="flex items-center gap-3">
					<span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-good/15 text-good">
						<Wallet size={16} strokeWidth={1.8} />
						<span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--card-bg)] bg-good" />
					</span>
					<div className="min-w-0 flex-1">
						<p className="label text-[10px]!">Connected</p>
						<p className="truncate font-mono text-[13px]">
							{connectedAddress.slice(0, 6)}…{connectedAddress.slice(-4)}
						</p>
					</div>
					<span className="pill h-6! px-2.5! font-mono text-[10px] text-dim">{BASE_CHAIN.name}</span>
				</div>

				<div className="mt-3 flex gap-2">
					<button onClick={handleSwitchAccount} disabled={isSwitching} className="btn btn-sm btn-ghost h-9! flex-1 text-[13px]! disabled:opacity-50">
						{isSwitching ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} strokeWidth={1.8} />}
						Switch account
					</button>
					{onDisconnect && (
						<button
							onClick={handleDisconnect}
							className="btn btn-sm btn-ghost h-9! w-9! px-0! hover:text-bad"
							title="Disconnect"
							aria-label="Disconnect"
						>
							<LogOut size={14} strokeWidth={1.8} />
						</button>
					)}
				</div>
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
