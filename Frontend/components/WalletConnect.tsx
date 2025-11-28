'use client';

import { Wallet, Loader2, CheckCircle2, AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { connectWhisperChain, BASE_CHAIN } from '@WhisperChain/lib/blockchain';

type WalletConnectProps = {
	onConnect: () => void | Promise<void>;
	onDisconnect?: () => void;
	connectedAddress?: string;
};

export function WalletConnect({ onConnect, onDisconnect, connectedAddress }: WalletConnectProps) {
	const [isConnecting, setIsConnecting] = useState(false);
	const [isSwitching, setIsSwitching] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleConnect = async () => {
		setIsConnecting(true);
		setError(null);

		try {
			await onConnect();
		} catch (err: any) {
			setError(err.message || 'Failed to connect wallet');
		} finally {
			setIsConnecting(false);
		}
	};

	const handleSwitchAccount = async () => {
		setIsSwitching(true);
		setError(null);

		try {
			const ethereum = (window as typeof window & { ethereum?: any }).ethereum;
			if (!ethereum) {
				throw new Error('No wallet detected');
			}

			// Request account switch via MetaMask
			await ethereum.request({
				method: 'wallet_requestPermissions',
				params: [{ eth_accounts: {} }],
			});

			// Get the new account and reconnect
			const accounts = await ethereum.request({ method: 'eth_accounts' });
			if (accounts.length > 0) {
				await onConnect();
			}
		} catch (err: any) {
			if (err.code !== 4001) {
				// 4001 is user rejection, don't show error for that
				setError(err.message || 'Failed to switch account');
			}
		} finally {
			setIsSwitching(false);
		}
	};

	const handleDisconnect = () => {
		if (onDisconnect) {
			onDisconnect();
		}
	};

	if (connectedAddress) {
		return (
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					gap: '0.75rem',
				}}
			>
				<div
					style={{
						padding: '0.75rem',
						borderRadius: '0.5rem',
						background: 'rgba(255, 255, 255, 0.03)',
						border: '1px solid rgba(255, 255, 255, 0.08)',
					}}
				>
					<div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
						<div
							style={{
								width: '2rem',
								height: '2rem',
								borderRadius: '50%',
								background: '#10b981',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<CheckCircle2 style={{ width: '1rem', height: '1rem', color: '#ffffff' }} />
						</div>
						<div style={{ flex: 1, minWidth: 0 }}>
							<p
								style={{
									fontSize: '0.75rem',
									color: 'rgba(255, 255, 255, 0.5)',
									marginBottom: '0.125rem',
								}}
							>
								Connected
							</p>
							<p
								style={{
									fontSize: '0.875rem',
									fontFamily: 'monospace',
									fontWeight: 500,
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									whiteSpace: 'nowrap',
									color: '#ffffff',
								}}
							>
								{connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
							</p>
						</div>
						<div
							style={{
								padding: '0.25rem 0.5rem',
								borderRadius: '0.25rem',
								background: 'rgba(255, 255, 255, 0.05)',
								border: '1px solid rgba(255, 255, 255, 0.1)',
							}}
						>
							<span
								style={{
									fontSize: '0.625rem',
									fontWeight: 500,
									color: 'rgba(255, 255, 255, 0.7)',
									fontFamily: 'monospace',
								}}
							>
								{BASE_CHAIN.name}
							</span>
						</div>
					</div>
				</div>

				<div style={{ display: 'flex', gap: '0.5rem' }}>
					<button
						onClick={handleSwitchAccount}
						disabled={isSwitching}
						style={{
							flex: 1,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							gap: '0.5rem',
							padding: '0.625rem 0.75rem',
							borderRadius: '0.5rem',
							background: 'transparent',
							border: '1px solid rgba(255, 255, 255, 0.08)',
							color: 'rgba(255, 255, 255, 0.7)',
							fontSize: '0.75rem',
							fontWeight: 500,
							cursor: isSwitching ? 'not-allowed' : 'pointer',
							opacity: isSwitching ? 0.5 : 1,
							transition: 'all 0.2s',
						}}
						onMouseEnter={(e) => {
							if (!isSwitching) {
								e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
								e.currentTarget.style.color = '#ffffff';
							}
						}}
						onMouseLeave={(e) => {
							if (!isSwitching) {
								e.currentTarget.style.background = 'transparent';
								e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
							}
						}}
					>
						{isSwitching ? (
							<Loader2 style={{ width: '0.875rem', height: '0.875rem', animation: 'spin 1s linear infinite' }} />
						) : (
							<RefreshCw style={{ width: '0.875rem', height: '0.875rem' }} />
						)}
						<span>Switch Account</span>
					</button>
					{onDisconnect && (
						<button
							onClick={handleDisconnect}
							style={{
								padding: '0.625rem',
								borderRadius: '0.5rem',
								background: 'transparent',
								border: '1px solid rgba(255, 255, 255, 0.08)',
								color: 'rgba(255, 255, 255, 0.7)',
								cursor: 'pointer',
								transition: 'all 0.2s',
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
								e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
								e.currentTarget.style.color = '#f87171';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.background = 'transparent';
								e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
								e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
							}}
						>
							<LogOut style={{ width: '0.875rem', height: '0.875rem' }} />
						</button>
					)}
				</div>
			</div>
		);
	}

	return (
		<div>
			<button
				onClick={handleConnect}
				disabled={isConnecting}
				style={{
					width: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: '0.5rem',
					padding: '0.75rem 1rem',
					borderRadius: '0.5rem',
					background: '#ffffff',
					border: 'none',
					color: '#0f0f0f',
					fontWeight: 600,
					cursor: isConnecting ? 'not-allowed' : 'pointer',
					opacity: isConnecting ? 0.6 : 1,
					fontSize: '0.875rem',
					transition: 'opacity 0.2s',
				}}
			>
				{isConnecting ? (
					<>
						<Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />
						<span>Connecting...</span>
					</>
				) : (
					<>
						<Wallet style={{ width: '1rem', height: '1rem' }} />
						<span>Connect Wallet</span>
					</>
				)}
			</button>
			{error && (
				<div
					style={{
						marginTop: '0.5rem',
						display: 'flex',
						alignItems: 'center',
						gap: '0.5rem',
						padding: '0.5rem',
						borderRadius: '0.5rem',
						background: 'rgba(239, 68, 68, 0.1)',
						border: '1px solid rgba(239, 68, 68, 0.2)',
					}}
				>
					<AlertCircle style={{ width: '1rem', height: '1rem', color: '#f87171', flexShrink: 0 }} />
					<p style={{ fontSize: '0.75rem', color: '#fca5a5' }}>{error}</p>
				</div>
			)}
		</div>
	);
}
