'use client';

import { useEffect, useState } from 'react';
import { Coins, X, CheckCircle2 } from 'lucide-react';
import { ZeroAddress } from 'ethers';
import type { BigNumberish, AddressLike } from 'ethers';
import { formatTokenAmount } from '@WhisperChain/lib/token';
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
                borderRadius: '0.75rem',
                background: isReceived
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.95) 100%)'
                    : 'linear-gradient(135deg, rgba(245, 158, 11, 0.95) 0%, rgba(217, 119, 6, 0.95) 100%)',
                border: `1px solid ${isReceived ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
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
                        background: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    {isReceived ? (
                        <CheckCircle2 style={{ width: '1.5rem', height: '1.5rem', color: '#ffffff' }} />
                    ) : (
                        <Coins style={{ width: '1.5rem', height: '1.5rem', color: '#ffffff' }} />
                    )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                        style={{
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: '#ffffff',
                            marginBottom: '0.25rem',
                        }}
                    >
                        {isReceived ? 'Payment Received!' : 'Payment Sent'}
                    </div>
                    <div
                        style={{
                            fontSize: '1.125rem',
                            fontWeight: 700,
                            color: '#ffffff',
                            marginBottom: '0.375rem',
                        }}
                    >
                        {tokenInfo.loading ? '...' : amountStr} {label}
                    </div>
                    {isReceived && from && (
                        <div
                            style={{
                                fontSize: '0.75rem',
                                color: 'rgba(255, 255, 255, 0.8)',
                                fontFamily: 'monospace',
                            }}
                        >
                            From: {from.slice(0, 6)}...{from.slice(-4)}
                        </div>
                    )}
                    {!isReceived && to && (
                        <div
                            style={{
                                fontSize: '0.75rem',
                                color: 'rgba(255, 255, 255, 0.8)',
                                fontFamily: 'monospace',
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
                        borderRadius: '0.5rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.7)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
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
        </div>
    );
}

