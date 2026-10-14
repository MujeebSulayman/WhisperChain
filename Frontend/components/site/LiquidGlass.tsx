import type { ReactNode } from "react";

/** Shared SVG gradients and filters referenced by url(#lg…) across the site. Render once. */
export function LiquidGlassDefs() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        <linearGradient id="lgChrome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EEF2FB" />
          <stop offset="15%" stopColor="#C2C8D6" />
          <stop offset="33%" stopColor="#353B4A" />
          <stop offset="50%" stopColor="#0B0C0E" />
          <stop offset="64%" stopColor="#434A5C" />
          <stop offset="79%" stopColor="#CFD5E3" />
          <stop offset="90%" stopColor="#8FA8F0" />
          <stop offset="100%" stopColor="#C9D6FA" />
        </linearGradient>
        <linearGradient id="lgCrystal" x1="0.15" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#F5F7FC" />
          <stop offset="26%" stopColor="#D6DCE8" />
          <stop offset="48%" stopColor="#7F889C" />
          <stop offset="62%" stopColor="#262B38" />
          <stop offset="82%" stopColor="#8EA9F2" />
          <stop offset="100%" stopColor="#DCE5FD" />
        </linearGradient>
        <linearGradient id="lgRim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E3EAFF" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#5B86FF" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#C9D6FA" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FFF2D5" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="lgWarm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF7E8" />
          <stop offset="20%" stopColor="#E7D3B4" />
          <stop offset="42%" stopColor="#4A423A" />
          <stop offset="58%" stopColor="#0E0C0A" />
          <stop offset="78%" stopColor="#C9B99C" />
          <stop offset="100%" stopColor="#FFF2D5" />
        </linearGradient>
        <radialGradient id="lgSpec" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lgGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#5B86FF" stopOpacity="0.18" />
          <stop offset="55%" stopColor="#3366EE" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <filter id="lgMorph" x="-35%" y="-35%" width="170%" height="170%">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.010" numOctaves={2} seed={7} result="noise">
            <animate
              attributeName="baseFrequency"
              dur="18s"
              values="0.006 0.010;0.011 0.007;0.006 0.010"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={14} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="lgMorphSoft" x="-35%" y="-35%" width="170%" height="170%">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves={2} seed={4} result="noise">
            <animate
              attributeName="baseFrequency"
              dur="14s"
              values="0.008 0.012;0.013 0.009;0.008 0.012"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={7} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="lgSoft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
        <filter id="lgAmbient" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
    </svg>
  );
}

type BlobProps = { cx: number; cy: number; rx?: number; ry?: number; warm?: boolean };

/** A glassy ellipse drawn inside an existing <svg>. */
export function GlassBlob({ cx, cy, rx = 46, ry = 46, warm = false }: BlobProps) {
  const fill = warm ? "url(#lgWarm)" : "url(#lgCrystal)";
  return (
    <g filter="url(#lgMorphSoft)">
      <ellipse cx={cx} cy={cy} rx={rx + 10} ry={ry + 10} fill="url(#lgGlow)" filter="url(#lgAmbient)" />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={fill} />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="url(#lgRim)" strokeWidth="1.6" opacity="0.6" />
      <ellipse
        cx={cx - rx * 0.24}
        cy={cy - ry * 0.42}
        rx={rx * 0.42}
        ry={ry * 0.2}
        fill="url(#lgSpec)"
        opacity="0.85"
        transform={`rotate(-24 ${cx} ${cy})`}
      />
    </g>
  );
}

export function GlassPanel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="glass-panel relative overflow-hidden rounded-[2.25rem] border-white/[0.08]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent" />
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}
