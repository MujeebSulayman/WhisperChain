"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { APP_URL, TELEGRAM_URL, X_URL } from "@/lib/links";
import { Icon, Logo } from "./Icons";
import { TelegramIcon, XIcon } from "./Socials";
import { useTheme } from "./ThemeProvider";

const LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#how", label: "How it works" },
  { href: "/#contracts", label: "Contracts" },
  { href: "/#faq", label: "FAQ" },
  { href: "/docs", label: "Docs" },
  { href: APP_URL, label: "Chat" },
];

function ThemeButton() {
  const { theme, toggle } = useTheme();
  const light = theme === "light";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
      className="grid h-9 w-9 place-items-center rounded-full text-mute transition-colors hover:text-fg"
    >
      <Icon name={light ? "moon" : "sun"} size={17} />
    </button>
  );
}

function SocialLinks() {
  return (
    <>
      <a href={X_URL} target="_blank" rel="noreferrer" aria-label="WhisperChain on X" className="grid h-9 w-9 place-items-center rounded-full text-mute transition-colors hover:text-fg">
        <XIcon className="h-[14px] w-[14px]" />
      </a>
      <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" aria-label="WhisperChain on Telegram" className="grid h-9 w-9 place-items-center rounded-full text-mute transition-colors hover:text-fg">
        <TelegramIcon className="h-[16px] w-[16px]" />
      </a>
    </>
  );
}

/** A full-width sticky bar: mark, text links, then theme, socials and the app button. Phones get a drop-down menu. */
export function Header() {
  const path = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const inApp = path.startsWith(APP_URL);

  useEffect(() => setOpen(false), [path]);

  return (
    <header className="sitebar">
      <div className="mx-auto flex h-full w-full max-w-[1200px] items-center gap-8 px-4 sm:px-6">
        <Link href="/" aria-label="WhisperChain home" className="shrink-0">
          <Logo size={32} wordmark={false} />
        </Link>

        <nav className="sitebar-links hidden items-center gap-7 lg:flex" aria-label="Main">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={(l.href === APP_URL && inApp) || (l.href === "/docs" && path.startsWith("/docs")) ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <ThemeButton />
          <div className="hidden items-center sm:flex">
            <SocialLinks />
          </div>
          {!inApp && (
            <Link href={APP_URL} className="btn btn-sm btn-accent ml-2 hidden sm:inline-flex">
              Open app
              <Icon name="arrowRight" size={15} stroke={2.2} />
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="grid h-9 w-9 place-items-center rounded-full text-fg lg:hidden"
          >
            <Icon name={open ? "x" : "menu"} size={20} />
          </button>
        </div>
      </div>

      {open && (
        <div className="sheet rise absolute inset-x-3 top-[calc(var(--bar-h)+8px)] p-3 lg:hidden">
          <nav className="grid" aria-label="Mobile">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="row justify-between !text-[16px] font-medium">
                {l.label}
                <Icon name="arrowRight" size={16} className="text-mute" />
              </Link>
            ))}
          </nav>
          <div className="mt-2 flex items-center justify-between border-t border-line px-2 pt-3">
            <div className="flex items-center">
              <SocialLinks />
            </div>
            <Link href={APP_URL} onClick={() => setOpen(false)} className="btn btn-sm btn-accent">
              Open app
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
