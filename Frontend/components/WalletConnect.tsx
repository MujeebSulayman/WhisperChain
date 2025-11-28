'use client';

import { Wallet, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { connectWhisperChain, BASE_CHAIN } from '@WhisperChain/lib/blockchain';

type WalletConnectProps = {
	onConnect: (address: string) => void;
	connectedAddress?: string;
};

export function WalletConnect({ onConnect, connectedAddress }: WalletConnectProps) {
	const [isConnecting, setIsConnecting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleConnect = async () => {
		setIsConnecting(true);
		setError(null);

		try {
			const { signer } = await connectWhisperChain();
			const address = await signer.getAddress();
			onConnect(address);
		} catch (err: any) {
			setError(err.message || 'Failed to connect wallet');
		} finally {
			setIsConnecting(false);
		}
	};

	if (connectedAddress) {
		return (
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
