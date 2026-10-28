import Link from "next/link";
import { APP_URL, TELEGRAM_URL } from "@/lib/links";
import { Icon } from "../site/Icons";
import { Reveal } from "../site/Reveal";

/** The closing call to action: a solid accent band with dark ink. */
export function CtaBand() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 pt-28 sm:px-6 lg:pt-36">
      <Reveal variant="scale">
        <div className="relative overflow-hidden rounded-[32px] bg-accent px-6 py-14 text-[var(--accent-ink)] sm:px-12 md:py-20">
          <svg aria-hidden viewBox="0 0 200 200" className="pointer-events-none absolute -right-10 -top-10 h-72 w-72 opacity-15" fill="none">
            <path d="M40 30h80a14 14 0 0 1 14 14v50a14 14 0 0 1-14 14H76l-36 26V44a14 14 0 0 1 14-14Z" stroke="currentColor" strokeWidth="10" strokeLinejoin="round" />
            <path d="M96 80h64a14 14 0 0 1 14 14v76l-30-22H96a14 14 0 0 1-14-14V94a14 14 0 0 1 14-14Z" stroke="currentColor" strokeWidth="10" strokeLinejoin="round" />
          </svg>
          <div className="relative grid items-end gap-8 md:grid-cols-[1.4fr_auto]">
            <div>
              <h2 className="display text-[clamp(38px,5.4vw,72px)]">Say hello from your wallet.</h2>
              <p className="mt-4 max-w-[46ch] text-[17px] opacity-75">
                Connect a wallet, sign once and start your first conversation. It takes a minute and costs no gas.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={APP_URL}
                className="btn btn-lg !bg-[var(--accent-ink)] !text-accent !shadow-none"
              >
                Open the app
                <Icon name="arrowRight" size={18} stroke={2.2} />
              </Link>
              <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="btn btn-lg !bg-transparent !text-[var(--accent-ink)] !shadow-[inset_0_0_0_1.5px_currentColor]">
                Join Telegram
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
