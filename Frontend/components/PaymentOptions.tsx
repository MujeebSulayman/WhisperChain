'use client';

import { useState } from 'react';
import { Coins, X, AlertCircle } from 'lucide-react';
import type { AddressLike, BigNumberish } from 'ethers';
import { parseUnits, ZeroAddress } from 'ethers';
import { BASE_CHAIN, PAYMENT_ASSETS, type PaymentAsset } from '@/lib/deployments';

type PaymentOptionsProps = {
    onPaymentSet: (amount: BigNumberish, token: AddressLike) => void;
    onCancel: () => void;
};

/** Attach ETH or USDC to a message. USDC is authorized with a signature when the message sends. */
export function PaymentOptions({ onPaymentSet, onCancel }: PaymentOptionsProps) {
    const [asset, setAsset] = useState<PaymentAsset>(PAYMENT_ASSETS[0]);
    const [amount, setAmount] = useState('');
    const [error, setError] = useState<string | null>(null);

    const isEth = asset.token === ZeroAddress;

    const amountRaw = (() => {
        try {
            const raw = parseUnits(amount.trim() || '0', asset.decimals);
            return raw > BigInt(0) ? raw : null;
        } catch {
            return null;
        }
    })();

    const attach = () => {
        setError(null);
        if (amountRaw === null) {
            setError('Enter an amount above 0');
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
                        ? `Sent privately from your wallet, so you pay a small ${BASE_CHAIN.name} network fee.`
                        : `Circle's USDC on ${BASE_CHAIN.name}, sent privately. No gas: you just sign to authorize this amount.`}
                </p>

                {error && (
                    <p className="flex items-start gap-2 text-[12.5px] leading-relaxed text-bad">
                        <AlertCircle size={14} strokeWidth={1.8} className="mt-0.5 shrink-0" />
                        {error}
                    </p>
                )}

                <button
                    onClick={attach}
                    disabled={amountRaw === null}
                    className="btn btn-white w-full disabled:opacity-50"
                >
                    Attach {amountRaw !== null ? `${amount.trim()} ${asset.symbol}` : 'payment'}
                </button>
            </div>
        </div>
    );
}
