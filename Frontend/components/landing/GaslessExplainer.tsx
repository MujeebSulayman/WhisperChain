'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp, viewportOnce, BG_LIGHT, BORDER_LIGHT, TEXT_PRIMARY_DARK, TEXT_MUTED_DARK } from './motion';
import { ScrollTiltCard } from './ScrollTiltCard';
import { SignatureIllustration, RelayIllustration, PaymasterIllustration } from './illustrations';

const GASLESS_POINTS = [
	{
		Illustration: SignatureIllustration,
		title: 'Gasless sending',
		description: 'You only sign a message in your wallet. No transaction is sent from your account, so no gas is charged to you.',
	},
	{
		Illustration: RelayIllustration,
		title: 'Relayer',
		description: 'A relayer submits your signed request to the chain on your behalf and pays the gas for that submission.',
	},
	{
		Illustration: PaymasterIllustration,
		title: 'Paymaster',
		description: 'A funded contract reimburses relayers for the gas they spend, so the cost never lands on you.',
	},
];

export function GaslessExplainer() {
	return (
		<section id="gasless" style={{ background: BG_LIGHT, color: TEXT_PRIMARY_DARK }}>
			<div style={{ maxWidth: '72rem', margin: '0 auto', padding: '6rem 1.5rem' }}>
				<motion.div
					variants={fadeUp}
					initial="hidden"
					whileInView="show"
					viewport={viewportOnce}
					style={{ textAlign: 'center', maxWidth: '40rem', margin: '0 auto 3rem' }}
				>
					<h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
						Gasless sending, explained
					</h2>
					<p style={{ fontSize: '1rem', color: TEXT_MUTED_DARK, marginTop: '0.875rem', lineHeight: 1.6 }}>
						Send transactions yourself and pay gas, or sign only and let a relayer submit
						for you — reimbursed by the paymaster so the cost never reaches your wallet.
					</p>
				</motion.div>

				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))',
						gap: '1.25rem',
						perspective: 1200,
					}}
				>
					{GASLESS_POINTS.map((point, i) => {
						const { Illustration } = point;
						return (
							<ScrollTiltCard
								key={point.title}
								axis={i % 2 === 0 ? 'y' : 'x'}
								angle={9}
								depth={70}
								rise={18}
								style={{
									padding: '1.75rem',
									borderRadius: '1rem',
									border: `1px solid ${BORDER_LIGHT}`,
								}}
							>
								<div style={{ marginBottom: '1rem' }}>
									<Illustration size={44} invert />
								</div>
								<h3 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '0.5rem' }}>{point.title}</h3>
								<p style={{ fontSize: '0.9375rem', color: TEXT_MUTED_DARK, lineHeight: 1.6 }}>{point.description}</p>
							</ScrollTiltCard>
						);
					})}
				</div>
			</div>
		</section>
	);
}
