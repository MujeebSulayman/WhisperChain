import Link from "next/link";
import { Container } from "@/components/landing/ui/Container";
import { FadeUp } from "@/components/landing/ui/FadeUp";
import { Icon } from "@/components/landing/ui/Icon";
import { APP_URL, GITHUB_URL } from "@/lib/links";

export function CallToAction() {
  return (
    <section className="build pt-28 lg:pt-36">
      <Container>
        <FadeUp>
          <div
            className="glass relative grid items-center gap-10 overflow-hidden rounded-[var(--r-panel)] px-6 py-14 sm:px-12 md:grid-cols-[1.25fr_1fr] md:py-16"
            data-lg="surface"
            data-lg-r="32"
            data-lg-tint="card"
          >
            <div>
              <p className="eyebrow">Get started</p>
              <h2 className="display mt-4 text-[clamp(34px,4.6vw,62px)]">
                Say it on-chain. <span className="text-mute">Skip the gas.</span>
              </h2>
              <p className="mt-5 max-w-[44ch] text-[17px] text-dim">
                Connect a wallet, register a username and send your first message. It&apos;s one signature, and you don&apos;t need ETH.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href={APP_URL} className="btn btn-lg btn-white">
                  Launch the app
                  <Icon name="arrowRight" size={18} stroke={2.2} />
                </Link>
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="btn btn-lg btn-ghost">
                  <Icon name="github" size={18} />
                  View source
                </a>
              </div>
            </div>

            <div className="mx-auto w-full max-w-[380px]">
              <div className="card overflow-hidden p-4">
                <div className="flex items-center justify-between px-1">
                  <span className="label">Run it locally</span>
                  <span className="font-mono text-[12px] text-mute">npm</span>
                </div>
                <pre className="inset-panel mt-3 overflow-x-auto rounded-[var(--r-inset)] p-5 font-mono text-[13px] leading-[1.9] text-dim">
                  <code>
                    <span className="text-mute-soft"># deploy the three contracts</span>
                    {"\n"}
                    <span className="text-accent">$</span> npx hardhat ignition deploy
                    {"\n\n"}
                    <span className="text-mute-soft"># start the app and relayer</span>
                    {"\n"}
                    <span className="text-accent">$</span> npm run dev
                    {"\n"}
                    <span className="text-accent">✓</span> forward request signed
                    {"\n"}
                    <span className="text-accent">✓</span> relayed · gas paid by paymaster
                  </code>
                </pre>
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-ghost mt-3 w-full">
                  Repository on GitHub <Icon name="arrowUpRight" size={14} />
                </a>
              </div>
            </div>
          </div>
        </FadeUp>
      </Container>
    </section>
  );
}
