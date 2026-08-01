import { MessageSquare } from 'lucide-react';
import { ACCENT_SOLID_DARK, BG_LIGHT, BORDER_LIGHT, TEXT_MUTED_DARK } from './motion';

export function Footer() {
	return (
		<footer style={{ background: BG_LIGHT, borderTop: `1px solid ${BORDER_LIGHT}` }}>
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
							background: ACCENT_SOLID_DARK,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<MessageSquare style={{ width: '1rem', height: '1rem', color: '#ffffff' }} />
					</div>
					<span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0a0a0f' }}>WhisperChain</span>
				</div>
				<p style={{ fontSize: '0.8125rem', color: TEXT_MUTED_DARK }}>
					Private messaging on the blockchain. You own the keys.
				</p>
			</div>
		</footer>
	);
}
