import Link from "next/link";
import { BASE_CHAIN } from "@/lib/deployments";
import { APP_URL, CONTRACTS_SRC_URL, FRONTEND_SRC_URL, GITHUB_URL } from "@/lib/links";
import { ContractAddress } from "./ContractAddress";
import { Icon, Logo } from "./Icons";

const COLUMNS: { title: string; links: { href: string; label: string; external?: boolean }[] }[] = [
  {
    title: "Product",
    links: [
      { href: APP_URL, label: "Open the app" },
      { href: "/#features", label: "Features" },
      { href: "/#how", label: "How it works" },
      { href: "/#stack", label: "Contracts" },
      { href: "/#faq", label: "FAQ" },
    ],
  },
  {
    title: "Source",
    links: [
      { href: GITHUB_URL, label: "GitHub", external: true },
      { href: CONTRACTS_SRC_URL, label: "Contract source", external: true },
      { href: FRONTEND_SRC_URL, label: "Frontend source", external: true },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mx-auto mt-24 w-full max-w-[1240px] px-4 pb-tabbar sm:px-6 lg:mt-32 lg:pb-8">
      <div className="card overflow-hidden px-6 pt-10 sm:px-10">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo size={36} />
            <p className="mt-5 max-w-[32ch] text-[20px] font-semibold leading-snug tracking-[-0.03em]">
              Chat wallet to wallet: direct messages, groups, files and payments, on {BASE_CHAIN.name}.
            </p>
            <div className="mt-5 flex items-center gap-4">
              <a href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="GitHub" className="text-mute transition-colors duration-300 hover:text-fg">
                <Icon name="github" size={20} />
              </a>
            </div>
          </div>
          {COLUMNS.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <p className="label">{c.title}</p>
              <ul className="mt-4 grid gap-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    {l.external ? (
                      <a href={l.href} target="_blank" rel="noreferrer" className="text-[14.5px] text-dim transition-colors hover:text-fg">
                        {l.label} ↗
                      </a>
                    ) : (
                      <Link href={l.href} className="text-[14.5px] text-dim transition-colors hover:text-fg">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-line pt-6 md:flex-row md:items-center md:justify-between">
          <ContractAddress />
          <p className="text-[13px] text-mute">© {new Date().getFullYear()} WhisperChain</p>
        </div>

        <p
          aria-hidden
          className="pointer-events-none mt-6 -mb-[0.12em] select-none text-center font-display text-[clamp(44px,11vw,150px)] leading-[0.8] tracking-[0.04em] text-fg/[.05]"
        >
          whisperchain
        </p>
      </div>
    </footer>
  );
}
