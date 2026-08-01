'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Wallet, MessageSquare, ArrowRight } from 'lucide-react';
import { tiltIn, viewportOnce, EASE_OUT, ACCENT_SOLID, SURFACE } from './motion';

export function BridgeSection() {
	const prefersReducedMotion = useReducedMotion();

	return (
		<section style={{ maxWidth: '72rem', margin: '0 auto', padding: '6rem 1.5rem' }}>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))',
					gap: '3rem',
					alignItems: 'center',
					perspective: 1400,
				}}
			>
				<motion.div
					variants={tiltIn('y', -22, !!prefersReducedMotion)}
					initial="hidden"
					whileInView="show"
					viewport={viewportOnce}
					style={{ transformStyle: 'preserve-3d' }}
				>
					<h2
						style={{
							fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
							fontWeight: 800,
							letterSpacing: '-0.02em',
							lineHeight: 1.15,
							marginBottom: '1.25rem',
						}}
					>
						The bridge between your wallet and real conversation
					</h2>
					<p style={{ fontSize: '1rem', color: 'rgba(245, 245, 247, 0.6)', lineHeight: 1.7, marginBottom: '2rem' }}>
						WhisperChain connects the identity you already have on-chain to the people you
						actually want to talk to — messaging, media, and payments in one signed action,
						with no account to create and no server holding your data hostage.
					</p>
					<motion.a
						whileHover={{ scale: 1.03 }}
						whileTap={{ scale: 0.97 }}
						transition={{ duration: 0.2, ease: EASE_OUT }}
						href="#features"
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: '0.5rem',
							padding: '0.75rem 1.5rem',
							borderRadius: '9999px',
							border: '1px solid rgba(255, 255, 255, 0.18)',
							color: '#f5f5f7',
							fontWeight: 600,
							fontSize: '0.9375rem',
						}}
					>
						See how it works
						<ArrowRight style={{ width: '0.9375rem', height: '0.9375rem' }} />
					</motion.a>
				</motion.div>

				<motion.div
					variants={tiltIn('y', 22, !!prefersReducedMotion)}
					initial="hidden"
					whileInView="show"
					viewport={viewportOnce}
					style={{
						transformStyle: 'preserve-3d',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						gap: '1.25rem',
						padding: '3rem 2rem',
						borderRadius: '1.25rem',
						border: '1px solid rgba(255, 255, 255, 0.08)',
						background: SURFACE,
					}}
				>
					<div
						style={{
							width: '4rem',
							height: '4rem',
							borderRadius: '1rem',
							background: ACCENT_SOLID,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<Wallet style={{ width: '1.875rem', height: '1.875rem', color: '#0a0a0f' }} />
					</div>
					<div style={{ display: 'flex', gap: '0.375rem' }}>
						<span style={{ width: '0.5rem', height: '0.125rem', background: 'rgba(245, 245, 247, 0.25)' }} />
						<span style={{ width: '0.5rem', height: '0.125rem', background: 'rgba(245, 245, 247, 0.25)' }} />
						<span style={{ width: '0.5rem', height: '0.125rem', background: 'rgba(245, 245, 247, 0.25)' }} />
					</div>
					<div
						style={{
							width: '4rem',
							height: '4rem',
							borderRadius: '1rem',
							background: 'rgba(245, 245, 247, 0.06)',
							border: '1px solid rgba(255, 255, 255, 0.12)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<MessageSquare style={{ width: '1.875rem', height: '1.875rem', color: '#f5f5f7' }} />
					</div>
				</motion.div>
			</div>
		</section>
	);
}
