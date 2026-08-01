'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp, staggerContainer, viewportOnce, tiltIn, BG_LIGHT, BORDER_LIGHT, TEXT_MUTED_DARK, SURFACE_LIGHT } from './motion';

const FAQS = [
	{
		q: 'Do I need to pay gas to use WhisperChain?',
		a: 'No. You can send transactions yourself and pay gas directly, or use gasless sending — you just sign, and a relayer submits the transaction for you, reimbursed by the paymaster.',
	},
	{
		q: 'Where are my messages and files stored?',
		a: 'Messages and media are encrypted and stored in a decentralized way, so you’re not dependent on a single company or server going down or changing its policies.',
	},
	{
		q: 'Who can read my messages?',
		a: 'Only the intended recipient. Content is encrypted client-side before it’s sent, using keys tied to your wallet.',
	},
	{
		q: 'What is the forwarder contract?',
		a: 'It verifies your signature and then executes the action (like sending a message) on your behalf, so the chain sees the action as coming from you — even though a relayer submitted it.',
	},
];

export function Faq() {
	const prefersReducedMotion = useReducedMotion();

	return (
		<section id="faq" style={{ background: SURFACE_LIGHT, borderTop: `1px solid ${BORDER_LIGHT}`, borderBottom: `1px solid ${BORDER_LIGHT}` }}>
			<div style={{ maxWidth: '48rem', margin: '0 auto', padding: '6rem 1.5rem', perspective: 1000 }}>
				<motion.h2
					variants={fadeUp}
					initial="hidden"
					whileInView="show"
					viewport={viewportOnce}
					style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.02em', textAlign: 'center', marginBottom: '3rem' }}
				>
					Frequently asked questions
				</motion.h2>

				<motion.div
					variants={staggerContainer(0.08)}
					initial="hidden"
					whileInView="show"
					viewport={viewportOnce}
					style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
				>
					{FAQS.map((faq) => (
						<motion.details
							key={faq.q}
							variants={tiltIn('x', 10, !!prefersReducedMotion)}
							style={{
								padding: '1.25rem 1.5rem',
								borderRadius: '0.75rem',
								border: `1px solid ${BORDER_LIGHT}`,
								background: BG_LIGHT,
								transformStyle: 'preserve-3d',
							}}
						>
							<summary style={{ fontWeight: 600, fontSize: '1rem', cursor: 'pointer', listStyle: 'none' }}>
								{faq.q}
							</summary>
							<p style={{ fontSize: '0.9375rem', color: TEXT_MUTED_DARK, lineHeight: 1.65, marginTop: '0.875rem' }}>
								{faq.a}
							</p>
						</motion.details>
					))}
				</motion.div>
			</div>
		</section>
	);
}
