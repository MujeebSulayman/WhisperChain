'use client';

import { useEffect, useState } from 'react';
import { Coins, X, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import type { AddressLike, BigNumberish } from 'ethers';
import { parseUnits, Contract, ZeroAddress } from 'ethers';
import { connectScarf, SCARF_ADDRESS } from '@/lib/blockchain';
import { BASE_CHAIN, PAYMENT_ASSETS, type PaymentAsset } from '@/lib/deployments';
import { getErrorMessage } from '@/lib/errors';

type PaymentOptionsProps = {
    onPaymentSet: (amount: BigNumberish, token: AddressLike) => void;
    onCancel: () => void;
};

const ERC20_ABI = [
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function allowance(address owner, address spender) external view returns (uint256)',
];

type Approval = 'idle' | 'checking' | 'approved' | 'needed' | 'approving';

/** Attach ETH or USDC to a message. USDC needs an allowance for the Scarf contract first. */
export function PaymentOptions({ onPaymentSet, onCancel }: PaymentOptionsProps) {
    const [asset, setAsset] = useState<PaymentAsset>(PAYMENT_ASSETS[0]);
    const [amount, setAmount] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [approval, setApproval] = useState<Approval>('idle');

    const isEth = asset.token === ZeroAddress;

    const amountRaw = (() => {
        try {
            const raw = parseUnits(amount.trim() || '0', asset.decimals);
            return raw > BigInt(0) ? raw : null;
        } catch {
            return null;
        }
    })();

    // Check the USDC allowance whenever the amount settles.
    useEffect(() => {
        if (isEth || amountRaw === null) {
            setApproval('idle');
            return;
        }
        let cancelled = false;
        const timer = setTimeout(async () => {
            setApproval('checking');
            try {
                const { signer } = await connectScarf();
                const owner = await signer.getAddress();
                const allowance: bigint = await new Contract(asset.token, ERC20_ABI, signer).allowance(owner, SCARF_ADDRESS);
                if (!cancelled) setApproval(allowance >= amountRaw ? 'approved' : 'needed');
            } catch (err) {
                if (!cancelled) {
                    setApproval('idle');
                    setError(getErrorMessage(err, 'Couldn’t check your USDC allowance'));
                }
            }
        }, 400);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [isEth, asset.token, amountRaw]);

    const approve = async () => {
        if (amountRaw === null) return;
        setError(null);
        setApproval('approving');
        try {
            const { signer } = await connectScarf();
            const tx = await new Contract(asset.token, ERC20_ABI, signer).approve(SCARF_ADDRESS, amountRaw);
            await tx.wait();
            setApproval('approved');
        } catch (err) {
            setError(getErrorMessage(err, 'Approval failed'));
            setApproval('needed');
        }
    };

    const attach = () => {
        setError(null);
        if (amountRaw === null) {
            setError('Enter an amount above 0');
            return;
        }
        if (!isEth && approval !== 'approved') {
            setError('Approve USDC first');
            return;
        }
        onPaymentSet(amountRaw, asset.token);
    };

    return (
        <div className="card p-4">
            <div className="mb-3 flex items-center justify-between">
                <p className="flex items-center gap-2 text-[14px] font-semibold">
                    <Coins size={16} strokeWidth={1.8} className="text-accent" />
                    Attach a payment
                </p>
                <button onClick={onCancel} className="icon-btn h-8! w-8!" aria-label="Close payment options">
                    <X size={15} strokeWidth={1.8} />
                </button>
            </div>

            <div className="grid gap-3">
                <div className="seg w-full">
                    {PAYMENT_ASSETS.map((a) => (
                        <button
                            key={a.token}
                            className="flex-1"
                            aria-pressed={a.token === asset.token}
                            onClick={() => {
                                setAsset(a);
                                setError(null);
                            }}
                        >
                            {a.symbol}
                        </button>
                    ))}
                </div>

                <div className="field">
                    <span className="text-[11px]">Amount</span>
                    <input
                        value={amount}
                        onChange={(e) => setAmount(e.target.value.replace(',', '.'))}
                        onKeyDown={(e) => e.key === 'Enter' && attach()}
                        placeholder="0.00"
                        inputMode="decimal"
                        autoComplete="off"
                        autoFocus
                        className="pr-16!"
                    />
                    <span className="absolute! left-auto! right-4 top-1/2! -translate-y-1/2 text-[13px] text-dim">{asset.symbol}</span>
                </div>

                <p className="px-1 text-[11.5px] leading-relaxed text-mute">
                    {isEth
                        ? `Sent from your wallet with the message, so you pay a small ${BASE_CHAIN.name} network fee.`
                        : `Circle's USDC on ${BASE_CHAIN.name}. The message stays gasless; approving USDC needs a little ETH for gas.`}
                </p>

                {!isEth && amountRaw !== null && (
                    <div className="inset-panel flex items-center gap-3 rounded-[var(--r-inset)] p-3">
                        {approval === 'approved' ? (
                            <>
                                <CheckCircle2 size={16} strokeWidth={1.8} className="shrink-0 text-good" />
                                <p className="flex-1 text-[12.5px]">USDC approved for this amount</p>
                            </>
                        ) : approval === 'checking' ? (
                            <>
                                <Loader2 size={16} className="shrink-0 animate-spin text-mute" />
                                <p className="flex-1 text-[12.5px] text-dim">Checking your USDC allowance…</p>
                            </>
                        ) : (
                            <>
                                <ShieldCheck size={16} strokeWidth={1.8} className="shrink-0 text-accent" />
                                <p className="flex-1 text-[12.5px] text-dim">Let Scarf move this much USDC when the message sends.</p>
                                <button onClick={approve} disabled={approval === 'approving'} className="btn btn-sm btn-accent h-8! shrink-0 disabled:opacity-60">
                                    {approval === 'approving' && <Loader2 size={14} className="animate-spin" />}
                                    {approval === 'approving' ? 'Approving…' : 'Approve'}
                                </button>
                            </>
                        )}
                    </div>
                )}

                {error && (
                    <p className="flex items-start gap-2 text-[12.5px] leading-relaxed text-bad">
                        <AlertCircle size={14} strokeWidth={1.8} className="mt-0.5 shrink-0" />
                        {error}
                    </p>
                )}

                <button
                    onClick={attach}
                    disabled={amountRaw === null || (!isEth && approval !== 'approved')}
                    className="btn btn-white w-full disabled:opacity-50"
                >
                    Attach {amountRaw !== null ? `${amount.trim()} ${asset.symbol}` : 'payment'}
                </button>
            </div>
        </div>
    );
}
