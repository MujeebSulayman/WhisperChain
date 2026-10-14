"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { APP_URL } from "@/lib/links";
import { Icon, type IconName } from "../site/Icons";
import { DEMO_MODES, RelayDemo, type DemoMode } from "./RelayDemo";

const PROMISES: { icon: IconName; text: string }[] = [
  { icon: "bolt", text: "No gas to send" },
  { icon: "key", text: "Signed by your wallet" },
  { icon: "coin", text: "Payments in the message" },
];

/**
 * Split hero: the pitch on the left; on the right a live demo of one message reaching the chain,
 * with a switch to compare a direct transaction and a gasless relay (it cycles until you pick one).
 */
export function Hero() {
  const [loop, setLoop] = useState(0);
  const [picked, setPicked] = useState<DemoMode | null>(null);
  const [replay, setReplay] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setLoop((n) => n + 1), 9000);
    return () => window.clearInterval(t);
  }, []);

  const mode = picked ?? DEMO_MODES[(loop + 1) % DEMO_MODES.length].id;
  const pick = (id: DemoMode) => {
    setPicked(id);
    setReplay((n) => n + 1);
  };

  return (
    <section className="relative mx-auto grid w-full max-w-[1200px] items-center gap-12 px-4 pt-4 sm:px-6 md:pt-10 lg:min-h-[calc(100vh-100px)] lg:grid-cols-[1.1fr_1fr] lg:gap-8 lg:pt-0">
      <div className="min-w-0">
        <span className="rise pill">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-good shadow-[0_0_10px_var(--good)]" />
          Live on Base
        </span>

        <h1 className="display rise mt-7 text-[clamp(44px,6.6vw,92px)]" style={{ animationDelay: "80ms" }}>
          Message any wallet.
          <br />
          Pay <span className="text-gradient">no gas.</span>
        </h1>

        <p className="rise mt-7 max-w-[46ch] text-[clamp(16px,1.5vw,19px)] leading-relaxed text-dim" style={{ animationDelay: "160ms" }}>
          WhisperChain sends messages, files and payments between wallets on Base. You sign once with your wallet, a relayer submits
          it, and the paymaster covers the gas.
        </p>

        <div className="rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
          <Link href={APP_URL} className="btn btn-lg btn-white">
            Open the app
            <Icon name="arrowRight" size={18} stroke={2.2} />
          </Link>
          <Link href="/#stack" className="btn btn-lg btn-ghost">
            <Icon name="code" size={18} />
            See the contracts
          </Link>
        </div>

        <ul className="rise mt-10 grid gap-2.5 text-[14px] text-dim sm:flex sm:flex-wrap sm:gap-x-6" style={{ animationDelay: "320ms" }}>
          {PROMISES.map((p) => (
            <li key={p.text} className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-[10px] bg-accent/12 text-accent">
                <Icon name={p.icon} size={15} />
              </span>
              {p.text}
            </li>
          ))}
        </ul>
      </div>

      <div className="rise flex flex-col items-center" style={{ animationDelay: "200ms" }}>
        <RelayDemo mode={mode} replay={replay} />
        <div className="mt-7 flex w-full flex-col items-center">
          <p className="label mb-3">Send the same message as a</p>
          <div className="seg" role="group" aria-label="Compare sending modes">
            {DEMO_MODES.map((m) => (
              <button key={m.id} type="button" aria-pressed={mode === m.id} onClick={() => pick(m.id)}>
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
