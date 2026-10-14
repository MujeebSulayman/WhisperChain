type GlyphProps = { className?: string };

export function XIcon({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function TelegramIcon({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M21.94 4.3a1.2 1.2 0 0 0-1.62-1.3L2.86 9.73c-1.18.46-1.17 1.12-.21 1.41l4.48 1.4 1.73 5.3c.21.58.1.81.71.81.47 0 .68-.21.94-.47l2.25-2.19 4.68 3.46c.86.47 1.48.23 1.7-.8l3.04-14.34ZM8.6 12.24l9.74-6.15c.49-.3.94-.14.57.19l-8.04 7.26-.31 3.33-1.96-4.63Z" />
    </svg>
  );
}

export const SOCIALS = [
  { label: "X", Icon: XIcon },
  { label: "Telegram", Icon: TelegramIcon },
] as const;
