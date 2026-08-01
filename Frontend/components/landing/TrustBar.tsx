'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { staggerContainer, tiltIn, viewportOnce, BG_LIGHT, BORDER_LIGHT, TEXT_MUTED_DARK } from './motion';
import { TrustBadgeIllustration } from './illustrations';

const BADGES = [
	{ label: 'Forwarder-verified transactions' },
	{ label: 'Non-custodial — your keys, your wallet' },
	{ label: 'Open, on-chain protocol' },
	{ label: 'Decentralized message & media storage' },
];

export function TrustBar() {
	const prefersReducedMotion = useReducedMotion();

	return (
		<section style={{ background: BG_LIGHT, borderBottom: `1px solid ${BORDER_LIGHT}` }}>
			<motion.div
				variants={staggerContainer(0.08)}
				initial="hidden"
				whileInView="show"
				viewport={viewportOnce}
				style={{
					maxWidth: '72rem',
					margin: '0 auto',
					padding: '1.75rem 1.5rem',
					display: 'flex',
					flexWrap: 'wrap',
					alignItems: 'center',
					justifyContent: 'center',
					gap: '0.75rem 1.5rem',
					perspective: 900,
				}}
			>
				{BADGES.map((badge) => (
					<motion.div
						key={badge.label}
						variants={tiltIn('x', 16, !!prefersReducedMotion)}
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '0.5rem',
							fontSize: '0.8125rem',
							color: TEXT_MUTED_DARK,
							fontWeight: 500,
							transformStyle: 'preserve-3d',
						}}
					>
						<TrustBadgeIllustration size={18} invert />
						{badge.label}
					</motion.div>
				))}
			</motion.div>
		</section>
	);
}
