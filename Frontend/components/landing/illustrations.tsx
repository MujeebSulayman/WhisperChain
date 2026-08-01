const LINE = 'rgba(245, 245, 247, 0.85)';
const LINE_SOFT = 'rgba(245, 245, 247, 0.35)';
const PANEL = 'rgba(245, 245, 247, 0.08)';
const PANEL_SOFT = 'rgba(245, 245, 247, 0.14)';
const PAPER = '#f5f5f7';
const ACCENT = '#e5e5e7';
const DARK = '#0a0a0f';

type IllustrationProps = { size?: number };

export function EncryptedEnvelopeIllustration({ size = 56 }: IllustrationProps) {
	return (
		<svg width={size} height={size} viewBox="0 0 56 56" fill="none">
			<rect x="6" y="14" width="44" height="30" rx="4" fill={PANEL} stroke={LINE} strokeWidth="2" />
			<path d="M8 16L28 32L48 16" stroke={LINE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
			<circle cx="40" cy="10" r="9" fill={ACCENT} />
			<rect x="36.5" y="7" width="7" height="6" rx="1.5" fill={DARK} />
			<path d="M38 7V5.5a2 2 0 0 1 4 0V7" stroke={DARK} strokeWidth="1.4" />
		</svg>
	);
}

export function GroupChatIllustration({ size = 56 }: IllustrationProps) {
	return (
		<svg width={size} height={size} viewBox="0 0 56 56" fill="none">
			<rect x="6" y="10" width="30" height="20" rx="5" fill={PANEL} />
			<rect x="18" y="26" width="30" height="20" rx="5" fill={ACCENT} />
			<circle cx="14" cy="18" r="2.4" fill={LINE} />
			<circle cx="22" cy="18" r="2.4" fill={LINE} />
			<circle cx="30" cy="18" r="2.4" fill={LINE} />
			<circle cx="26" cy="34" r="2.4" fill={DARK} />
			<circle cx="34" cy="34" r="2.4" fill={DARK} />
			<circle cx="42" cy="34" r="2.4" fill={DARK} />
		</svg>
	);
}

export function WalletPaymentIllustration({ size = 56 }: IllustrationProps) {
	return (
		<svg width={size} height={size} viewBox="0 0 56 56" fill="none">
			<rect x="6" y="14" width="38" height="26" rx="5" fill={PANEL} stroke={LINE} strokeWidth="2" />
			<path d="M6 22H44" stroke={LINE} strokeWidth="2" />
			<rect x="34" y="28" width="14" height="10" rx="3" fill={ACCENT} />
			<circle cx="41" cy="33" r="1.6" fill={DARK} />
		</svg>
	);
}

export function BatchSendIllustration({ size = 56 }: IllustrationProps) {
	return (
		<svg width={size} height={size} viewBox="0 0 56 56" fill="none">
			<rect x="6" y="10" width="26" height="16" rx="4" fill={PANEL} />
			<rect x="12" y="20" width="26" height="16" rx="4" fill={PANEL_SOFT} />
			<rect x="18" y="30" width="26" height="16" rx="4" fill={ACCENT} />
			<path d="M25 38L31 38" stroke={DARK} strokeWidth="2" strokeLinecap="round" />
			<path d="M40 34L46 38L40 42" stroke={LINE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

export function StorageVaultIllustration({ size = 56 }: IllustrationProps) {
	return (
		<svg width={size} height={size} viewBox="0 0 56 56" fill="none">
			<ellipse cx="28" cy="14" rx="18" ry="6" fill={PANEL_SOFT} />
			<path d="M10 14V38C10 41.3 18 44 28 44C38 44 46 41.3 46 38V14" stroke={LINE} strokeWidth="2" fill={PANEL} />
			<ellipse cx="28" cy="14" rx="18" ry="6" stroke={LINE} strokeWidth="2" fill="none" />
			<path d="M10 26C10 29.3 18 32 28 32C38 32 46 29.3 46 26" stroke={LINE} strokeWidth="2" />
		</svg>
	);
}

export function RichMediaIllustration({ size = 56 }: IllustrationProps) {
	return (
		<svg width={size} height={size} viewBox="0 0 56 56" fill="none">
			<rect x="7" y="10" width="42" height="30" rx="4" fill={PANEL} stroke={LINE} strokeWidth="2" />
			<circle cx="17" cy="20" r="3.5" fill={ACCENT} />
			<path d="M7 34L20 24L28 31L37 22L49 33" stroke={LINE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

export function SignatureIllustration({ size = 48 }: IllustrationProps) {
	return (
		<svg width={size} height={size} viewBox="0 0 48 48" fill="none">
			<rect x="8" y="10" width="32" height="24" rx="4" fill={PANEL} stroke={LINE} strokeWidth="2" />
			<path d="M13 27C16 21 18 30 21 25C24 20 26 29 30 24C33 20.5 34.5 25 35 23" stroke={PAPER} strokeWidth="2" strokeLinecap="round" fill="none" />
			<path d="M13 18H27" stroke={LINE_SOFT} strokeWidth="2" strokeLinecap="round" />
		</svg>
	);
}

export function RelayIllustration({ size = 48 }: IllustrationProps) {
	return (
		<svg width={size} height={size} viewBox="0 0 48 48" fill="none">
			<circle cx="10" cy="24" r="6" fill={PANEL_SOFT} />
			<rect x="19" y="18" width="10" height="12" rx="3" fill={ACCENT} />
			<circle cx="38" cy="24" r="6" fill={PANEL_SOFT} />
			<path d="M16 24H19" stroke={LINE} strokeWidth="2" />
			<path d="M29 24H32" stroke={LINE} strokeWidth="2" />
			<path d="M32 24L35 21M32 24L35 27" stroke={LINE} strokeWidth="2" strokeLinecap="round" />
		</svg>
	);
}

export function PaymasterIllustration({ size = 48 }: IllustrationProps) {
	return (
		<svg width={size} height={size} viewBox="0 0 48 48" fill="none">
			<rect x="8" y="14" width="32" height="22" rx="4" fill={PANEL} stroke={LINE} strokeWidth="2" />
			<circle cx="24" cy="25" r="6" fill={PANEL_SOFT} stroke={LINE} strokeWidth="1.5" />
			<path d="M8 20H40" stroke={LINE} strokeWidth="1.5" />
		</svg>
	);
}

export function KeyIllustration({ size = 56 }: IllustrationProps) {
	return (
		<svg width={size} height={size} viewBox="0 0 56 56" fill="none">
			<circle cx="18" cy="28" r="10" fill={PANEL} stroke={LINE} strokeWidth="2" />
			<circle cx="18" cy="28" r="3.5" fill={ACCENT} />
			<path d="M27 28H46" stroke={LINE} strokeWidth="2" />
			<path d="M38 28V34" stroke={LINE} strokeWidth="2" />
			<path d="M44 28V32" stroke={LINE} strokeWidth="2" />
		</svg>
	);
}

export function ForwarderIllustration({ size = 56 }: IllustrationProps) {
	return (
		<svg width={size} height={size} viewBox="0 0 56 56" fill="none">
			<rect x="8" y="20" width="16" height="16" rx="3" fill={PANEL_SOFT} />
			<path d="M27 28H36" stroke={LINE} strokeWidth="2" />
			<path d="M33 22L40 28L33 34" stroke={LINE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
			<rect x="38" y="20" width="10" height="16" rx="3" fill={ACCENT} />
			<path d="M41 26L43 28.5L46 24" stroke={DARK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

export function OnChainLimitIllustration({ size = 56 }: IllustrationProps) {
	return (
		<svg width={size} height={size} viewBox="0 0 56 56" fill="none">
			<rect x="8" y="10" width="14" height="14" rx="3" fill={PANEL_SOFT} />
			<rect x="24" y="10" width="14" height="14" rx="3" fill={PANEL_SOFT} />
			<rect x="16" y="26" width="14" height="14" rx="3" fill={ACCENT} />
			<path d="M15 17H31" stroke={LINE} strokeWidth="2" />
			<path d="M23 24V33" stroke={LINE} strokeWidth="2" />
		</svg>
	);
}

export function NoServerIllustration({ size = 56 }: IllustrationProps) {
	return (
		<svg width={size} height={size} viewBox="0 0 56 56" fill="none">
			<rect x="12" y="10" width="32" height="9" rx="2.5" fill={PANEL_SOFT} />
			<rect x="12" y="23" width="32" height="9" rx="2.5" fill={PANEL_SOFT} />
			<rect x="12" y="36" width="32" height="9" rx="2.5" fill={PANEL_SOFT} />
			<path d="M10 8L46 46" stroke={PAPER} strokeWidth="2.5" strokeLinecap="round" />
		</svg>
	);
}

export function OpenContractIllustration({ size = 56 }: IllustrationProps) {
	return (
		<svg width={size} height={size} viewBox="0 0 56 56" fill="none">
			<rect x="10" y="8" width="36" height="40" rx="4" fill={PANEL} stroke={LINE} strokeWidth="2" />
			<path d="M17 18H39" stroke={LINE} strokeWidth="2" />
			<path d="M17 25H32" stroke={LINE_SOFT} strokeWidth="2" />
			<path d="M17 32H36" stroke={LINE_SOFT} strokeWidth="2" />
			<path d="M17 39H27" stroke={LINE_SOFT} strokeWidth="2" />
		</svg>
	);
}

export function WalletIdentityIllustration({ size = 56 }: IllustrationProps) {
	return (
		<svg width={size} height={size} viewBox="0 0 56 56" fill="none">
			<rect x="8" y="16" width="40" height="26" rx="5" fill={PANEL} stroke={LINE} strokeWidth="2" />
			<circle cx="20" cy="29" r="6" fill={PANEL_SOFT} stroke={LINE} strokeWidth="1.5" />
			<path d="M31 26H41" stroke={LINE} strokeWidth="2" />
			<path d="M31 32H38" stroke={LINE_SOFT} strokeWidth="2" />
		</svg>
	);
}

export function TrustBadgeIllustration({ size = 22 }: IllustrationProps) {
	return (
		<svg width={size} height={size} viewBox="0 0 22 22" fill="none">
			<path d="M11 2L18 5V10C18 14.5 15 17.8 11 20C7 17.8 4 14.5 4 10V5L11 2Z" fill={ACCENT} />
			<path d="M8 10.5L10 12.5L14.5 7.5" stroke={DARK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

export function QuoteMarkIllustration({ size = 32 }: IllustrationProps) {
	return (
		<svg width={size} height={size} viewBox="0 0 32 32" fill="none">
			<path
				d="M6 12C6 8.5 8.5 6 12 6V9C10.3 9 9 10.3 9 12H12V19H5V13C5 12.7 5.3 12.3 6 12Z"
				fill={LINE}
			/>
			<path
				d="M19 12C19 8.5 21.5 6 25 6V9C23.3 9 22 10.3 22 12H25V19H18V13C18 12.7 18.3 12.3 19 12Z"
				fill={LINE}
			/>
		</svg>
	);
}

export function HeroIllustration({ size = 220 }: IllustrationProps) {
	return (
		<svg width={size} height={size} viewBox="0 0 220 220" fill="none">
			<circle cx="110" cy="110" r="96" fill="none" stroke="rgba(245, 245, 247, 0.1)" strokeWidth="1.5" />
			<circle cx="110" cy="110" r="72" fill="none" stroke="rgba(245, 245, 247, 0.14)" strokeWidth="1.5" />
			<rect x="46" y="86" width="52" height="38" rx="7" fill={PANEL} stroke={LINE} strokeWidth="2" />
			<path d="M46 92L72 108L98 92" stroke={LINE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
			<path d="M100 105H122" stroke={LINE_SOFT} strokeWidth="2" strokeDasharray="1 7" strokeLinecap="round" />
			<rect x="124" y="88" width="50" height="34" rx="7" fill={ACCENT} />
			<circle cx="149" cy="105" r="6" fill={DARK} />
			<path d="M146 105.5L148.2 107.7L152.5 102.8" stroke={DARK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}
