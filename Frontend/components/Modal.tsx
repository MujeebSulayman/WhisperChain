'use client';

import type { ReactNode } from 'react';

type ModalProps = {
	children: ReactNode;
	/** CSS max-width of the dialog. */
	maxWidth?: string;
	onDismiss?: () => void;
};

/** A centered dialog over a dimmed, blurred scrim. Clicking the scrim calls `onDismiss`. */
export function Modal({ children, maxWidth = '28rem', onDismiss }: ModalProps) {
	return (
		<div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4">
			<div className="scrim" aria-hidden onClick={onDismiss} />
			<div className="rise relative w-full" style={{ maxWidth }} role="dialog" aria-modal="true">
				{children}
			</div>
		</div>
	);
}
