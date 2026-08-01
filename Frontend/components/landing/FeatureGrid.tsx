'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp, staggerContainer, viewportOnce, tiltIn, SURFACE } from './motion';
import { Tilt3DCard } from './Tilt3DCard';
import {
	EncryptedEnvelopeIllustration,
	RichMediaIllustration,
	GroupChatIllustration,
	WalletPaymentIllustration,
	BatchSendIllustration,
	StorageVaultIllustration,
} from './illustrations';

const FEATURES = [
	{
		Illustration: EncryptedEnvelopeIllustration,
		title: 'End-to-end encrypted',
		description: 'Messages and media are encrypted before they ever leave your device. No one but the recipient can read them.',
	},
	{
		Illustration: RichMediaIllustration,
		title: 'Rich messaging',
		description: 'Send text, images, video, audio, and documents — stored in a decentralized way instead of on a single server.',
	},
	{
		Illustration: GroupChatIllustration,
		title: 'Group conversations',
		description: 'Create one-to-one chats or group conversations with multiple participants, all secured the same way.',
	},
	{
		Illustration: WalletPaymentIllustration,
		title: 'Payments in messages',
		description: 'Attach ETH or ERC-20 tokens to a message. The recipient receives the payment the moment it’s sent.',
	},
	{
		Illustration: BatchSendIllustration,
		title: 'Batch sending',
		description: 'Send up to 10 messages in a single transaction to save on gas when you’re messaging often.',
	},
	{
		Illustration: StorageVaultIllustration,
		title: 'Storage you control',
		description: 'Each account gets a media storage quota, enforced on-chain — predictable limits, no surprise fees.',
	},
];

export function FeatureGrid() {
	const prefersReducedMotion = useReducedMotion();

	return (
		<section id="features" style={{ maxWidth: '72rem', margin: '0 auto', padding: '6rem 1.5rem' }}>
			<motion.div
				variants={fadeUp}
				initial="hidden"
				whileInView="show"
				viewport={viewportOnce}
				style={{ textAlign: 'center', maxWidth: '36rem', margin: '0 auto 3rem' }}
			>
				<h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
					Everything you need, nothing you don&apos;t
				</h2>
				<p style={{ fontSize: '1rem', color: 'rgba(245, 245, 247, 0.6)', marginTop: '0.875rem', lineHeight: 1.6 }}>
					WhisperChain covers messaging, media, groups, and payments in one contract-backed system.
				</p>
			</motion.div>

			<motion.div
				variants={staggerContainer(0.08)}
				initial="hidden"
				whileInView="show"
				viewport={viewportOnce}
				className="landing-card-grid-3"
				style={{
					display: 'grid',
					gap: '1.25rem',
					perspective: 1200,
				}}
			>
				{FEATURES.map((feature, i) => {
					const { Illustration } = feature;
					return (
						<Tilt3DCard
							key={feature.title}
							variants={tiltIn(i % 2 === 0 ? 'y' : 'x', i % 2 === 0 ? -20 : 20, !!prefersReducedMotion)}
							style={{
								padding: '1.75rem',
								borderRadius: '1rem',
								border: '1px solid rgba(255, 255, 255, 0.08)',
								background: SURFACE,
							}}
						>
							<div
								style={{
									width: '4rem',
									height: '4rem',
									borderRadius: '0.875rem',
									background: 'rgba(245, 245, 247, 0.06)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									marginBottom: '1.25rem',
								}}
							>
								<Illustration size={44} />
							</div>
							<h3 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '0.5rem' }}>{feature.title}</h3>
							<p style={{ fontSize: '0.9375rem', color: 'rgba(245, 245, 247, 0.6)', lineHeight: 1.6 }}>{feature.description}</p>
						</Tilt3DCard>
					);
				})}
			</motion.div>
		</section>
	);
}
