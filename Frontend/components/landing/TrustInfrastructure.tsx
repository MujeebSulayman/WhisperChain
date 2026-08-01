'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp, staggerContainer, viewportOnce, tiltIn, BG_LIGHT, BORDER_LIGHT, TEXT_PRIMARY_DARK, TEXT_MUTED_DARK } from './motion';
import { Tilt3DCard } from './Tilt3DCard';
import {
	KeyIllustration,
	ForwarderIllustration,
	OnChainLimitIllustration,
	NoServerIllustration,
	OpenContractIllustration,
	WalletIdentityIllustration,
} from './illustrations';

const POINTS = [
	{
		Illustration: KeyIllustration,
		title: 'Non-custodial keys',
		description: 'Your private key never leaves your wallet. WhisperChain never holds, sees, or can recover it.',
	},
	{
		Illustration: ForwarderIllustration,
		title: 'Forwarder-verified signatures',
		description: 'Gasless actions are checked against your signature before they execute — the chain sees them as coming from you.',
	},
	{
		Illustration: OnChainLimitIllustration,
		title: 'On-chain enforced limits',
		description: 'Storage quotas and message limits are enforced by the contract itself, not a policy someone can quietly change.',
	},
	{
		Illustration: NoServerIllustration,
		title: 'No central server',
		description: 'There is no single database to breach and no company that can go offline and take your history with it.',
	},
	{
		Illustration: OpenContractIllustration,
		title: 'Transparent contracts',
		description: 'The logic that moves your messages and payments is on-chain and inspectable, not a black box.',
	},
	{
		Illustration: WalletIdentityIllustration,
		title: 'Your wallet, your identity',
		description: 'No email, no password, no separate account to lose. Your identity is the key you already control.',
	},
];

export function TrustInfrastructure() {
	const prefersReducedMotion = useReducedMotion();

	return (
		<section style={{ background: BG_LIGHT, color: TEXT_PRIMARY_DARK, borderTop: `1px solid ${BORDER_LIGHT}`, borderBottom: `1px solid ${BORDER_LIGHT}` }}>
			<div style={{ maxWidth: '72rem', margin: '0 auto', padding: '6rem 1.5rem' }}>
				<motion.div
					variants={fadeUp}
					initial="hidden"
					whileInView="show"
					viewport={viewportOnce}
					style={{ textAlign: 'center', maxWidth: '36rem', margin: '0 auto 3rem' }}
				>
					<h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
						Built so no one has to trust a company
					</h2>
					<p style={{ fontSize: '1rem', color: TEXT_MUTED_DARK, marginTop: '0.875rem', lineHeight: 1.6 }}>
						Security and privacy come from the protocol itself, not a policy that can change.
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
					{POINTS.map((point, i) => {
						const { Illustration } = point;
						return (
							<Tilt3DCard
								key={point.title}
								variants={tiltIn(i % 2 === 0 ? 'y' : 'x', i % 2 === 0 ? -20 : 20, !!prefersReducedMotion)}
								style={{
									padding: '1.75rem',
									borderRadius: '1rem',
									border: `1px solid ${BORDER_LIGHT}`,
									background: '#fafafa',
								}}
							>
								<div
									style={{
										width: '4rem',
										height: '4rem',
										borderRadius: '0.875rem',
										background: 'rgba(10, 10, 15, 0.05)',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										marginBottom: '1.25rem',
									}}
								>
									<Illustration size={44} invert />
								</div>
								<h3 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '0.5rem' }}>{point.title}</h3>
								<p style={{ fontSize: '0.9375rem', color: TEXT_MUTED_DARK, lineHeight: 1.6 }}>{point.description}</p>
							</Tilt3DCard>
						);
					})}
				</motion.div>
			</div>
		</section>
	);
}
