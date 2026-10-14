import Link from "next/link";
import { APP_URL, TELEGRAM_URL, X_URL } from "@/lib/links";
import { Logo } from "./Icons";
import { TelegramIcon, XIcon } from "./Socials";

const LINKS = [
  { href: APP_URL, label: "Open the app" },
  { href: "/#features", label: "Features" },
  { href: "/#how", label: "How it works" },
  { href: "/#contracts", label: "Contracts" },
  { href: "/#faq", label: "FAQ" },
  { href: "/docs", label: "Docs" },
];

export function Footer() {
  return (
    <footer className="mt-28 border-t border-line lg:mt-36">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-[34ch]">
          <Logo size={30} />
          <p className="mt-4 text-[15px] leading-relaxed text-dim">Messages, groups, files and payments, sent from your wallet.</p>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-10 gap-y-3 sm:grid-cols-3">
          {LINKS.map((l) => (
            <Link key={l.label} href={l.href} className="text-[14.5px] text-dim transition-colors hover:text-fg">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a href={X_URL} target="_blank" rel="noreferrer" aria-label="X" className="grid h-10 w-10 place-items-center rounded-full bg-[var(--steel)] text-dim transition-colors hover:text-fg">
            <XIcon className="h-4 w-4" />
          </a>
          <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" aria-label="Telegram" className="grid h-10 w-10 place-items-center rounded-full bg-[var(--steel)] text-dim transition-colors hover:text-fg">
            <TelegramIcon className="h-[18px] w-[18px]" />
          </a>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto w-full max-w-[1200px] px-4 py-5 text-[13px] text-mute sm:px-6">© {new Date().getFullYear()} Scarf</p>
      </div>
    </footer>
  );
}
