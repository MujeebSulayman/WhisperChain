'use client';

import { type CSSProperties, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useScrollTilt, type ScrollTiltOptions } from './motion';

type ScrollTiltCardProps = {
	children: ReactNode;
	style?: CSSProperties;
} & ScrollTiltOptions;

/**
 * Card whose 3D tilt/depth is continuously scrubbed by scroll position
 * (rotates in, settles flat mid-viewport, rotates out) rather than firing
 * once on entry.
 */
export function ScrollTiltCard({ children, style, axis, angle, depth, rise }: ScrollTiltCardProps) {
	const prefersReducedMotion = !!useReducedMotion();
	const { ref, style: scrollStyle } = useScrollTilt({ axis, angle, depth, rise, reduced: prefersReducedMotion });

	return (
		<motion.div style={{ perspective: 900, height: '100%' }}>
			<motion.div
				ref={ref}
				style={{
					...style,
					...scrollStyle,
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					transformStyle: 'preserve-3d',
				}}
			>
				{children}
			</motion.div>
		</motion.div>
	);
}
