'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { AlertTriangle, Check, Copy, Droplets, ExternalLink, Link2, Share2 } from 'lucide-react';
import { BASE_CHAIN } from '@/lib/deployments';
import { FAUCET_URL, chatInviteUrl, explorerAddress } from '@/lib/links';
import { useCopy } from './CopyAddress';

/** Everything someone needs to pay or message you: QR, full address, and a chat invite link. */
export function ReceivePanel({ address }: { address: string }) {
	const addressCopy = useCopy();
	const linkCopy = useCopy();
	const [view, setView] = useState<'address' | 'invite'>('address');
	const inviteUrl = chatInviteUrl(address);
	const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
	const qrValue = view === 'address' ? address : inviteUrl;

	const share = async () => {
		try {
			await navigator.share({
				title: 'Message me on Scarf',
				text: `Message me on Scarf, or pay me on ${BASE_CHAIN.name}: ${address}`,
				url: inviteUrl,
			});
		} catch {
			// The user closed the share sheet.
		}
	};

	return (
			<div>
				<div className="seg w-full">
					<button className="flex-1" aria-pressed={view === 'address'} onClick={() => setView('address')}>
						Payments
					</button>
					<button className="flex-1" aria-pressed={view === 'invite'} onClick={() => setView('invite')}>
						Chat invite
					</button>
				</div>

				<div className="mt-4 grid place-items-center">
					{/* Always dark-on-white so every scanner can read it, in either theme. */}
					<div className="rounded-[20px] bg-white p-4 shadow-sm">
						<QRCodeSVG value={qrValue} size={188} level="M" marginSize={0} bgColor="#ffffff" fgColor="#0b0b0f" />
					</div>
					<p className="mt-3 text-center text-[12.5px] text-dim">
						{view === 'address'
							? `Scan to send ETH or tokens on ${BASE_CHAIN.name}.`
							: 'Scan to open Scarf with a chat to you ready to start.'}
					</p>
				</div>

				{view === 'address' ? (
					<>
						<button
							onClick={() => addressCopy.copy(address)}
							className="inset-panel mt-4 w-full rounded-[var(--r-inset)] p-3 text-left transition-colors hover:bg-[color-mix(in_srgb,var(--fg)_4%,transparent)]"
							title="Copy address"
						>
							<span className="flex items-center justify-between gap-2">
								<span className="label text-[10px]!">Wallet address</span>
								<span className={`flex items-center gap-1 text-[12px] ${addressCopy.copied ? 'text-good' : 'text-accent'}`}>
									{addressCopy.copied ? <Check size={13} strokeWidth={2} /> : <Copy size={13} strokeWidth={1.8} />}
									{addressCopy.copied ? 'Copied' : 'Copy'}
								</span>
							</span>
							<span className="mt-1.5 block break-all font-mono text-[13px] leading-relaxed">{address}</span>
						</button>

						<p className="mt-3 flex items-start gap-2 text-[12px] leading-relaxed text-dim">
							<AlertTriangle size={14} strokeWidth={1.8} className="mt-0.5 shrink-0 text-warn" />
							Send on {BASE_CHAIN.name} to use funds in Scarf. Funds sent on other EVM networks (Ethereum, Arbitrum,
							Optimism) still reach this address and show under &ldquo;On other networks&rdquo;, but can&apos;t be spent here.
							Never send from Bitcoin, Solana or other non-EVM chains.
						</p>
					</>
				) : (
					<div className="inset-panel mt-4 rounded-[var(--r-inset)] p-3">
						<p className="label text-[10px]!">Invite link</p>
						<p className="mt-1.5 break-all font-mono text-[12px] leading-relaxed text-dim">{inviteUrl}</p>
					</div>
				)}

				<div className="mt-4 grid grid-cols-2 gap-2">
					<button onClick={() => linkCopy.copy(inviteUrl)} className="btn btn-sm btn-ghost">
						{linkCopy.copied ? <Check size={14} strokeWidth={2} className="text-good" /> : <Link2 size={14} strokeWidth={1.8} />}
						{linkCopy.copied ? 'Link copied' : 'Copy chat link'}
					</button>
					{canShare ? (
						<button onClick={share} className="btn btn-sm btn-ghost">
							<Share2 size={14} strokeWidth={1.8} />
							Share
						</button>
					) : (
						<a href={explorerAddress(address)} target="_blank" rel="noreferrer" className="btn btn-sm btn-ghost">
							<ExternalLink size={14} strokeWidth={1.8} />
							Explorer
						</a>
					)}
				</div>

				{FAUCET_URL && (
					<a
						href={FAUCET_URL}
						target="_blank"
						rel="noreferrer"
						className="mt-3 flex items-center justify-center gap-1.5 text-[12.5px] text-accent hover:text-fg"
					>
						<Droplets size={13} strokeWidth={1.8} />
						Need test ETH? Get some from a {BASE_CHAIN.name} faucet
					</a>
				)}
			</div>
	);
}
