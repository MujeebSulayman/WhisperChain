import type { SVGProps } from "react";

// Line icons on a 24px grid, stroked in currentColor.
const PATHS = {
  home: "M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z",
  chat: "M5 5h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-8l-5 3.5V17H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1ZM8.5 10h7M8.5 13h4",
  code: "m8.5 8-4 4 4 4M15.5 8l4 4-4 4M13.5 5.5l-3 13",
  book: "M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5zM5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20a7.5 7.5 0 0 1 15 0",
  plus: "M12 5v14M5 12h14",
  sparkles: "M12 3.5 13.6 8 18 9.5 13.6 11 12 15.5 10.4 11 6 9.5 10.4 8zM18.5 15l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z",
  arrowRight: "M5 12h14M13 6l6 6-6 6",
  arrowUpRight: "M7 17 17 7M8 7h9v9",
  chevronDown: "m6 9 6 6 6-6",
  check: "m5 12.5 4.5 4.5L19 7.5",
  x: "M6 6l12 12M18 6 6 18",
  menu: "M4 8.5h16M4 15.5h16",
  copy: "M9 9h10v10H9zM5 15V5h10",
  send: "M4 12 20 4l-6 16-3-7-7-1z",
  shield: "M12 3 5 6v5.5c0 4.2 2.9 8 7 9.5 4.1-1.5 7-5.3 7-9.5V6z M9 12l2 2 4-4",
  lock: "M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3",
  globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z",
  wallet: "M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3M4 7.5V17a2 2 0 0 0 2 2h14V9H6.5A2.5 2.5 0 0 1 4 7.5ZM16 14h.01",
  receipt: "M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5zM9 8h6M9 12h6M9 16h3",
  sun: "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 3v1.5M12 19.5V21M4.5 12H3M21 12h-1.5M6.2 6.2 5.1 5.1M18.9 18.9l-1.1-1.1M6.2 17.8l-1.1 1.1M18.9 5.1l-1.1 1.1",
  moon: "M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5Z",
  logout: "M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10",
  key: "M12 15.5a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM10.8 12.7l8.2-8.2M16 7.5l2.5 2.5M13.5 10l1.8 1.8",
  bolt: "M13.5 3.5 6 13h5.5l-1 7.5L18 11h-5.5z",
  chain: "M9.5 14.5l5-5M8 11.5l-2 2a3.5 3.5 0 0 0 5 5l2-2M16 12.5l2-2a3.5 3.5 0 0 0-5-5l-2 2",
  coin: "M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17ZM14.5 9.2c-.5-.8-1.4-1.2-2.5-1.2-1.4 0-2.5.8-2.5 2s1.1 1.7 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2c-1.1 0-2-.4-2.5-1.2M12 6.5V8M12 16v1.5",
  file: "M13.5 3.5H7a1.5 1.5 0 0 0-1.5 1.5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8.5zM13.5 3.5v5h5M9 13h6M9 16.5h4",
  layers: "M12 4 20 8.5 12 13 4 8.5zM4 12.5l8 4.5 8-4.5M4 16.5l8 4.5 8-4.5",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  size = 20,
  stroke = 1.8,
  ...rest
}: { name: IconName; size?: number; stroke?: number } & Omit<SVGProps<SVGSVGElement>, "name" | "stroke">) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

export function Spinner({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`spin ${className}`} aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity=".2" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/** The Scarf mark (two chat bubbles linked like a chain), optionally with the wordmark in the display face. */
export function Logo({ size = 32, wordmark = true, className = "" }: { size?: number; wordmark?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center ${className}`} style={{ gap: size * 0.38 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand-mark.svg"
        alt={wordmark ? "" : "Scarf"}
        aria-hidden={wordmark || undefined}
        width={size}
        height={size}
        className="brand-mark shrink-0 object-contain"
      />
      {wordmark ? (
        <span className="font-display leading-none tracking-[0.08em]" style={{ fontSize: size * 0.72 }}>
          scarf
        </span>
      ) : null}
    </span>
  );
}

