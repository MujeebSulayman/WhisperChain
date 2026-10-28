'use client';

import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';

// Privy only loads on /app, and only in the browser: its WalletConnect deps can't be bundled for SSR.
const WalletProvider = dynamic(
	() => import('@/components/WalletProvider').then((m) => m.WalletProvider),
	{ ssr: false },
);

export default function AppLayout({ children }: { children: ReactNode }) {
	return <WalletProvider>{children}</WalletProvider>;
}
