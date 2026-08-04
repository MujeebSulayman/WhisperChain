'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useScrollTilt, BG_LIGHT, BORDER_LIGHT, TEXT_MUTED_DARK } from './motion';
import { TrustBadgeIllustration } from './illustrations';

const BADGES = [
	{ label: 'Forwarder-verified transactions' },
	{ label: 'Non-custodial — your keys, your wallet' },
	{ label: 'Open, on-chain protocol' },
	{ label: 'Decentralized message & media storage' },
];

export function TrustBar() {
	const prefersReducedMotion = !!useReducedMotion();
	const scrub = useScrollTilt({ axis: 'x', angle: 5, depth: 30, rise: 14, reduced: prefersReducedMotion });

	return (
		<section style={{ background: BG_LIGHT, borderBottom: `1px solid ${BORDER_LIGHT}` }}>
			<motion.div
				ref={scrub.ref}
				style={{
					...scrub.style,
					maxWidth: '72rem',
					margin: '0 auto',
					padding: '1.75rem 1.5rem',
					display: 'flex',
					flexWrap: 'wrap',
					alignItems: 'center',
					justifyContent: 'center',
					gap: '0.75rem 1.5rem',
					perspective: 900,
					transformStyle: 'preserve-3d',
				}}
			>
				{BADGES.map((badge) => (
					<div
						key={badge.label}
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '0.5rem',
							fontSize: '0.8125rem',
							color: TEXT_MUTED_DARK,
							fontWeight: 500,
						}}
					>
						<TrustBadgeIllustration size={18} invert />
						{badge.label}
					</div>
				))}
			</motion.div>
		</section>
	);
}
