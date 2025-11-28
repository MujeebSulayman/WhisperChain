'use client';

import { useState } from 'react';
import { Coins, X } from 'lucide-react';
import type { AddressLike, BigNumberish } from 'ethers';
import { parseEther } from 'ethers';

type PaymentOptionsProps = {
    onPaymentSet: (amount: BigNumberish, token: AddressLike) => void;
    onCancel: () => void;
};

export function PaymentOptions({ onPaymentSet, onCancel }: PaymentOptionsProps) {
    const [amount, setAmount] = useState('');
    const [useToken, setUseToken] = useState(false);
    const [tokenAddress, setTokenAddress] = useState('');

    const handleSet = () => {
        if (!amount || parseFloat(amount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        try {
            const amountWei = parseEther(amount);
            const token = useToken && tokenAddress ? tokenAddress : '0x0000000000000000000000000000000000000000';
            onPaymentSet(amountWei, token);
        } catch (error) {
            alert('Invalid amount');
        }
    };

    return (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-4 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Coins className="size-4 text-sky-400" />
                    <h3 className="text-sm font-semibold text-white">Payment Options</h3>
                </div>
                <button
                    onClick={onCancel}
                    className="rounded-lg p-1 text-slate-400 hover:text-white transition-colors"
                >
                    <X className="size-4" />
                </button>
            </div>

            <div className="space-y-3">
                <div>
                    <label className="block text-xs font-medium text-slate-300 mb-2">
                        Amount (ETH)
                    </label>
                    <input
                        type="number"
                        step="0.0001"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.0"
                        className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="useToken"
                        checked={useToken}
                        onChange={(e) => setUseToken(e.target.checked)}
                        className="rounded border-white/20 bg-slate-800 text-sky-500 focus:ring-sky-500"
                    />
                    <label htmlFor="useToken" className="text-xs text-slate-300">
                        Use ERC20 token instead
                    </label>
                </div>

                {useToken && (
                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-2">
                            Token Address
                        </label>
                        <input
                            type="text"
                            value={tokenAddress}
                            onChange={(e) => setTokenAddress(e.target.value)}
                            placeholder="0x..."
                            className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all font-mono"
                        />
                    </div>
                )}

                <button
                    onClick={handleSet}
                    className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all hover:from-sky-400 hover:to-sky-500 hover:shadow-xl hover:shadow-sky-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                    Set Payment
                </button>
            </div>
        </div>
    );
}

