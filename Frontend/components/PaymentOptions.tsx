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
    const [error, setError] = useState<string | null>(null);

    const handleSet = () => {
        setError(null);

        if (!amount || parseFloat(amount) <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (useToken && !tokenAddress.trim()) {
            setError('Token address is required when using ERC20');
            return;
        }

        try {
            const amountWei = parseEther(amount);
            const token = useToken && tokenAddress ? tokenAddress : '0x0000000000000000000000000000000000000000';
            onPaymentSet(amountWei, token);
        } catch (error) {
            setError('Invalid amount format');
        }
    };

    return (
        <div
            style={{
                borderRadius: '0.5rem',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(26, 26, 26, 0.95)',
                padding: '1rem',
                backdropFilter: 'blur(10px)',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Coins style={{ width: '1rem', height: '1rem', color: 'rgba(255, 255, 255, 0.7)' }} />
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff' }}>Payment Options</h3>
                </div>
                <button
                    onClick={onCancel}
                    style={{
                        padding: '0.375rem',
                        borderRadius: '0.5rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.7)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                    }}
                >
                    <X style={{ width: '1rem', height: '1rem' }} />
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.5rem' }}>
                        Amount (ETH)
                    </label>
                    <input
                        type="number"
                        step="0.0001"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.0"
                        style={{
                            width: '100%',
                            borderRadius: '0.5rem',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            background: 'rgba(255, 255, 255, 0.03)',
                            padding: '0.625rem 0.75rem',
                            fontSize: '0.875rem',
                            color: '#ffffff',
                            outline: 'none',
                            transition: 'all 0.2s',
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                        type="checkbox"
                        id="useToken"
                        checked={useToken}
                        onChange={(e) => setUseToken(e.target.checked)}
                        style={{
                            width: '1rem',
                            height: '1rem',
                            borderRadius: '0.25rem',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            background: useToken ? '#ffffff' : 'transparent',
                            cursor: 'pointer',
                        }}
                    />
                    <label htmlFor="useToken" style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)', cursor: 'pointer' }}>
                        Use ERC20 token instead
                    </label>
                </div>

                {useToken && (
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.5rem' }}>
                            Token Address
                        </label>
                        <input
                            type="text"
                            value={tokenAddress}
                            onChange={(e) => setTokenAddress(e.target.value)}
                            placeholder="0x..."
                            style={{
                                width: '100%',
                                borderRadius: '0.5rem',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                background: 'rgba(255, 255, 255, 0.03)',
                                padding: '0.625rem 0.75rem',
                                fontSize: '0.875rem',
                                color: '#ffffff',
                                fontFamily: 'monospace',
                                outline: 'none',
                                transition: 'all 0.2s',
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                            }}
                        />
                    </div>
                )}

                {error && (
                    <div
                        style={{
                            borderRadius: '0.5rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            padding: '0.75rem',
                        }}
                    >
                        <p style={{ fontSize: '0.75rem', color: '#fca5a5' }}>{error}</p>
                    </div>
                )}

                <button
                    onClick={handleSet}
                    style={{
                        width: '100%',
                        borderRadius: '0.5rem',
                        background: '#ffffff',
                        border: 'none',
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#0f0f0f',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.9';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                    }}
                >
                    Set Payment
                </button>
            </div>
        </div>
    );
}
