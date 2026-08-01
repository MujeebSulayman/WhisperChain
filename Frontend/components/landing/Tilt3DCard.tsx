'use client';

import { useRef, type CSSProperties, type ReactNode } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, type Variants } from 'framer-motion';

type Tilt3DCardProps = {
	children: ReactNode;
	variants: Variants;
	style?: CSSProperties;
	maxTilt?: number;
};

export function Tilt3DCard({ children, variants, style, maxTilt = 10 }: Tilt3DCardProps) {
	const ref = useRef<HTMLDivElement>(null);
	const prefersReducedMotion = useReducedMotion();

	const rotateX = useMotionValue(0);
	const rotateY = useMotionValue(0);
	const springX = useSpring(rotateX, { stiffness: 260, damping: 20, mass: 0.6 });
	const springY = useSpring(rotateY, { stiffness: 260, damping: 20, mass: 0.6 });

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (prefersReducedMotion || !ref.current) return;
		const rect = ref.current.getBoundingClientRect();
		const px = (e.clientX - rect.left) / rect.width - 0.5;
		const py = (e.clientY - rect.top) / rect.height - 0.5;
		rotateY.set(px * maxTilt * 2);
		rotateX.set(py * -maxTilt * 2);
	};

	const handleMouseLeave = () => {
		rotateX.set(0);
		rotateY.set(0);
	};

	return (
		<motion.div variants={variants} style={{ perspective: 900, height: '100%' }}>
			<motion.div
				ref={ref}
				onMouseMove={handleMouseMove}
				onMouseLeave={handleMouseLeave}
				style={{
					...style,
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					rotateX: prefersReducedMotion ? 0 : springX,
					rotateY: prefersReducedMotion ? 0 : springY,
					transformStyle: 'preserve-3d',
				}}
			>
				{children}
			</motion.div>
		</motion.div>
	);
}
