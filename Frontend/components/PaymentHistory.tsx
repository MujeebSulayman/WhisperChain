'use client';

import { useState, useEffect } from 'react';
import { Coins, ArrowUpRight, ArrowDownLeft, ExternalLink, Loader2 } from 'lucide-react';
import { formatEther, ZeroAddress } from 'ethers';
import { fetchUserMessages, fetchMessage, isPaymentSettled } from '@WhisperChain/lib/whisperchainActions';
import { BASE_CHAIN } from '@WhisperChain/lib/blockchain';
import { formatTokenAmount } from '@WhisperChain/lib/token';
import { useTokenInfo } from '../hooks/useTokenInfo';
import type { AddressLike, BytesLike } from 'ethers';
import { format } from 'date-fns';

type PaymentTransaction = {
    messageId: string;
    amount: bigint;
    token: string;
    timestamp: number;
    isReceived: boolean;
    from: string;
    to: string;
    settled: boolean;
    status: 'pending' | 'settled';
};

type PaymentHistoryProps = {
    userAddress: string;
    onClose: () => void;
};

export function PaymentHistory({ userAddress, onClose }: PaymentHistoryProps) {
    const [payments, setPayments] = useState<PaymentTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'sent' | 'received' | 'pending'>('all');

    useEffect(() => {
        loadPayments();
    }, [userAddress]);

    const loadPayments = async () => {
        if (!userAddress) return;

        try {
            setIsLoading(true);
            const messageIds = await fetchUserMessages(userAddress);
            const paymentPromises: Promise<PaymentTransaction | null>[] = [];

            for (const id of messageIds.slice(0, 100)) {
                paymentPromises.push(
                    (async () => {
                        try {
                            const msg = await fetchMessage(id);
                            if (msg.paymentAmount && msg.paymentAmount > BigInt(0)) {
                                const isReceived = msg.recipient.toLowerCase() === userAddress.toLowerCase();
                                const settled = await isPaymentSettled(id);
                                const messageIdStr = typeof id === 'string' ? id : String(id);
                                return {
                                    messageId: messageIdStr,
                                    amount: msg.paymentAmount,
                                    token: msg.paymentToken,
                                    timestamp: Number(msg.timestamp),
                                    isReceived,
                                    from: msg.sender,
                                    to: msg.recipient,
                                    settled,
                                    status: settled ? 'settled' : 'pending',
                                };
                            }
                            return null;
                        } catch {
                            return null;
                        }
                    })()
                );
            }

            const results = await Promise.all(paymentPromises);
            const validPayments = results.filter((p): p is PaymentTransaction => p !== null);
            validPayments.sort((a, b) => b.timestamp - a.timestamp);
            setPayments(validPayments);
        } catch (error) {
            console.error('Failed to load payments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredPayments = payments.filter((p) => {
        if (filter === 'sent') return !p.isReceived;
        if (filter === 'received') return p.isReceived;
        if (filter === 'pending') return !p.settled;
        return true;
    });

    const ethOnly = (p: PaymentTransaction) => !p.token || p.token === ZeroAddress;
    const totalReceived = payments.filter((p) => p.isReceived && p.settled && ethOnly(p)).reduce((sum, p) => sum + p.amount, BigInt(0));
    const totalSent = payments.filter((p) => !p.isReceived && ethOnly(p)).reduce((sum, p) => sum + p.amount, BigInt(0));
    const pendingReceived = payments.filter((p) => p.isReceived && !p.settled && ethOnly(p)).reduce((sum, p) => sum + p.amount, BigInt(0));

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(4px)',
                padding: '1rem',
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: '48rem',
                    maxHeight: '90vh',
                    borderRadius: '1rem',
                    background: 'var(--surface)',
                    border: '1px solid color-mix(in srgb, var(--fg) 10%, transparent)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    style={{
                        padding: '1.5rem',
                        borderBottom: '1px solid color-mix(in srgb, var(--fg) 10%, transparent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--fg)', marginBottom: '0.5rem' }}>
                            Payment History
                        </h2>
                        <p style={{ fontSize: '0.875rem', color: 'color-mix(in srgb, var(--fg) 60%, transparent)' }}>
                            View all payment transactions on Base
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '0.5rem',
                            borderRadius: '0.875rem',
                            background: 'transparent',
                            border: '1px solid color-mix(in srgb, var(--fg) 10%, transparent)',
                            color: 'color-mix(in srgb, var(--fg) 70%, transparent)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'color-mix(in srgb, var(--fg) 5%, transparent)';
                            e.currentTarget.style.color = 'var(--fg)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'color-mix(in srgb, var(--fg) 70%, transparent)';
                        }}
                    >
                        <ExternalLink style={{ width: '1.25rem', height: '1.25rem' }} />
                    </button>
                </div>

                <div
                    style={{
                        padding: '1.5rem',
                        borderBottom: '1px solid color-mix(in srgb, var(--fg) 10%, transparent)',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))',
                        gap: '1rem',
                    }}
                >
                    <div
                        style={{
                            padding: '1rem',
                            borderRadius: '1.25rem',
                            background: 'color-mix(in srgb, var(--good) 10%, transparent)',
                            border: '1px solid color-mix(in srgb, var(--good) 20%, transparent)',
                        }}
                    >
                        <div style={{ fontSize: '0.75rem', color: 'color-mix(in srgb, var(--fg) 60%, transparent)', marginBottom: '0.5rem' }}>
                            Total Received (ETH)
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--good)' }}>
                            {formatEther(totalReceived)} Base ETH
                        </div>
                    </div>
                    <div
                        style={{
                            padding: '1rem',
                            borderRadius: '1.25rem',
                            background: 'color-mix(in srgb, var(--warn) 10%, transparent)',
                            border: '1px solid color-mix(in srgb, var(--warn) 20%, transparent)',
                        }}
                    >
                        <div style={{ fontSize: '0.75rem', color: 'color-mix(in srgb, var(--fg) 60%, transparent)', marginBottom: '0.5rem' }}>
                            Total Sent (ETH)
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--warn)' }}>
                            {formatEther(totalSent)} Base ETH
                        </div>
                    </div>
                    <div
                        style={{
                            padding: '1rem',
                            borderRadius: '1.25rem',
                            background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
                            border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
                        }}
                    >
                        <div style={{ fontSize: '0.75rem', color: 'color-mix(in srgb, var(--fg) 60%, transparent)', marginBottom: '0.5rem' }}>
                            Pending (ETH)
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--accent)' }}>
                            {formatEther(pendingReceived)} Base ETH
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        padding: '1rem 1.5rem',
                        borderBottom: '1px solid color-mix(in srgb, var(--fg) 10%, transparent)',
                        display: 'flex',
                        gap: '0.5rem',
                        flexWrap: 'wrap',
                    }}
                >
                    {(['all', 'sent', 'received', 'pending'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '0.875rem',
                                background: filter === f ? 'color-mix(in srgb, var(--accent) 20%, transparent)' : 'transparent',
                                border: `1px solid ${filter === f ? 'color-mix(in srgb, var(--accent) 30%, transparent)' : 'color-mix(in srgb, var(--fg) 10%, transparent)'}`,
                                color: filter === f ? 'var(--accent)' : 'color-mix(in srgb, var(--fg) 70%, transparent)',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textTransform: 'capitalize',
                            }}
                            onMouseEnter={(e) => {
                                if (filter !== f) {
                                    e.currentTarget.style.background = 'color-mix(in srgb, var(--fg) 5%, transparent)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (filter !== f) {
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                    {isLoading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
                            <Loader2 style={{ width: '2rem', height: '2rem', color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
                        </div>
                    ) : filteredPayments.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <Coins style={{ width: '3rem', height: '3rem', color: 'color-mix(in srgb, var(--fg) 20%, transparent)', margin: '0 auto 1rem' }} />
                            <p style={{ color: 'color-mix(in srgb, var(--fg) 50%, transparent)' }}>No payments found</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {filteredPayments.map((payment) => (
                                <PaymentHistoryRow key={payment.messageId} payment={payment} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function PaymentHistoryRow({ payment }: { payment: PaymentTransaction }) {
    const tokenInfo = useTokenInfo(payment.token ?? ZeroAddress);
    const amountStr = formatTokenAmount(payment.amount, tokenInfo.decimals);
    const label = (payment.token ?? ZeroAddress) === ZeroAddress ? 'Base ETH' : tokenInfo.symbol;

    return (
        <div
            style={{
                padding: '1rem',
                borderRadius: '1.25rem',
                background: payment.isReceived
                    ? payment.settled
                        ? 'color-mix(in srgb, var(--good) 10%, transparent)'
                        : 'color-mix(in srgb, var(--accent) 10%, transparent)'
                    : 'color-mix(in srgb, var(--warn) 10%, transparent)',
                border: `1px solid ${payment.isReceived
                    ? payment.settled
                        ? 'color-mix(in srgb, var(--good) 20%, transparent)'
                        : 'color-mix(in srgb, var(--accent) 20%, transparent)'
                    : 'color-mix(in srgb, var(--warn) 20%, transparent)'
                    }`,
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
            }}
        >
            <div
                style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '50%',
                    background: payment.isReceived
                        ? payment.settled
                            ? 'color-mix(in srgb, var(--good) 20%, transparent)'
                            : 'color-mix(in srgb, var(--accent) 20%, transparent)'
                        : 'color-mix(in srgb, var(--warn) 20%, transparent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                {payment.isReceived ? (
                    <ArrowDownLeft
                        style={{
                            width: '1.25rem',
                            height: '1.25rem',
                            color: payment.settled ? 'var(--good)' : 'var(--accent)',
                        }}
                    />
                ) : (
                    <ArrowUpRight style={{ width: '1.25rem', height: '1.25rem', color: 'var(--warn)' }} />
                )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--fg)' }}>
                        {tokenInfo.loading ? '...' : amountStr} {label}
                    </span>
                    {!payment.settled && (
                        <span
                            style={{
                                padding: '0.125rem 0.5rem',
                                borderRadius: '0.25rem',
                                background: 'color-mix(in srgb, var(--accent) 20%, transparent)',
                                color: 'var(--accent)',
                                fontSize: '0.6875rem',
                                fontWeight: 500,
                            }}
                        >
                            Pending
                        </span>
                    )}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'color-mix(in srgb, var(--fg) 60%, transparent)', fontFamily: 'var(--font-mono)' }}>
                    {payment.isReceived ? 'From' : 'To'}:{' '}
                    {(payment.isReceived ? payment.from : payment.to).slice(0, 6)}...
                    {(payment.isReceived ? payment.from : payment.to).slice(-4)}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'color-mix(in srgb, var(--fg) 50%, transparent)', marginTop: '0.25rem' }}>
                    {format(new Date(payment.timestamp * 1000), 'MMM d, yyyy HH:mm')}
                </div>
            </div>
            <a
                href={`${BASE_CHAIN.explorer}/tx/${payment.messageId}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    padding: '0.5rem',
                    borderRadius: '0.875rem',
                    background: 'transparent',
                    border: '1px solid color-mix(in srgb, var(--fg) 10%, transparent)',
                    color: 'color-mix(in srgb, var(--fg) 70%, transparent)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'color-mix(in srgb, var(--fg) 5%, transparent)';
                    e.currentTarget.style.color = 'var(--fg)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'color-mix(in srgb, var(--fg) 70%, transparent)';
                }}
            >
                <ExternalLink style={{ width: '1rem', height: '1rem' }} />
            </a>
        </div>
    );
}

