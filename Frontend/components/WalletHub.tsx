'use client';

import { useState } from 'react';
import { ZeroAddress } from 'ethers';
import { usePrivy } from '@privy-io/react-auth';
import {
	ArrowDownLeft,
	ArrowUpRight,
	ChevronRight,
	Coins,
	ExternalLink,
	Info,
	KeyRound,
	LogOut,
	RefreshCw,
	UserCog,
	X,
} from 'lucide-react';
import { BASE_CHAIN } from '@/lib/deployments';
import { getErrorMessage, isUserRejectedError } from '@/lib/errors';
import { explorerAddress } from '@/lib/links';
import { useActiveWallet, useWallet } from '@/hooks/useWallet';
import type { WalletBalance } from '@/hooks/useWalletBalance';
import { Modal } from './Modal';
import { CopyAddress, shortAddress } from './CopyAddress';
import { ReceivePanel } from './ReceivePanel';
import { SendPanel } from './SendPanel';
import { useWalletIdentity } from './WalletConnect';

export type WalletTab = 'receive' | 'send' | 'account';

type WalletHubProps = {
	address: string;
	balance: WalletBalance;
	tab: WalletTab;
	onTabChange: (tab: WalletTab) => void;
	/** Prefills Send, e.g. with the person in the open chat. */
	defaultRecipient?: string;
	onPaymentHistory: () => void;
	onDisconnect: () => void;
	onClose: () => void;
};

const TABS: { id: WalletTab; label: string; icon: typeof Coins }[] = [
	{ id: 'receive', label: 'Receive', icon: ArrowDownLeft },
	{ id: 'send', label: 'Send', icon: ArrowUpRight },
	{ id: 'account', label: 'Account', icon: UserCog },
];

/** The one place for money: balance up top, then Receive, Send and Account sections. */
export function WalletHub({
	address,
	balance,
	tab,
	onTabChange,
	defaultRecipient,
	onPaymentHistory,
	onDisconnect,
	onClose,
}: WalletHubProps) {
	const [sending, setSending] = useState(false);
	const { title } = useWalletIdentity();
	const tokens = balance.assets.filter((a) => a.token !== ZeroAddress);

	return (
		<Modal onDismiss={sending ? undefined : onClose} maxWidth="28rem">
			<div className="card overflow-hidden p-0!">
				{/* Balance */}
				<div className="border-b border-line p-5 pb-4 sm:p-6 sm:pb-5">
					<div className="flex items-start justify-between gap-3">
						<div className="min-w-0">
							<p className="label truncate">{title}</p>
							<div className="mt-1 flex items-center gap-0.5">
								<p className="font-mono text-[13px] text-dim" title={address}>
									{shortAddress(address)}
								</p>
								<CopyAddress text={address} size={13} />
							</div>
						</div>
						<button onClick={onClose} disabled={sending} className="icon-btn h-9! w-9! shrink-0 disabled:opacity-40" aria-label="Close">
							<X size={16} strokeWidth={1.8} />
						</button>
					</div>

					<div className="mt-5 flex items-end justify-between gap-3">
						<p className="flex items-baseline gap-2">
							<span className="font-display text-[40px] font-medium leading-none tracking-[-0.03em]">
								{balance.eth ? balance.eth.formatted : '—'}
							</span>
							<span className="text-[15px] text-dim">ETH</span>
						</p>
						<button
							onClick={() => {
								balance.refresh();
								balance.refreshElsewhere();
							}}
							className="icon-btn h-8! w-8! shrink-0"
							title="Refresh balance"
							aria-label="Refresh balance"
						>
							<RefreshCw size={14} strokeWidth={1.8} className={balance.loading ? 'animate-spin' : ''} />
						</button>
					</div>
					{tokens.length > 0 && (
						<div className="mt-3 flex flex-wrap gap-2">
							{tokens.map((t) => (
								<span key={t.token} className="pill h-7! px-3! text-[12px]">
									<span className="font-mono">{t.formatted}</span>
									<span className="text-dim">{t.symbol}</span>
								</span>
							))}
						</div>
					)}
					{balance.lastIncrease && (
						<p className="pop mt-3 flex items-center gap-1.5 text-[12.5px] text-good">
							<ArrowDownLeft size={13} strokeWidth={2} />+{balance.lastIncrease.formatted} {balance.lastIncrease.symbol} just arrived
						</p>
					)}
					{balance.elsewhere.length > 0 && <OtherNetworks holdings={balance.elsewhere} address={address} />}
				</div>

				{/* Sections */}
				<div className="p-5 sm:p-6">
					<div className="seg mb-5 w-full">
						{TABS.map(({ id, label, icon: Icon }) => (
							<button
								key={id}
								aria-pressed={tab === id}
								disabled={sending && id !== tab}
								onClick={() => onTabChange(id)}
								className="flex flex-1 items-center justify-center gap-1.5"
							>
								<Icon size={14} strokeWidth={1.8} />
								{label}
							</button>
						))}
					</div>

					{tab === 'receive' && <ReceivePanel address={address} />}
					{tab === 'send' && (
						<SendPanel
							from={address}
							assets={balance.assets}
							defaultRecipient={defaultRecipient}
							onSent={balance.refresh}
							onBusyChange={setSending}
						/>
					)}
					{tab === 'account' && (
						<AccountSection address={address} onPaymentHistory={onPaymentHistory} onDisconnect={onDisconnect} />
					)}
				</div>
			</div>
		</Modal>
	);
}

