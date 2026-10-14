import Image from "next/image";
import { useId } from "react";

/*
 * WhisperChain's landing artwork: the brand mark, the feature illustrations and the GitHub glyph.
 * Every gradient id is prefixed per instance so the same art can render twice on a page.
 */

type IconProps = { className?: string };

/** A per-instance prefix that is safe inside url(#…). */
function usePrefix() {
  return `w${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
}

/** Gradients shared by the illustrations: a lit rim, a glass fill, the accent and a soft glow. */
function ArtDefs({ p }: { p: string }) {
  return (
    <defs>
      <linearGradient id={`${p}rim`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" style={{ stopColor: "var(--art-hi)" }} stopOpacity="0.9" />
        <stop offset="50%" style={{ stopColor: "var(--accent)" }} stopOpacity="0.6" />
        <stop offset="100%" style={{ stopColor: "var(--accent-2)" }} stopOpacity="0.45" />
      </linearGradient>
      <linearGradient id={`${p}glass`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.13" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.02" />
      </linearGradient>
      <linearGradient id={`${p}accent`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" style={{ stopColor: "var(--art-a1)" }} />
        <stop offset="55%" style={{ stopColor: "var(--accent)" }} />
        <stop offset="100%" style={{ stopColor: "var(--art-a3)" }} />
      </linearGradient>
      <radialGradient id={`${p}glow`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" style={{ stopColor: "var(--accent)" }} stopOpacity="0.32" />
        <stop offset="60%" style={{ stopColor: "var(--accent)" }} stopOpacity="0.06" />
        <stop offset="100%" style={{ stopColor: "var(--accent)" }} stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

/* ── Brand ────────────────────────────────────────────────────── */

/** Two chat bubbles linked like a chain, on a cobalt tile (public/logo.png, also the favicon). */
export function LogoMark({ size = 28, className = "", alt = "" }: { size?: number; className?: string; alt?: string }) {
  return (
    <Image
      src="/logo.png"
      alt={alt}
      width={size}
      height={size}
      className={`shrink-0 rounded-[24%] ${className}`}
      priority
      aria-hidden={alt ? undefined : true}
    />
  );
}

/** The WhisperChain logo: the mark and the wordmark. `size` is the cap height in px. */
export function Logo({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`} role="img" aria-label="WhisperChain">
      <LogoMark size={Math.round(size * 1.3)} />
      <span aria-hidden className="font-display font-medium leading-none tracking-[0.01em]" style={{ fontSize: size * 0.95 }}>
        Whisper<span className="text-accent">Chain</span>
      </span>
    </span>
  );
}

/* ── Feature illustrations ────────────────────────────────────── */

/** A relayer outside, a vault holding your key inside: the relayer delivers, the key never leaves. */
export function RelayArt({ className }: IconProps) {
  const p = usePrefix();
  return (
    <svg viewBox="0 0 320 260" fill="none" className={className} aria-hidden>
      <ArtDefs p={p} />
      <ellipse cx="190" cy="130" rx="140" ry="118" fill={`url(#${p}glow)`} />
      {[112, 84, 56].map((r) => (
        <circle key={r} cx="192" cy="130" r={r} stroke="#fff" strokeOpacity="0.06" />
      ))}

      {/* relayer */}
      <circle cx="58" cy="130" r="26" fill={`url(#${p}glass)`} stroke={`url(#${p}rim)`} strokeWidth="1.5" />
      <path d="M45.5 130.5 70 119.5l-8.5 23.5-5-8.5z" style={{ fill: "var(--art-hi)" }} />

      {/* the signed request, flowing toward the vault */}
      <path
        d="M88 130H128"
        style={{ stroke: "var(--accent)" }}
        strokeOpacity="0.8"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="2 6"
      >
        <animate attributeName="stroke-dashoffset" values="0;-16" dur="1.2s" repeatCount="indefinite" />
      </path>

      {/* vault */}
      <rect x="132" y="70" width="124" height="120" rx="30" fill={`url(#${p}glass)`} stroke={`url(#${p}rim)`} strokeWidth="1.5" />
      <rect x="145" y="83" width="98" height="94" rx="20" stroke="#fff" strokeOpacity="0.08" />
      <circle cx="175" cy="130" r="13" style={{ stroke: "var(--art-hi)" }} strokeWidth="2.6" />
      <circle cx="175" cy="130" r="4" fill={`url(#${p}accent)`} />
      <path d="M188 130h36M213 130v9M223 130v6" style={{ stroke: "var(--art-hi)" }} strokeWidth="2.6" strokeLinecap="round" />

      {/* sealed */}
      <circle cx="252" cy="74" r="17" fill={`url(#${p}accent)`} />
      <path
        d="M244.5 74.5l5 5 9-10"
        style={{ stroke: "var(--accent-ink)" }}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="104" cy="70" r="2" style={{ fill: "var(--art-hi)" }} opacity="0.5" />
      <circle cx="286" cy="196" r="2.5" style={{ fill: "var(--accent-2)" }} opacity="0.6" />
      <circle cx="112" cy="204" r="1.5" style={{ fill: "var(--art-hi)" }} opacity="0.4" />
    </svg>
  );
}

