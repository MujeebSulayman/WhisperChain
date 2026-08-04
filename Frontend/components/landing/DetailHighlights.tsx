'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp, viewportOnce, useScrollTilt, BG_LIGHT, BORDER_LIGHT, TEXT_PRIMARY_DARK, TEXT_MUTED_DARK } from './motion';

const ROWS = [
	{
		image: 'https://images.unsplash.com/photo-1775342989484-32de64ef79c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
		imageAlt: 'Abstract render of glowing cubes forming a sphere, representing gasless on-chain transactions',
		stat: '0 gas',
		title: 'Gasless by default',
		description:
			'Sign a message in your wallet and a relayer submits it for you, reimbursed by the paymaster. No ETH required just to say hello.',
	},
	{
		image: 'https://images.unsplash.com/photo-1727174432128-9311917465bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
		imageAlt: '3D render of a safe, representing on-chain enforced storage quotas',
		stat: 'On-chain quotas',
		title: 'Storage you control',
		description:
			'Every account gets a media storage allowance enforced by the contract itself — predictable limits, no hidden throttling, no surprise fees.',
	},
	{
		image: 'https://images.unsplash.com/photo-1722170106116-b521b0917e2f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
		imageAlt: 'Abstract render of converging arrows, representing batched message sending',
		stat: 'Up to 10x',
		title: 'Batch send',
		description:
			'Bundle up to 10 messages into a single transaction, cutting the gas cost of staying in touch when you message often.',
	},
];

function Row({ row, reversed }: { row: (typeof ROWS)[number]; reversed: boolean }) {
	const prefersReducedMotion = !!useReducedMotion();

	const text = useScrollTilt({ axis: 'y', angle: 7, depth: 50, rise: 30, reduced: prefersReducedMotion });
	const media = useScrollTilt({ axis: 'y', angle: 7, depth: 60, rise: 44, reduced: prefersReducedMotion });

	return (
		<div
			style={{
				display: 'grid',
				gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))',
				gap: '3rem',
				alignItems: 'center',
				perspective: 1300,
			}}
		>
			<motion.div
				ref={text.ref}
				style={{
					...text.style,
					order: reversed ? 2 : 1,
					transformStyle: 'preserve-3d',
				}}
			>
				<div
					style={{
						fontSize: '0.8125rem',
						fontWeight: 700,
						color: TEXT_MUTED_DARK,
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
				<p style={{ fontSize: '1rem', color: TEXT_MUTED_DARK, lineHeight: 1.7 }}>{row.description}</p>
			</motion.div>

			<motion.div
				ref={media.ref}
				style={{
					...media.style,
					order: reversed ? 1 : 2,
					transformStyle: 'preserve-3d',
					position: 'relative',
					aspectRatio: '4 / 3',
					borderRadius: '1.25rem',
					overflow: 'hidden',
					border: `1px solid ${BORDER_LIGHT}`,
					background: '#fafafa',
				}}
			>
				<Image
					src={row.image}
					alt={row.imageAlt}
					fill
					sizes="(max-width: 768px) 100vw, 32rem"
					style={{ objectFit: 'cover' }}
				/>
			</motion.div>
		</div>
	);
}

export function DetailHighlights() {
	return (
		<section style={{ background: BG_LIGHT, color: TEXT_PRIMARY_DARK, maxWidth: '100%', margin: '0 auto', padding: 0 }}>
			<div style={{ maxWidth: '72rem', margin: '0 auto', padding: '6rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '5rem' }}>
				<motion.div
					variants={fadeUp}
					initial="hidden"
					whileInView="show"
					viewport={viewportOnce}
					style={{ textAlign: 'center', maxWidth: '36rem', margin: '0 auto' }}
				>
					<div
						style={{
							fontSize: '0.8125rem',
							fontWeight: 700,
							color: TEXT_MUTED_DARK,
							textTransform: 'uppercase',
							letterSpacing: '0.06em',
							marginBottom: '0.75rem',
						}}
					>
						Built in, not bolted on
					</div>
					<h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
						What the protocol handles for you
					</h2>
				</motion.div>

				{ROWS.map((row, i) => (
					<Row key={row.title} row={row} reversed={i % 2 === 1} />
				))}
			</div>
		</section>
	);
}
