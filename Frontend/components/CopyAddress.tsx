'use client';

import { useCallback, useState } from 'react';
import { Check, Copy } from 'lucide-react';

export const shortAddress = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`;

/** Copies `text` and flips `copied` on for a moment so the button can confirm it. */
export function useCopy(timeout = 1600) {
	const [copied, setCopied] = useState(false);
	const copy = useCallback(
		async (text: string) => {
			try {
				await navigator.clipboard.writeText(text);
			} catch {
				// Older browsers and some in-app webviews have no async clipboard.
				const el = document.createElement('textarea');
				el.value = text;
				el.style.position = 'fixed';
				el.style.opacity = '0';
				document.body.appendChild(el);
				el.select();
				document.execCommand('copy');
				el.remove();
			}
			setCopied(true);
			setTimeout(() => setCopied(false), timeout);
		},
		[timeout],
	);
	return { copied, copy };
}

type CopyAddressProps = {
	text: string;
	/** What is being copied, for the tooltip and screen readers. */
	label?: string;
	size?: number;
	className?: string;
};

/** A small icon button that copies `text` and shows a check when done. */
export function CopyAddress({ text, label = 'address', size = 14, className = '' }: CopyAddressProps) {
	const { copied, copy } = useCopy();

	return (
		<button
			type="button"
			onClick={(e) => {
				e.stopPropagation();
				copy(text);
			}}
			className={`inline-grid shrink-0 place-items-center rounded-full p-1.5 transition-colors hover:bg-[color-mix(in_srgb,var(--fg)_8%,transparent)] ${copied ? 'text-good' : 'text-mute hover:text-fg'} ${className}`}
			title={copied ? 'Copied' : `Copy ${label}`}
			aria-label={copied ? 'Copied' : `Copy ${label}`}
		>
			{copied ? <Check size={size} strokeWidth={2} /> : <Copy size={size} strokeWidth={1.8} />}
		</button>
	);
}
