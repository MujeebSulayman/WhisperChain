'use client';

import { Loader2, Lock } from 'lucide-react';
import type { E2EStatus } from '../hooks/useE2EKeys';

type EncryptionBannerProps = {
	status: E2EStatus;
	error: string | null;
	onUnlock: () => void;
	onAdoptKey: () => void;
};

/** Explains why messages aren't showing yet, when the encryption keys aren't ready. */
export function EncryptionBanner({ status, error, onUnlock, onAdoptKey }: EncryptionBannerProps) {
	if (status === 'ready') return null;

	const content =
		status === 'unlocking' || status === 'locked'
			? {
					text: 'Unlocking your private messages. Approve the signature in your wallet (it’s free).',
					action: null,
				}
			: status === 'mismatch'
				? {
						text: 'This wallet unlocked a different inbox key than the one on record, so new messages to you can’t be opened on this device. Switching to this device’s key fixes that, but messages sent to the old key stay closed here.',
						action: { label: 'Use this device’s key', onClick: onAdoptKey },
					}
				: {
						text: error ?? 'Your private messages are locked.',
						action: { label: 'Unlock messages', onClick: onUnlock },
					};

	return (
		<div className='inset-panel m-3 flex items-start gap-3 rounded-[var(--r-inset)] px-4 py-3 text-[13px] text-dim'>
			{status === 'unlocking' ? (
				<Loader2 size={16} className='mt-0.5 shrink-0 animate-spin' />
			) : (
				<Lock size={16} strokeWidth={1.8} className='mt-0.5 shrink-0' />
			)}
			<p className='min-w-0 flex-1 leading-relaxed'>{content.text}</p>
			{content.action && (
				<button onClick={content.action.onClick} className='btn btn-sm btn-white shrink-0'>
					{content.action.label}
				</button>
			)}
		</div>
	);
}
