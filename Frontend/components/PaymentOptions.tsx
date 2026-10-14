'use client';

import { useState, useEffect } from 'react';
import { Coins, X, Loader2, CheckCircle2 } from 'lucide-react';
import type { AddressLike, BigNumberish } from 'ethers';
import { parseEther, parseUnits, Contract, ZeroAddress } from 'ethers';
import { connectWhisperChain, WHISPERCHAIN_ADDRESS } from '@WhisperChain/lib/blockchain';

type PaymentOptionsProps = {
    onPaymentSet: (amount: BigNumberish, token: AddressLike) => void;
    onCancel: () => void;
};

const ERC20_ABI = [
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function allowance(address owner, address spender) external view returns (uint256)',
    'function decimals() external view returns (uint8)',
];

async function getTokenAmountRaw(tokenAddress: string, amountHuman: string, signer: import('ethers').Signer): Promise<bigint> {
    const tokenContract = new Contract(tokenAddress, ERC20_ABI, signer);
    const decimals = await tokenContract.decimals();
    return parseUnits(amountHuman, Number(decimals));
}

export function PaymentOptions({ onPaymentSet, onCancel }: PaymentOptionsProps) {
    const [amount, setAmount] = useState('');
    const [useToken, setUseToken] = useState(false);
    const [tokenAddress, setTokenAddress] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isCheckingApproval, setIsCheckingApproval] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [approvalStatus, setApprovalStatus] = useState<'none' | 'checking' | 'approved' | 'needs-approval'>('none');

    const checkApproval = async () => {
        if (!useToken || !tokenAddress.trim() || !amount) return;

        try {
            setIsCheckingApproval(true);
            setError(null);
            const { signer } = await connectWhisperChain();
            const userAddress = await signer.getAddress();
            const tokenContract = new Contract(tokenAddress, ERC20_ABI, signer);
            const amountRaw = await getTokenAmountRaw(tokenAddress, amount, signer);
            const allowance = await tokenContract.allowance(userAddress, WHISPERCHAIN_ADDRESS);

            if (allowance >= amountRaw) {
                setApprovalStatus('approved');
            } else {
                setApprovalStatus('needs-approval');
            }
        } catch (error: any) {
            setError(`Failed to check approval: ${error.message}`);
            setApprovalStatus('none');
        } finally {
            setIsCheckingApproval(false);
        }
    };

    const handleApprove = async () => {
        if (!useToken || !tokenAddress.trim() || !amount) return;

        try {
            setIsApproving(true);
            setError(null);
            const { signer } = await connectWhisperChain();
            const tokenContract = new Contract(tokenAddress, ERC20_ABI, signer);
            const amountRaw = await getTokenAmountRaw(tokenAddress, amount, signer);
            const tx = await tokenContract.approve(WHISPERCHAIN_ADDRESS, amountRaw);
            await tx.wait();
            setApprovalStatus('approved');
        } catch (error: any) {
            setError(`Approval failed: ${error.message}`);
        } finally {
            setIsApproving(false);
        }
    };

    const handleSet = async () => {
        setError(null);

        if (!amount || parseFloat(amount) <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (useToken && !tokenAddress.trim()) {
            setError('Token address is required when using ERC20');
            return;
        }

        if (useToken && approvalStatus !== 'approved') {
            setError('Please approve token spending first');
            return;
        }

        try {
            let amountRaw: bigint;
            if (useToken && tokenAddress.trim()) {
                const { signer } = await connectWhisperChain();
                amountRaw = await getTokenAmountRaw(tokenAddress, amount, signer);
            } else {
                amountRaw = parseEther(amount);
            }
            const token = useToken && tokenAddress ? tokenAddress : ZeroAddress;
            onPaymentSet(amountRaw, token);
        } catch (error) {
            setError('Invalid amount format');
        }
    };

    useEffect(() => {
        if (useToken && tokenAddress.trim() && amount) {
            const timer = setTimeout(() => {
                checkApproval();
            }, 500);
            return () => clearTimeout(timer);
        } else {
            setApprovalStatus('none');
        }
    }, [useToken, tokenAddress, amount]);

    return (
        <div
            style={{
                borderRadius: '0.875rem',
                border: '1px solid color-mix(in srgb, var(--fg) 8%, transparent)',
                background: 'var(--surface)',
                padding: '1rem',
                backdropFilter: 'blur(10px)',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Coins style={{ width: '1rem', height: '1rem', color: 'color-mix(in srgb, var(--fg) 70%, transparent)' }} />
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--fg)' }}>Payment Options</h3>
                </div>
                <button
                    onClick={onCancel}
                    style={{
                        padding: '0.375rem',
                        borderRadius: '0.875rem',
                        background: 'transparent',
                        border: 'none',
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
                    <X style={{ width: '1rem', height: '1rem' }} />
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'color-mix(in srgb, var(--fg) 70%, transparent)', marginBottom: '0.5rem' }}>
                        Amount {useToken ? '(token units)' : '(Base ETH)'}
                    </label>
                    <input
                        type="number"
                        step="0.0001"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.0"
                        style={{
                            width: '100%',
                            borderRadius: '0.875rem',
                            border: '1px solid color-mix(in srgb, var(--fg) 10%, transparent)',
                            background: 'color-mix(in srgb, var(--fg) 3%, transparent)',
                            padding: '0.625rem 0.75rem',
                            fontSize: '0.875rem',
                            color: 'var(--fg)',
                            outline: 'none',
                            transition: 'all 0.2s',
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--fg) 20%, transparent)';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--fg) 10%, transparent)';
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
                            border: '1px solid color-mix(in srgb, var(--fg) 20%, transparent)',
                            background: useToken ? 'var(--btn-white-bg)' : 'transparent',
                            cursor: 'pointer',
                        }}
                    />
                    <label htmlFor="useToken" style={{ fontSize: '0.75rem', color: 'color-mix(in srgb, var(--fg) 70%, transparent)', cursor: 'pointer' }}>
                        Use ERC20 token instead
                    </label>
                </div>

                {useToken && (
                    <>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'color-mix(in srgb, var(--fg) 70%, transparent)', marginBottom: '0.5rem' }}>
                                Token Address (Base Network)
                            </label>
                            <input
                                type="text"
                                value={tokenAddress}
                                onChange={(e) => setTokenAddress(e.target.value)}
                                placeholder="0x..."
                                style={{
                                    width: '100%',
                                    borderRadius: '0.875rem',
                                    border: '1px solid color-mix(in srgb, var(--fg) 10%, transparent)',
                                    background: 'color-mix(in srgb, var(--fg) 3%, transparent)',
                                    padding: '0.625rem 0.75rem',
                                    fontSize: '0.875rem',
                                    color: 'var(--fg)',
                                    fontFamily: 'var(--font-mono)',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--fg) 20%, transparent)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--fg) 10%, transparent)';
                                }}
                            />
                        </div>
                        {tokenAddress.trim() && amount && (
                            <div
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: '0.875rem',
                                    background:
                                        approvalStatus === 'approved'
                                            ? 'color-mix(in srgb, var(--good) 10%, transparent)'
                                            : approvalStatus === 'needs-approval'
                                                ? 'color-mix(in srgb, var(--warn) 10%, transparent)'
                                                : 'color-mix(in srgb, var(--fg) 3%, transparent)',
                                    border: `1px solid ${approvalStatus === 'approved'
                                            ? 'color-mix(in srgb, var(--good) 20%, transparent)'
                                            : approvalStatus === 'needs-approval'
                                                ? 'color-mix(in srgb, var(--warn) 20%, transparent)'
                                                : 'color-mix(in srgb, var(--fg) 10%, transparent)'
                                        }`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '0.75rem',
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    {isCheckingApproval ? (
                                        <div style={{ fontSize: '0.75rem', color: 'color-mix(in srgb, var(--fg) 60%, transparent)' }}>
                                            Checking approval...
                                        </div>
                                    ) : approvalStatus === 'approved' ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <CheckCircle2 style={{ width: '1rem', height: '1rem', color: 'var(--good)' }} />
                                            <span style={{ fontSize: '0.75rem', color: 'var(--good)', fontWeight: 500 }}>
                                                Token approved
                                            </span>
                                        </div>
                                    ) : approvalStatus === 'needs-approval' ? (
                                        <div style={{ fontSize: '0.75rem', color: 'var(--warn)' }}>
                                            Approval required before sending
                                        </div>
                                    ) : null}
                                </div>
                                {approvalStatus === 'needs-approval' && (
                                    <button
                                        onClick={handleApprove}
                                        disabled={isApproving}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '0.875rem',
                                            background: 'var(--warn)',
                                            border: 'none',
                                            color: 'var(--btn-white-fg)',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            cursor: isApproving ? 'not-allowed' : 'pointer',
                                            opacity: isApproving ? 0.6 : 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            transition: 'opacity 0.2s',
                                        }}
                                    >
                                        {isApproving ? (
                                            <>
                                                <Loader2 style={{ width: '0.875rem', height: '0.875rem', animation: 'spin 1s linear infinite' }} />
                                                Approving...
                                            </>
                                        ) : (
                                            'Approve Token'
                                        )}
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}

                {error && (
                    <div
                        style={{
                            borderRadius: '0.875rem',
                            background: 'color-mix(in srgb, var(--bad) 10%, transparent)',
                            border: '1px solid color-mix(in srgb, var(--bad) 20%, transparent)',
                            padding: '0.75rem',
                        }}
                    >
                        <p style={{ fontSize: '0.75rem', color: 'var(--bad)' }}>{error}</p>
                    </div>
                )}

                <button
                    onClick={handleSet}
                    style={{
                        width: '100%',
                        borderRadius: '0.875rem',
                        background: 'var(--btn-white-bg)',
                        border: 'none',
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'var(--btn-white-fg)',
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
