'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Wallet } from 'lucide-react';
import { fadeUp, staggerContainer, EASE_OUT, ACCENT_SOLID_DARK, BG_LIGHT, TEXT_MUTED_DARK, BORDER_LIGHT } from './motion';
import { EncryptedEnvelopeIllustration, GroupChatIllustration, BatchSendIllustration } from './illustrations';

const PILLS = [
	{ Illustration: EncryptedEnvelopeIllustration, label: 'End-to-end encrypted' },
	{ Illustration: GroupChatIllustration, label: 'Groups & payments' },
	{ Illustration: BatchSendIllustration, label: 'Gasless sending' },
];

export function Hero() {
	const prefersReducedMotion = useReducedMotion();

	return (
		<section
			style={{
				position: 'relative',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				padding: '7rem 1.5rem 5rem',
				perspective: 1200,
				overflow: 'hidden',
				background: BG_LIGHT,
			}}
		>
			<motion.div
				style={{ textAlign: 'center', maxWidth: '48rem', position: 'relative', transformStyle: 'preserve-3d' }}
				variants={staggerContainer(0.12)}
				initial="hidden"
				animate="show"
			>
				<motion.h1
					variants={prefersReducedMotion ? fadeUp : { hidden: { opacity: 0, rotateX: 20, z: -120, y: 24 }, show: { opacity: 1, rotateX: 0, z: 0, y: 0, transition: { duration: 0.8, ease: EASE_OUT } } }}
					style={{
						fontSize: 'clamp(2.5rem, 6vw, 4.25rem)',
						fontWeight: 800,
						letterSpacing: '-0.03em',
						lineHeight: 1.04,
						margin: '0 auto',
						transformStyle: 'preserve-3d',
					}}
				>
					Private messaging, built on the blockchain
				</motion.h1>

				<motion.p
					variants={fadeUp}
					style={{
						fontSize: 'clamp(1rem, 2vw, 1.1875rem)',
						color: TEXT_MUTED_DARK,
						maxWidth: '38rem',
						margin: '1.5rem auto 0',
						lineHeight: 1.65,
					}}
				>
					Send encrypted messages and media, create group chats, and attach payments
					without giving up control of your data. Your wallet is your identity.
				</motion.p>

				<motion.div
					variants={fadeUp}
					style={{
						display: 'flex',
						flexWrap: 'wrap',
						alignItems: 'center',
						justifyContent: 'center',
						gap: '0.875rem',
						marginTop: '2.5rem',
					}}
				>
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
					<motion.a
						whileHover={{ scale: 1.04 }}
						whileTap={{ scale: 0.97 }}
						transition={{ duration: 0.2, ease: EASE_OUT }}
						href="#features"
						style={{
							padding: '0.875rem 1.75rem',
							borderRadius: '9999px',
							background: 'transparent',
							border: `1px solid ${BORDER_LIGHT}`,
							color: '#0a0a0f',
							fontWeight: 600,
							fontSize: '0.9375rem',
						}}
					>
						See how it works
					</motion.a>
				</motion.div>

				<motion.div
					variants={fadeUp}
					style={{
						display: 'flex',
						flexWrap: 'wrap',
						alignItems: 'center',
						justifyContent: 'center',
						gap: '0.75rem',
						marginTop: '3rem',
					}}
				>
					{PILLS.map((pill) => {
						const { Illustration } = pill;
						return (
							<div
								key={pill.label}
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: '0.4375rem',
									padding: '0.375rem 0.875rem 0.375rem 0.5rem',
									borderRadius: '9999px',
									border: `1px solid ${BORDER_LIGHT}`,
									fontSize: '0.8125rem',
									fontWeight: 500,
									color: TEXT_MUTED_DARK,
								}}
							>
								<Illustration size={20} invert />
								{pill.label}
							</div>
						);
					})}
				</motion.div>
			</motion.div>
		</section>
	);
}
