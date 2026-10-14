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
          <stop offset="0%" stopColor="#F2F5E6" />
          <stop offset="15%" stopColor="#C4C8B8" />
          <stop offset="33%" stopColor="#3E4238" />
          <stop offset="50%" stopColor="#0B0C0E" />
          <stop offset="64%" stopColor="#4A4E42" />
          <stop offset="79%" stopColor="#D4D8C6" />
          <stop offset="90%" stopColor="#B5CF7A" />
          <stop offset="100%" stopColor="#E3F2B0" />
        </linearGradient>
        <linearGradient id="lgCrystal" x1="0.15" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#F7F8F0" />
          <stop offset="26%" stopColor="#DADDCC" />
          <stop offset="48%" stopColor="#8A8F80" />
          <stop offset="62%" stopColor="#2E3129" />
          <stop offset="82%" stopColor="#B9D27E" />
          <stop offset="100%" stopColor="#EEF6D2" />
        </linearGradient>
        <linearGradient id="lgRim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EEF9CF" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#4DA3FF" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#E3F2B0" stopOpacity="0.4" />
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
          <stop offset="0%" stopColor="#4DA3FF" stopOpacity="0.18" />
          <stop offset="55%" stopColor="#9BC832" stopOpacity="0.05" />
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

