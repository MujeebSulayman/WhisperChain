import type { Metadata } from 'next';
import { LandingPage } from '../components/landing/LandingPage';

export const metadata: Metadata = {
	title: 'WhisperChain - Private Messaging on the Blockchain',
	description:
		'Send encrypted messages, files, and payments directly on-chain. You own the keys; the network routes and stores what you send.',
};

export default function Home() {
	return <LandingPage />;
}
