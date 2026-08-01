'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MessageSquare, ArrowRight, Menu, X } from 'lucide-react';
import { ACCENT_SOLID_DARK, TEXT_MUTED_DARK } from './motion';

const NAV_LINKS = [
	{ label: 'Features', href: '#features' },
	{ label: 'Gasless', href: '#gasless' },
	{ label: 'FAQ', href: '#faq' },
];

export function Nav() {
	const [mobileNavOpen, setMobileNavOpen] = useState(false);
	const { scrollY } = useScroll();
	const background = useTransform(scrollY, [0, 120], ['rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0.92)']);
	const borderOpacity = useTransform(scrollY, [0, 120], [0, 0.08]);
	const shadowOpacity = useTransform(scrollY, [0, 120], [0, 0.08]);

	return (
		<motion.header
			style={{
				position: 'sticky',
				top: 0,
				zIndex: 50,
				background,
				backdropFilter: 'blur(10px)',
				borderBottom: useTransform(borderOpacity, (v) => `1px solid rgba(10, 10, 15, ${v})`),
				boxShadow: useTransform(shadowOpacity, (v) => `0 1px 24px rgba(10, 10, 15, ${v})`),
			}}
		>
			<div
				style={{
					maxWidth: '72rem',
					margin: '0 auto',
					padding: '1rem 1.5rem',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
					<div
						style={{
							width: '2rem',
							height: '2rem',
							borderRadius: '0.5rem',
							background: ACCENT_SOLID_DARK,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<MessageSquare style={{ width: '1.125rem', height: '1.125rem', color: '#ffffff' }} />
					</div>
					<span style={{ fontSize: '1.0625rem', fontWeight: 700, letterSpacing: '-0.01em', color: '#0a0a0f' }}>WhisperChain</span>
				</div>

				<nav style={{ display: 'none', alignItems: 'center', gap: '2rem' }} className="landing-desktop-nav">
					{NAV_LINKS.map((link) => (
						<a
							key={link.href}
							href={link.href}
							style={{ fontSize: '0.9375rem', color: TEXT_MUTED_DARK, fontWeight: 500 }}
						>
							{link.label}
						</a>
					))}
				</nav>

				<div style={{ display: 'none', alignItems: 'center', gap: '0.75rem' }} className="landing-desktop-cta">
					<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
						<Link
							href="/app"
							style={{
								padding: '0.625rem 1.25rem',
								borderRadius: '9999px',
								background: ACCENT_SOLID_DARK,
								color: '#ffffff',
								fontWeight: 600,
								fontSize: '0.9375rem',
								display: 'inline-flex',
								alignItems: 'center',
								gap: '0.4rem',
							}}
						>
							Launch App
							<ArrowRight style={{ width: '0.9rem', height: '0.9rem' }} />
						</Link>
					</motion.div>
				</div>

				<button
					onClick={() => setMobileNavOpen((v) => !v)}
					aria-label="Toggle menu"
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						width: '2.25rem',
						height: '2.25rem',
						border: 'none',
						background: 'transparent',
						color: '#0a0a0f',
						cursor: 'pointer',
					}}
					className="landing-mobile-toggle"
				>
					{mobileNavOpen ? <X style={{ width: '1.25rem', height: '1.25rem' }} /> : <Menu style={{ width: '1.25rem', height: '1.25rem' }} />}
				</button>
			</div>

			{mobileNavOpen && (
				<motion.div
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: 'auto' }}
					exit={{ opacity: 0, height: 0 }}
					className="landing-mobile-menu"
					style={{
						borderTop: '1px solid rgba(10, 10, 15, 0.08)',
						padding: '1rem 1.5rem 1.5rem',
						display: 'flex',
						flexDirection: 'column',
						gap: '0.25rem',
						background: '#ffffff',
					}}
				>
					{NAV_LINKS.map((link) => (
						<a
							key={link.href}
							href={link.href}
							onClick={() => setMobileNavOpen(false)}
							style={{ padding: '0.75rem 0', fontSize: '1rem', color: 'rgba(10, 10, 15, 0.75)', fontWeight: 500 }}
						>
							{link.label}
						</a>
					))}
					<Link
						href="/app"
						style={{
							marginTop: '0.75rem',
							padding: '0.75rem 1.25rem',
							borderRadius: '9999px',
							background: ACCENT_SOLID_DARK,
							color: '#ffffff',
							fontWeight: 600,
							fontSize: '0.9375rem',
							textAlign: 'center',
						}}
					>
						Launch App
					</Link>
				</motion.div>
			)}
		</motion.header>
	);
}
