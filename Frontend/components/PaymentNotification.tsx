'use client';

import { useEffect, useState } from 'react';
import { Coins, X, CheckCircle2 } from 'lucide-react';
import { ZeroAddress } from 'ethers';
import type { BigNumberish, AddressLike } from 'ethers';
import { formatTokenAmount } from '@/lib/token';
import { useTokenInfo } from '../hooks/useTokenInfo';

type PaymentNotificationProps = {
    paymentAmount: BigNumberish;
    paymentToken?: AddressLike;
    isReceived: boolean;
    from?: string;
    to?: string;
    onDismiss: () => void;
};

export function PaymentNotification({
    paymentAmount,
    paymentToken,
    isReceived,
    from,
    to,
    onDismiss,
}: PaymentNotificationProps) {
    const [isVisible, setIsVisible] = useState(false);
    const tokenAddr = paymentToken != null ? String(paymentToken) : ZeroAddress;
    const tokenInfo = useTokenInfo(tokenAddr);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onDismiss, 300);
        }, 5000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    const amountStr = formatTokenAmount(BigInt(paymentAmount ?? 0), tokenInfo.decimals);
    const label = tokenAddr === ZeroAddress ? 'Base ETH' : tokenInfo.symbol;

    return (
        <div
            style={{
                position: 'fixed',
                top: '1rem',
                right: '1rem',
                zIndex: 1000,
                maxWidth: '24rem',
                borderRadius: '1.25rem',
                background: isReceived
                    ? 'linear-gradient(135deg, color-mix(in srgb, var(--good) 95%, transparent) 0%, color-mix(in srgb, var(--good) 95%, transparent) 100%)'
                    : 'linear-gradient(135deg, color-mix(in srgb, var(--warn) 95%, transparent) 0%, color-mix(in srgb, var(--warn) 95%, transparent) 100%)',
                border: `1px solid ${isReceived ? 'color-mix(in srgb, var(--good) 30%, transparent)' : 'color-mix(in srgb, var(--warn) 30%, transparent)'}`,
                padding: '1rem',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(10px)',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
                transition: 'all 0.3s ease-out',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div
                    style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: '50%',
                        background: 'color-mix(in srgb, var(--fg) 20%, transparent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    {isReceived ? (
                        <CheckCircle2 style={{ width: '1.5rem', height: '1.5rem', color: 'var(--fg)' }} />
                    ) : (
                        <Coins style={{ width: '1.5rem', height: '1.5rem', color: 'var(--fg)' }} />
                    )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                        style={{
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: 'var(--fg)',
                            marginBottom: '0.25rem',
                        }}
                    >
                        {isReceived ? 'Payment Received!' : 'Payment Sent'}
                    </div>
                    <div
                        style={{
                            fontSize: '1.125rem',
                            fontWeight: 700,
                            color: 'var(--fg)',
                            marginBottom: '0.375rem',
                        }}
                    >
                        {tokenInfo.loading ? '...' : amountStr} {label}
                    </div>
                    {isReceived && from && (
                        <div
                            style={{
                                fontSize: '0.75rem',
                                color: 'color-mix(in srgb, var(--fg) 80%, transparent)',
                                fontFamily: 'var(--font-mono)',
                            }}
                        >
                            From: {from.slice(0, 6)}...{from.slice(-4)}
                        </div>
                    )}
                    {!isReceived && to && (
                        <div
                            style={{
                                fontSize: '0.75rem',
                                color: 'color-mix(in srgb, var(--fg) 80%, transparent)',
                                fontFamily: 'var(--font-mono)',
                            }}
                        >
                            To: {to.slice(0, 6)}...{to.slice(-4)}
                        </div>
                    )}
                </div>
                <button
                    onClick={() => {
                        setIsVisible(false);
                        setTimeout(onDismiss, 300);
                    }}
                    style={{
                        padding: '0.25rem',
                        borderRadius: '0.875rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'color-mix(in srgb, var(--fg) 70%, transparent)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'color-mix(in srgb, var(--fg) 10%, transparent)';
                        e.currentTarget.style.color = 'var(--fg)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'color-mix(in srgb, var(--fg) 70%, transparent)';
                    }}
                >
                    <X style={{ width: '1rem', height: '1rem' }} />
                </button>
            </div>
        </div>
    );
}

