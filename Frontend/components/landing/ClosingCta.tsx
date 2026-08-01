'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { Wallet } from 'lucide-react';
import { fadeUp, staggerContainer, viewportOnce, EASE_OUT, ACCENT_SOLID_DARK, BG_LIGHT, TEXT_PRIMARY_DARK, TEXT_MUTED_DARK } from './motion';
import type { Variants } from 'framer-motion';

const arrival = (reduced: boolean): Variants =>
	reduced
		? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.7, ease: EASE_OUT } } }
		: {
				hidden: { opacity: 0, scale: 0.92, z: -200, rotateX: 8 },
				show: { opacity: 1, scale: 1, z: 0, rotateX: 0, transition: { duration: 0.9, ease: EASE_OUT } },
			};

export function ClosingCta() {
	const prefersReducedMotion = useReducedMotion();

	return (
		<div style={{ perspective: 1400, background: BG_LIGHT, color: TEXT_PRIMARY_DARK }}>
			<motion.section
				variants={arrival(!!prefersReducedMotion)}
				initial="hidden"
				whileInView="show"
				viewport={viewportOnce}
				style={{ maxWidth: '72rem', margin: '0 auto', padding: '6rem 1.5rem', textAlign: 'center', transformStyle: 'preserve-3d' }}
			>
				<motion.div variants={staggerContainer(0.12)} initial="hidden" animate="show">
					<motion.h2
						variants={fadeUp}
						style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.02em' }}
					>
						Own your conversations
					</motion.h2>
					<motion.p
						variants={fadeUp}
						style={{ fontSize: '1rem', color: TEXT_MUTED_DARK, maxWidth: '32rem', margin: '0.875rem auto 0', lineHeight: 1.6 }}
					>
						Connect your wallet and start messaging in seconds. No sign-up, no server, no middleman.
					</motion.p>
					<motion.div variants={fadeUp} style={{ marginTop: '2rem', display: 'inline-block' }}>
						<motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2, ease: EASE_OUT }}>
							<Link
								href="/app"
								style={{
									padding: '0.875rem 1.75rem',
									borderRadius: '9999px',
									background: ACCENT_SOLID_DARK,
									color: '#ffffff',
									fontWeight: 600,
									fontSize: '0.9375rem',
									display: 'inline-flex',
									alignItems: 'center',
									gap: '0.5rem',
								}}
							>
								<Wallet style={{ width: '1rem', height: '1rem' }} />
								Launch App
							</Link>
						</motion.div>
					</motion.div>
				</motion.div>
			</motion.section>
		</div>
	);
}
