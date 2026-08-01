'use client';

import { useEffect } from 'react';
import { Nav } from './Nav';
import { Hero } from './Hero';
import { TrustBar } from './TrustBar';
import { BridgeSection } from './BridgeSection';
import { FeatureGrid } from './FeatureGrid';
import { DetailHighlights } from './DetailHighlights';
import { GaslessExplainer } from './GaslessExplainer';
import { TrustInfrastructure } from './TrustInfrastructure';
import { Faq } from './Faq';
import { ClosingCta } from './ClosingCta';
import { Footer } from './Footer';
import { BG_LIGHT, TEXT_PRIMARY_DARK } from './motion';

export function LandingPage() {
	useEffect(() => {
		document.documentElement.classList.add('landing-scroll');
		document.body.classList.add('landing-scroll');
		return () => {
			document.documentElement.classList.remove('landing-scroll');
			document.body.classList.remove('landing-scroll');
		};
	}, []);

	return (
		<div style={{ background: BG_LIGHT, color: TEXT_PRIMARY_DARK, minHeight: '100vh', width: '100%' }}>
			<Nav />
			<Hero />
			<TrustInfrastructure />
			<DetailHighlights />
			<GaslessExplainer />
			<TrustBar />
			<Faq />
			<ClosingCta />
			<Footer />

			<style>{`
				@media (min-width: 768px) {
					.landing-desktop-nav { display: flex !important; }
					.landing-desktop-cta { display: flex !important; }
					.landing-mobile-toggle { display: none !important; }
				}
				.landing-mobile-menu a:hover,
				.landing-desktop-nav a:hover {
					color: #0a0a0f;
				}
				details summary::-webkit-details-marker {
					display: none;
				}
				.landing-card-grid-3 {
					grid-template-columns: 1fr;
				}
				@media (min-width: 640px) {
					.landing-card-grid-3 {
						grid-template-columns: repeat(2, 1fr);
					}
				}
				@media (min-width: 960px) {
					.landing-card-grid-3 {
						grid-template-columns: repeat(3, 1fr);
					}
				}
			`}</style>
		</div>
	);
}
