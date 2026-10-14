import type { Metadata, Viewport } from 'next';
import { LandingPage } from '../components/landing/LandingPage';

export const metadata: Metadata = {
	title: 'WhisperChain - Gasless Messaging on Base',
	description:
		'Wallet-to-wallet messages, files and payments on Base. Sign once with EIP-712; a relayer submits it and the paymaster covers the gas.',
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	viewportFit: 'cover',
	themeColor: '#05070c',
};

export default function Home() {
	return <LandingPage />;
}
