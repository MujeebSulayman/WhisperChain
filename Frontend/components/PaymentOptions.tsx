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
                    <>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.5rem' }}>
                                Token Address (Base Network)
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
                        {tokenAddress.trim() && amount && (
                            <div
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    background:
                                        approvalStatus === 'approved'
                                            ? 'rgba(16, 185, 129, 0.1)'
                                            : approvalStatus === 'needs-approval'
                                                ? 'rgba(245, 158, 11, 0.1)'
                                                : 'rgba(255, 255, 255, 0.03)',
                                    border: `1px solid ${approvalStatus === 'approved'
                                            ? 'rgba(16, 185, 129, 0.2)'
                                            : approvalStatus === 'needs-approval'
                                                ? 'rgba(245, 158, 11, 0.2)'
                                                : 'rgba(255, 255, 255, 0.1)'
                                        }`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '0.75rem',
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    {isCheckingApproval ? (
                                        <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                                            Checking approval...
                                        </div>
                                    ) : approvalStatus === 'approved' ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <CheckCircle2 style={{ width: '1rem', height: '1rem', color: '#10b981' }} />
                                            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 500 }}>
                                                Token approved
                                            </span>
                                        </div>
                                    ) : approvalStatus === 'needs-approval' ? (
                                        <div style={{ fontSize: '0.75rem', color: '#fbbf24' }}>
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
                                            borderRadius: '0.5rem',
                                            background: '#fbbf24',
                                            border: 'none',
                                            color: '#0f0f0f',
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
