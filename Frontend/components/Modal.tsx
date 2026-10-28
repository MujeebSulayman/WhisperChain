'use client';

import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type ModalProps = {
	children: ReactNode;
	/** CSS max-width of the dialog. */
	maxWidth?: string;
	onDismiss?: () => void;
};

/**
 * A centered dialog over a dimmed, blurred scrim. Clicking the scrim or pressing Escape calls
 * `onDismiss`. Portaled to <body> so a transformed ancestor (the sidebar sheet) can't trap it.
 */
export function Modal({ children, maxWidth = '28rem', onDismiss }: ModalProps) {
	useEffect(() => {
		if (!onDismiss) return;
		const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onDismiss();
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [onDismiss]);

	if (typeof document === 'undefined') return null;

	return createPortal(
		<div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto p-4">
			<div className="scrim" aria-hidden onClick={onDismiss} />
			<div className="rise relative w-full" style={{ maxWidth }} role="dialog" aria-modal="true">
				{children}
			</div>
		</div>,
		document.body,
	);
}
