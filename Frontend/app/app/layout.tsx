import type { ReactNode } from 'react';
import { WalletProvider } from '@/components/WalletProvider';

// Privy only loads on /app; the landing page and docs don't need a wallet.
export default function AppLayout({ children }: { children: ReactNode }) {
	return <WalletProvider>{children}</WalletProvider>;
}
