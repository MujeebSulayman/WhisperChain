import type { Transition, Variants } from 'framer-motion';

export const EASE_OUT: Transition['ease'] = [0.16, 1, 0.3, 1];

export const BG_DARK = '#0a0a0f';
export const SURFACE = '#13131a';
export const BORDER = 'rgba(255, 255, 255, 0.08)';
export const TEXT_PRIMARY = '#f5f5f7';
export const TEXT_MUTED = 'rgba(245, 245, 247, 0.6)';
export const ACCENT_SOLID = '#f5f5f7';

export const fadeUp: Variants = {
	hidden: { opacity: 0, y: 28 },
	show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
};

export const fadeIn: Variants = {
	hidden: { opacity: 0 },
	show: { opacity: 1, transition: { duration: 0.8, ease: EASE_OUT } },
};

export const staggerContainer = (staggerChildren = 0.09, delayChildren = 0): Variants => ({
	hidden: {},
	show: {
		transition: {
			staggerChildren,
			delayChildren,
		},
	},
});

export const viewportOnce = { once: true, margin: '-80px 0px -80px 0px' } as const;

type TiltAxis = 'x' | 'y';

/**
 * 3D tilt-in entrance: rotates in from depth (negative Z) on the given axis,
 * settling flat. Pass `reduced: true` to collapse to a plain opacity fade.
 */
export function tiltIn(axis: TiltAxis, angle: number, reduced = false): Variants {
	if (reduced) {
		return fadeUp;
	}
	const transition = { duration: 0.85, ease: EASE_OUT };
	if (axis === 'x') {
		return {
			hidden: { opacity: 0, rotateX: angle, z: -160 },
			show: { opacity: 1, rotateX: 0, z: 0, transition },
		};
	}
	return {
		hidden: { opacity: 0, rotateY: angle, z: -160 },
		show: { opacity: 1, rotateY: 0, z: 0, transition },
	};
}
