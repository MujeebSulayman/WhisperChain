'use client';

import { useMemo, useState } from 'react';
import { ArrowUpRight, CheckCircle2, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { Contract, ZeroAddress, isAddress, parseUnits, formatUnits } from 'ethers';
import { connectScarf } from '@/lib/blockchain';
import { BASE_CHAIN } from '@/lib/deployments';
import { getErrorMessage } from '@/lib/errors';
import { explorerTx } from '@/lib/links';
import type { WalletAsset } from '@/hooks/useWalletBalance';
import { shortAddress } from './CopyAddress';

type SendPanelProps = {
	from: string;
	assets: WalletAsset[];
	/** Prefills the recipient, e.g. the person in the open chat. */
	defaultRecipient?: string;
	onSent?: () => void;
	/** Tells the parent a transfer is in flight, so it can block closing. */
	onBusyChange?: (busy: boolean) => void;
};

const TRANSFER_ABI = ['function transfer(address to, uint256 amount) returns (bool)'];
const ETH_TRANSFER_GAS = BigInt(21_000);

/** Send ETH or a held token straight from the wallet to any address. The wallet pays the gas. */
export function SendPanel({ from, assets, defaultRecipient = '', onSent, onBusyChange }: SendPanelProps) {
	const [tokenAddr, setTokenAddr] = useState(ZeroAddress);
	const [recipient, setRecipient] = useState(defaultRecipient);
	const [amount, setAmount] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [stage, setStage] = useState<'form' | 'sending' | 'done'>('form');
	const [txHash, setTxHash] = useState('');

	const asset = assets.find((a) => a.token === tokenAddr) ?? assets[0];
	const eth = assets.find((a) => a.token === ZeroAddress);

	const amountRaw = useMemo(() => {
		if (!asset || !amount.trim()) return null;
		try {
			return parseUnits(amount.trim(), asset.decimals);
		} catch {
			return null;
		}
	}, [amount, asset]);

	const validation = (() => {
		if (!asset) return 'Loading balance…';
		if (!recipient.trim()) return null;
		if (!isAddress(recipient.trim())) return 'That isn’t a valid address';
		if (recipient.trim().toLowerCase() === from.toLowerCase()) return 'That’s your own address';
		if (amount.trim() && amountRaw === null) return 'Enter a valid amount';
		if (amountRaw !== null && amountRaw > asset.raw) return `You only have ${asset.formatted} ${asset.symbol}`;
		if (!eth || eth.raw === BigInt(0)) return `You need a little ETH on ${BASE_CHAIN.name} to pay the network fee`;
		return null;
	})();
	const canSend = !validation && recipient.trim() && amountRaw !== null && amountRaw > BigInt(0);

	const setMax = async () => {
		if (!asset) return;
		if (asset.token !== ZeroAddress) {
			setAmount(formatUnits(asset.raw, asset.decimals));
			return;
		}
		// Leave room for the fee, with headroom in case gas moves before it lands.
		try {
			const { provider } = await connectScarf();
			const fee = await provider.getFeeData();
			const perGas = fee.maxFeePerGas ?? fee.gasPrice ?? BigInt(0);
			const reserve = perGas * ETH_TRANSFER_GAS * BigInt(2);
			const max = asset.raw > reserve ? asset.raw - reserve : BigInt(0);
			setAmount(formatUnits(max, 18));
		} catch (err) {
			setError(getErrorMessage(err, 'Couldn’t estimate the network fee'));
		}
	};

	const send = async () => {
		if (!canSend || !asset || amountRaw === null) return;
		setError(null);
		setStage('sending');
		onBusyChange?.(true);
		try {
			const { signer } = await connectScarf();
			const to = recipient.trim();
			const tx =
				asset.token === ZeroAddress
					? await signer.sendTransaction({ to, value: amountRaw })
					: await new Contract(asset.token, TRANSFER_ABI, signer).transfer(to, amountRaw);
			setTxHash(tx.hash);
			await tx.wait();
			setStage('done');
			onSent?.();
		} catch (err) {
			setError(getErrorMessage(err, 'Transfer failed'));
			setStage('form');
		} finally {
			onBusyChange?.(false);
		}
	};

	const reset = () => {
		setStage('form');
		setAmount('');
		setRecipient(defaultRecipient);
		setTxHash('');
	};

	return (
			<div>
				{stage === 'done' ? (
					<div className="py-2 text-center">
						<CheckCircle2 size={40} strokeWidth={1.6} className="mx-auto text-good" />
						<p className="mt-3 text-[15px]">
							{amount} {asset?.symbol} sent to <span className="font-mono">{shortAddress(recipient.trim())}</span>
						</p>
						<a href={explorerTx(txHash)} target="_blank" rel="noreferrer" className="btn btn-sm btn-ghost mt-5">
							<ExternalLink size={14} strokeWidth={1.8} />
							View transaction
						</a>
						<button onClick={reset} className="btn btn-white mt-3 w-full">
							Send another
						</button>
					</div>
				) : (
					<div className="grid gap-3">
						{assets.length > 1 && (
							<div className="seg w-full">
								{assets.map((a) => (
									<button key={a.token} className="flex-1" aria-pressed={a.token === asset?.token} onClick={() => setTokenAddr(a.token)}>
										{a.symbol}
									</button>
								))}
							</div>
						)}

						<label className="field">
							<span className="text-[11px]">To</span>
							<input
								value={recipient}
								onChange={(e) => setRecipient(e.target.value)}
								placeholder="0x…"
								spellCheck={false}
								autoComplete="off"
								className="font-mono text-[14px]!"
							/>
						</label>

						<div className="field">
							<span className="text-[11px]">Amount</span>
							<input
								value={amount}
								onChange={(e) => setAmount(e.target.value.replace(',', '.'))}
								placeholder="0.0"
								inputMode="decimal"
								autoComplete="off"
								className="pr-28!"
							/>
							<div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
								<span className="text-[13px] text-dim">{asset?.symbol ?? 'ETH'}</span>
								<button type="button" onClick={setMax} className="pill pill-accent h-7! px-2.5! text-[11px]">
									Max
								</button>
							</div>
						</div>

						<p className="px-1 text-[12px] text-mute">
							Available: {asset ? `${asset.formatted} ${asset.symbol}` : '…'}
						</p>

						{(validation || error) && (
							<p className="flex items-start gap-2 text-[12.5px] leading-relaxed text-bad">
								<AlertCircle size={14} strokeWidth={1.8} className="mt-0.5 shrink-0" />
								{error ?? validation}
							</p>
						)}

						<button onClick={send} disabled={!canSend || stage === 'sending'} className="btn btn-white w-full disabled:opacity-50">
							{stage === 'sending' ? (
								<>
									<Loader2 size={16} className="animate-spin" />
									{txHash ? 'Confirming…' : 'Confirm in wallet…'}
								</>
							) : (
								<>
									<ArrowUpRight size={16} strokeWidth={2} />
									Send
								</>
							)}
						</button>
						<p className="text-center text-[11.5px] text-mute">
							Direct transfers aren’t gasless: your wallet pays a small {BASE_CHAIN.name} fee.
						</p>
					</div>
				)}
			</div>
	);
}
