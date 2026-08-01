'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { tiltIn, viewportOnce, SURFACE } from './motion';
import { SignatureIllustration, StorageVaultIllustration, BatchSendIllustration } from './illustrations';

const ROWS = [
	{
		Illustration: SignatureIllustration,
		stat: '0 gas',
		title: 'Gasless by default',
		description:
			'Sign a message in your wallet and a relayer submits it for you, reimbursed by the paymaster. No ETH required just to say hello.',
	},
	{
		Illustration: StorageVaultIllustration,
		stat: 'On-chain quotas',
		title: 'Storage you control',
		description:
			'Every account gets a media storage allowance enforced by the contract itself — predictable limits, no hidden throttling, no surprise fees.',
	},
	{
		Illustration: BatchSendIllustration,
		stat: 'Up to 10x',
		title: 'Batch send',
		description:
			'Bundle up to 10 messages into a single transaction, cutting the gas cost of staying in touch when you message often.',
	},
];

export function DetailHighlights() {
	const prefersReducedMotion = useReducedMotion();

	return (
		<section style={{ maxWidth: '72rem', margin: '0 auto', padding: '6rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '5rem' }}>
			{ROWS.map((row, i) => {
				const { Illustration } = row;
				const reversed = i % 2 === 1;
				return (
					<div
						key={row.title}
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))',
							gap: '3rem',
							alignItems: 'center',
							perspective: 1300,
						}}
					>
						<motion.div
							variants={tiltIn(reversed ? 'y' : 'y', reversed ? 24 : -24, !!prefersReducedMotion)}
							initial="hidden"
							whileInView="show"
							viewport={viewportOnce}
							style={{
								order: reversed ? 2 : 1,
								transformStyle: 'preserve-3d',
							}}
						>
							<div
								style={{
									fontSize: '0.8125rem',
									fontWeight: 700,
									color: 'rgba(245, 245, 247, 0.45)',
									textTransform: 'uppercase',
									letterSpacing: '0.06em',
									marginBottom: '0.75rem',
								}}
							>
								{row.stat}
							</div>
							<h3 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.015em', marginBottom: '0.75rem' }}>
								{row.title}
							</h3>
							<p style={{ fontSize: '1rem', color: 'rgba(245, 245, 247, 0.6)', lineHeight: 1.7 }}>{row.description}</p>
						</motion.div>

						<motion.div
							variants={tiltIn('y', reversed ? -24 : 24, !!prefersReducedMotion)}
							initial="hidden"
							whileInView="show"
							viewport={viewportOnce}
							style={{
								order: reversed ? 1 : 2,
								transformStyle: 'preserve-3d',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								padding: '3.5rem',
								borderRadius: '1.25rem',
								border: '1px solid rgba(255, 255, 255, 0.08)',
								background: SURFACE,
							}}
						>
							<div
								style={{
									width: '5.5rem',
									height: '5.5rem',
									borderRadius: '1.25rem',
									background: 'rgba(245, 245, 247, 0.06)',
									border: '1px solid rgba(255, 255, 255, 0.08)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<Illustration size={56} />
							</div>
						</motion.div>
					</div>
				);
			})}
		</section>
	);
}
