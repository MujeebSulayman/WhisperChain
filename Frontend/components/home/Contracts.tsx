"use client";

import { useState } from "react";
import { FORWARDER_ADDRESS, PAYMASTER_ADDRESS, WHISPERCHAIN_ADDRESS } from "@/lib/deployments";
import { explorerAddress } from "@/lib/links";
import { Icon } from "../site/Icons";
import { Reveal } from "../site/Reveal";

const CONTRACTS = [
  { name: "WhisperChain", role: "Profiles, conversations, messages, media and payments.", address: WHISPERCHAIN_ADDRESS },
  { name: "Forwarder", role: "Checks your wallet's signature, then sends the call as you.", address: FORWARDER_ADDRESS },
  { name: "Paymaster", role: "Covers the gas for relayed messages.", address: PAYMASTER_ADDRESS },
];

const short = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`;

function CopyAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      title="Copy address"
      onClick={() =>
        navigator.clipboard?.writeText(address).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        })
      }
      className="pill font-mono text-[12px] transition-colors hover:text-fg"
    >
      {short(address)}
      <span className="text-accent">{copied ? "Copied" : <Icon name="copy" size={13} />}</span>
    </button>
  );
}

export function Contracts() {
  return (
    <section id="contracts" className="mx-auto w-full max-w-[1200px] scroll-mt-24 px-4 pt-28 sm:px-6 lg:pt-36">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal>
          <span className="kicker">
            <i />
            Under the hood
          </span>
          <h2 className="h2 mt-5">Three contracts run the whole app.</h2>
          <p className="mt-4 max-w-[40ch] text-[16px] leading-relaxed text-dim">
            There is no WhisperChain server holding your messages. The app reads and writes these contracts on Base Sepolia, and you
            can inspect each one yourself.
          </p>
        </Reveal>

        <Reveal variant="right">
          <ul className="card divide-y divide-[var(--line)] !rounded-[24px]">
            {CONTRACTS.map((c) => (
              <li key={c.name} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[15px] font-medium">{c.name}</p>
                  <p className="mt-1 text-[14px] text-dim">{c.role}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <CopyAddress address={c.address} />
                  <a
                    href={explorerAddress(c.address)}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${c.name} on BaseScan`}
                    className="grid h-[30px] w-[30px] place-items-center rounded-full bg-[var(--steel)] text-mute transition-colors hover:text-fg"
                  >
                    <Icon name="arrowUpRight" size={14} />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
