import { MessageSquare } from 'lucide-react';
import { ACCENT_SOLID } from './motion';

export function Footer() {
	return (
		<footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
			<div
				style={{
					maxWidth: '72rem',
					margin: '0 auto',
					padding: '2.5rem 1.5rem',
					display: 'flex',
					flexWrap: 'wrap',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: '1rem',
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
					<div
						style={{
							width: '1.75rem',
							height: '1.75rem',
							borderRadius: '0.4rem',
							background: ACCENT_SOLID,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<MessageSquare style={{ width: '1rem', height: '1rem', color: '#0a0a0f' }} />
					</div>
					<span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f5f5f7' }}>WhisperChain</span>
				</div>
				<p style={{ fontSize: '0.8125rem', color: 'rgba(245, 245, 247, 0.5)' }}>
					Private messaging on the blockchain. You own the keys.
				</p>
			</div>
		</footer>
	);
}
