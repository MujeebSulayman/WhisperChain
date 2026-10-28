'use client';

/** A stable hue per address, so the same person always gets the same colour. */
function hueOf(address: string) {
	let h = 0;
	for (let i = 2; i < address.length; i++) h = (h * 31 + address.charCodeAt(i)) % 360;
	return h;
}

/** Round avatar for an address: its first two hex characters on a colour derived from it. */
export function AddressAvatar({ address, className = 'h-10 w-10' }: { address: string; className?: string }) {
	const hue = hueOf(address.toLowerCase());
	return (
		<span
			className={`avatar shrink-0 font-mono ${className}`}
			style={{
				background: `hsl(${hue} 70% 55% / 0.18)`,
				color: `hsl(${hue} 75% 60%)`,
			}}
			aria-hidden
		>
			{address.slice(2, 4).toUpperCase()}
		</span>
	);
}