/** Funds this address holds on networks Scarf doesn't run on: visible, but not spendable here. */
function OtherNetworks({ holdings, address }: { holdings: WalletBalance['elsewhere']; address: string }) {
	return (
		<div className="inset-panel mt-4 rounded-[var(--r-inset)] p-3">
			<p className="label text-[10px]!">On other networks</p>
			<ul className="mt-2 grid gap-1.5">
				{holdings.map(({ chain, assets }) => (
					<li key={chain.id} className="flex items-center justify-between gap-3 text-[13px]">
						<a
							href={`${chain.explorer}/address/${address}`}
							target="_blank"
							rel="noreferrer"
							className="flex items-center gap-1 text-dim hover:text-fg"
						>
							{chain.name}
							<ExternalLink size={11} strokeWidth={1.8} />
						</a>
						<span className="flex flex-wrap justify-end gap-x-3 font-mono text-[12.5px]">
							{assets.map((a) => (
								<span key={a.token}>
									{a.formatted} <span className="text-dim">{a.symbol}</span>
								</span>
							))}
						</span>
					</li>
				))}
			</ul>
			<p className="mt-2.5 flex items-start gap-1.5 border-t border-line pt-2.5 text-[11.5px] leading-relaxed text-mute">
				<Info size={12} strokeWidth={1.8} className="mt-0.5 shrink-0" />
				These are safe in your wallet, but Scarf runs on {BASE_CHAIN.name}. Bridge them to {BASE_CHAIN.name} to use them in
				chats.
			</p>
		</div>
	);
}

function AccountSection({
	address,
	onPaymentHistory,
	onDisconnect,
}: {
	address: string;
	onPaymentHistory: () => void;
	onDisconnect: () => void;
}) {
	const { exportWallet } = usePrivy();
	const { switchAccount } = useWallet();
	const wallet = useActiveWallet();
	const { isEmbedded } = useWalletIdentity();
	const [error, setError] = useState<string | null>(null);

	const run = (fallback: string, fn: () => Promise<void>) => async () => {
		setError(null);
		try {
			await fn();
		} catch (err) {
			if (!isUserRejectedError(err)) setError(getErrorMessage(err, fallback));
		}
	};

	return (
		<div className="grid gap-1">
			<p className="label mb-1 px-1">Activity</p>
			<AccountRow icon={Coins} label="Payment history" hint="Payments sent and received in chats" onClick={onPaymentHistory} />
			<AccountRow icon={ExternalLink} label="View on explorer" hint="Every transaction for this address" href={explorerAddress(address)} />

			<p className="label mb-1 mt-4 px-1">Security</p>
			{isEmbedded && (
				<AccountRow
					icon={KeyRound}
					label="Export private key"
					hint="Use this wallet in MetaMask or another app"
					onClick={run('Failed to export wallet', () => exportWallet(wallet ? { address: wallet.address } : undefined))}
				/>
			)}
			<AccountRow icon={RefreshCw} label="Switch account" hint="Log in with a different wallet or email" onClick={run('Failed to switch account', switchAccount)} />
			<AccountRow icon={LogOut} label="Log out" danger onClick={onDisconnect} />

			{error && <p className="mt-2 px-1 text-[12px] text-bad">{error}</p>}
		</div>
	);
}

function AccountRow({
	icon: Icon,
	label,
	hint,
	onClick,
	href,
	danger = false,
}: {
	icon: typeof Coins;
	label: string;
	hint?: string;
	onClick?: () => void;
	href?: string;
	danger?: boolean;
}) {
	const body = (
		<>
			<Icon size={17} strokeWidth={1.8} className={danger ? 'text-bad' : 'text-accent'} />
			<span className="min-w-0 flex-1 text-left">
				<span className={`block text-[14px] font-medium ${danger ? 'text-bad' : ''}`}>{label}</span>
				{hint && <span className="block truncate text-[12px] text-mute">{hint}</span>}
			</span>
			{href ? <ExternalLink size={14} className="text-mute" /> : !danger && <ChevronRight size={15} className="text-mute" />}
		</>
	);
	return href ? (
		<a href={href} target="_blank" rel="noreferrer" className="row">
			{body}
		</a>
	) : (
		<button onClick={onClick} className="row">
			{body}
		</button>
	);
}
