import Link from "next/link";
import { GithubSocialIcon, Logo } from "@/components/landing/icons";
import { ScrollLink } from "@/components/landing/ui/ScrollLink";
import { BASE_CHAIN, WHISPERCHAIN_ADDRESS } from "@/lib/deployments";
import { APP_URL, CONTRACTS_SRC_URL, FRONTEND_SRC_URL, GITHUB_URL, explorerAddress } from "@/lib/links";

const PRODUCT_LINKS = [
  { title: "Why WhisperChain", to: "features" },
  { title: "Message path", to: "howit" },
  { title: "Contracts", to: "contracts" },
];

const RESOURCE_LINKS = [
  { title: "Launch app", href: APP_URL },
  { title: "Contract source", href: CONTRACTS_SRC_URL },
  { title: "Frontend source", href: FRONTEND_SRC_URL },
  { title: "BaseScan", href: explorerAddress(WHISPERCHAIN_ADDRESS) },
];

/** Read when the module loads (at build time), so the page stays static. */
const YEAR = new Date().getFullYear();

const linkClass = "text-[15px] text-dim transition-colors hover:text-fg";

export function Footer() {
  return (
    <footer className="footer mx-auto mt-24 w-full max-w-[1240px] px-4 pb-6 md:px-6 lg:mt-32 lg:pb-8">
      <div className="card overflow-hidden px-6 pb-8 pt-10 sm:px-10">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo size={22} />
            <p className="mt-5 max-w-[30ch] text-[20px] font-semibold leading-snug tracking-[-0.03em]">
              Wallet-to-wallet messaging, settled on {BASE_CHAIN.name}.
            </p>
          </div>
          <nav aria-label="Product">
            <p className="label">Product</p>
            <ul className="mt-4 grid gap-2.5">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.to}>
                  <ScrollLink to={link.to} className={linkClass}>
                    {link.title}
                  </ScrollLink>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Resources">
            <p className="label">Resources</p>
            <ul className="mt-4 grid gap-2.5">
              {RESOURCE_LINKS.map((link) => (
                <li key={link.title}>
                  {link.href.startsWith("/") ? (
                    <Link href={link.href} className={linkClass}>
                      {link.title}
                    </Link>
                  ) : (
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                      {link.title} ↗
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="label">Source</p>
            <ul className="mt-4 flex flex-wrap items-center gap-2">
              <li>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="tile h-11 w-11 rounded-full text-fg transition-colors hover:text-accent"
                >
                  <GithubSocialIcon className="h-[18px] w-[18px]" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-line pt-6 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-mute">You sign · the relayer pays · the chain keeps it</p>
          <p className="text-[13px] text-mute">© {YEAR} WhisperChain. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
