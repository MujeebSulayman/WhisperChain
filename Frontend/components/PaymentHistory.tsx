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
                    background: '#1a1a1a',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    style={{
                        padding: '1.5rem',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.5rem' }}>
                            Payment History
                        </h2>
                        <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                            View all payment transactions on Base
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '0.5rem',
                            borderRadius: '0.5rem',
                            background: 'transparent',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
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
                        <ExternalLink style={{ width: '1.25rem', height: '1.25rem' }} />
                    </button>
                </div>

                <div
                    style={{
                        padding: '1.5rem',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))',
                        gap: '1rem',
                    }}
                >
                    <div
                        style={{
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                        }}
                    >
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.5rem' }}>
                            Total Received (ETH)
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#10b981' }}>
                            {formatEther(totalReceived)} Base ETH
                        </div>
                    </div>
                    <div
                        style={{
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            background: 'rgba(245, 158, 11, 0.1)',
                            border: '1px solid rgba(245, 158, 11, 0.2)',
                        }}
                    >
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.5rem' }}>
                            Total Sent (ETH)
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fbbf24' }}>
                            {formatEther(totalSent)} Base ETH
                        </div>
                    </div>
                    <div
                        style={{
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                        }}
                    >
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.5rem' }}>
                            Pending (ETH)
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#a5b4fc' }}>
                            {formatEther(pendingReceived)} Base ETH
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        padding: '1rem 1.5rem',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
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
                                borderRadius: '0.5rem',
                                background: filter === f ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                border: `1px solid ${filter === f ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                                color: filter === f ? '#a5b4fc' : 'rgba(255, 255, 255, 0.7)',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textTransform: 'capitalize',
                            }}
                            onMouseEnter={(e) => {
                                if (filter !== f) {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
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
                            <Loader2 style={{ width: '2rem', height: '2rem', color: '#6366f1', animation: 'spin 1s linear infinite' }} />
                        </div>
                    ) : filteredPayments.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <Coins style={{ width: '3rem', height: '3rem', color: 'rgba(255, 255, 255, 0.2)', margin: '0 auto 1rem' }} />
                            <p style={{ color: 'rgba(255, 255, 255, 0.5)' }}>No payments found</p>
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
                borderRadius: '0.75rem',
                background: payment.isReceived
                    ? payment.settled
                        ? 'rgba(16, 185, 129, 0.1)'
                        : 'rgba(99, 102, 241, 0.1)'
                    : 'rgba(245, 158, 11, 0.1)',
                border: `1px solid ${payment.isReceived
                    ? payment.settled
                        ? 'rgba(16, 185, 129, 0.2)'
                        : 'rgba(99, 102, 241, 0.2)'
                    : 'rgba(245, 158, 11, 0.2)'
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
                            ? 'rgba(16, 185, 129, 0.2)'
                            : 'rgba(99, 102, 241, 0.2)'
                        : 'rgba(245, 158, 11, 0.2)',
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
                            color: payment.settled ? '#10b981' : '#a5b4fc',
                        }}
                    />
                ) : (
                    <ArrowUpRight style={{ width: '1.25rem', height: '1.25rem', color: '#fbbf24' }} />
                )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#ffffff' }}>
                        {tokenInfo.loading ? '...' : amountStr} {label}
                    </span>
                    {!payment.settled && (
                        <span
                            style={{
                                padding: '0.125rem 0.5rem',
                                borderRadius: '0.25rem',
                                background: 'rgba(99, 102, 241, 0.2)',
                                color: '#a5b4fc',
                                fontSize: '0.6875rem',
                                fontWeight: 500,
                            }}
                        >
                            Pending
                        </span>
                    )}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', fontFamily: 'monospace' }}>
                    {payment.isReceived ? 'From' : 'To'}:{' '}
                    {(payment.isReceived ? payment.from : payment.to).slice(0, 6)}...
                    {(payment.isReceived ? payment.from : payment.to).slice(-4)}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.25rem' }}>
                    {format(new Date(payment.timestamp * 1000), 'MMM d, yyyy HH:mm')}
                </div>
            </div>
            <a
                href={`${BASE_CHAIN.explorer}/tx/${payment.messageId}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.7)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    flexShrink: 0,
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
                <ExternalLink style={{ width: '1rem', height: '1rem' }} />
            </a>
        </div>
    );
}