/** An EIP-712 signature prompt with a signature drawing itself, and a pointer on Sign. */
export function SignArt({ className }: IconProps) {
  const p = usePrefix();
  return (
    <svg viewBox="0 0 320 260" fill="none" className={className} aria-hidden>
      <ArtDefs p={p} />
      <ellipse cx="170" cy="130" rx="140" ry="118" fill={`url(#${p}glow)`} />

      <rect
        x="96"
        y="38"
        width="150"
        height="190"
        rx="26"
        fill="#fff"
        fillOpacity="0.03"
        stroke="#fff"
        strokeOpacity="0.09"
        transform="rotate(-9 171 133)"
      />
      <rect x="104" y="40" width="150" height="190" rx="26" fill={`url(#${p}glass)`} stroke={`url(#${p}rim)`} strokeWidth="1.5" />

      {/* header */}
      <circle cx="129" cy="67" r="9" fill={`url(#${p}accent)`} />
      <rect x="146" y="61" width="58" height="7" rx="3.5" fill="#fff" fillOpacity="0.28" />
      <rect x="146" y="72" width="36" height="5" rx="2.5" fill="#fff" fillOpacity="0.12" />

      {/* typed data */}
      <rect x="120" y="92" width="118" height="46" rx="14" fill="#000" fillOpacity="0.22" />
      <rect x="132" y="104" width="38" height="5" rx="2.5" fill="#fff" fillOpacity="0.25" />
      <rect x="132" y="116" width="74" height="9" rx="4.5" style={{ fill: "var(--art-hi)" }} fillOpacity="0.85" />

      {/* signature */}
      <path
        d="M126 170c7-15 13-16 15-6s6 11 12-1 10-11 12-1 8 9 14-1 10-7 17 1"
        stroke={`url(#${p}accent)`}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="150"
      >
        <animate
          attributeName="stroke-dashoffset"
          values="150;0;0;150"
          keyTimes="0;0.45;0.85;1"
          dur="4s"
          repeatCount="indefinite"
        />
      </path>
      <path d="M122 182h112" stroke="#fff" strokeOpacity="0.14" />

      {/* actions */}
      <rect x="120" y="196" width="54" height="24" rx="12" stroke="#fff" strokeOpacity="0.2" />
      <rect x="182" y="196" width="56" height="24" rx="12" fill={`url(#${p}accent)`} />
      <rect x="196" y="206" width="28" height="4" rx="2" style={{ fill: "var(--accent-ink)" }} fillOpacity="0.85" />
      <path
        d="M226 208v19l5-5 4 8.5 3.4-1.6-4-8.4h7z"
        fill="#fff"
        style={{ stroke: "var(--bg)" }}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Three stacked glass plates (Forwarder, WhisperChain, Paymaster) with linked nodes on the top one. */
export function ContractsArt({ className }: IconProps) {
  const p = usePrefix();
  const plate = (y: number, top = false) => (
    <g key={y}>
      <path d={`M60 ${y}v9l100 43 100-43v-9`} fill="#fff" fillOpacity="0.03" stroke="#fff" strokeOpacity="0.08" />
      <path
        d={`M160 ${y - 43}L260 ${y}L160 ${y + 43}L60 ${y}Z`}
        fill={top ? `url(#${p}glass)` : "#fff"}
        fillOpacity={top ? 1 : 0.035}
        stroke={top ? `url(#${p}rim)` : "#fff"}
        strokeOpacity={top ? 1 : 0.14}
        strokeWidth={top ? 1.5 : 1}
        strokeLinejoin="round"
      />
    </g>
  );
  return (
    <svg viewBox="0 0 320 260" fill="none" className={className} aria-hidden>
      <ArtDefs p={p} />
      <ellipse cx="160" cy="130" rx="150" ry="120" fill={`url(#${p}glow)`} />

      {[110, 160, 210].map((x) => (
        <path key={x} d={`M${x} 104V196`} style={{ stroke: "var(--accent)" }} strokeOpacity="0.35" strokeDasharray="2 5" />
      ))}
      {plate(196)}
      {plate(150)}
      <g>
        <animateTransform attributeName="transform" type="translate" values="0 0;0 -6;0 0" dur="4.5s" repeatCount="indefinite" />
        {plate(100, true)}
        <path d="M160 78 196 100 160 122 124 100Z" style={{ stroke: "var(--art-hi)" }} strokeOpacity="0.55" strokeWidth="1.4" />
        {[
          [160, 78],
          [196, 100],
          [160, 122],
          [124, 100],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={i === 0 ? 6 : 4.5} style={{ fill: i === 0 ? `url(#${p}accent)` : "var(--art-hi)" }}>
            {i === 2 ? <animate attributeName="opacity" values="1;0.35;1" dur="2.4s" repeatCount="indefinite" /> : null}
          </circle>
        ))}
      </g>
    </svg>
  );
}

/* ── Glyphs (24px grid, currentColor) ─────────────────────────── */

export function GithubSocialIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M9 19c-4 1.3-4-2-5.5-2.5M15 21v-3.2c0-.9.1-1.3-.4-1.8 2.6-.3 5.2-1.3 5.2-5.7 0-1.2-.4-2.2-1.1-3 .1-.3.5-1.5-.1-3 0 0-1-.3-3.2 1.2a11 11 0 0 0-5.8 0C7.4 3.9 6.4 4.2 6.4 4.2c-.6 1.5-.2 2.7-.1 3-.7.8-1.1 1.8-1.1 3 0 4.4 2.6 5.4 5.2 5.7-.5.5-.5 1-.4 1.8V21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
