import { useRef } from 'react';
import { useScroll, useTransform, useSpring, type MotionValue, type Transition, type Variants } from 'framer-motion';

export const EASE_OUT: Transition['ease'] = [0.16, 1, 0.3, 1];

export const BG_DARK = '#0a0a0f';
export const SURFACE = '#13131a';
export const BORDER = 'rgba(255, 255, 255, 0.08)';
export const TEXT_PRIMARY = '#f5f5f7';
export const TEXT_MUTED = 'rgba(245, 245, 247, 0.6)';
export const ACCENT_SOLID = '#f5f5f7';

export const BG_LIGHT = '#ffffff';
export const SURFACE_LIGHT = '#f4f4f5';
export const BORDER_LIGHT = 'rgba(10, 10, 15, 0.08)';
export const TEXT_PRIMARY_DARK = '#0a0a0f';
export const TEXT_MUTED_DARK = 'rgba(10, 10, 15, 0.6)';
export const ACCENT_SOLID_DARK = '#0a0a0f';

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

export type ScrollTiltOptions = {
	/** Axis to rotate on as the element scrubs through the viewport. */
	axis?: TiltAxis;
	/** Max rotation in degrees at the extremes of the scroll range. */
	angle?: number;
	/** Max depth (negative translateZ) at the extremes of the scroll range. */
	depth?: number;
	/** Vertical drift in px, applied as a parallax offset. */
	rise?: number;
	reduced?: boolean;
};

/**
 * Ties an element's 3D tilt/depth/parallax continuously to its own scroll
 * progress through the viewport, rather than firing once on entry. Progress
 * runs 0 (entering bottom) -> 0.5 (centered) -> 1 (leaving top), so the
 * element rotates in, settles flat mid-viewport, then rotates out.
 */
export function useScrollTilt({ axis = 'y', angle = 10, depth = 90, rise = 24, reduced = false }: ScrollTiltOptions = {}) {
	const ref = useRef<HTMLDivElement | null>(null);
	const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

	const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.5 });

	const rotate = useTransform(smooth, [0, 0.5, 1], [angle, 0, -angle]);
	const z = useTransform(smooth, [0, 0.5, 1], [-depth, 0, -depth]);
	const y = useTransform(smooth, [0, 0.5, 1], [rise, 0, -rise]);

	if (reduced) {
		return { ref, style: {} as Record<string, number | MotionValue<number>> };
	}

	return {
		ref,
		style: {
			[axis === 'x' ? 'rotateX' : 'rotateY']: rotate,
			z,
			y,
		} as Record<string, number | MotionValue<number>>,
	};
}
