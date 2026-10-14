"use client";

import { useState } from "react";
import { WHISPERCHAIN_ADDRESS } from "@/lib/deployments";
import { explorerAddress } from "@/lib/links";

const short = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`;

/** A deployed contract's address: click to copy, with a BaseScan link. */
export function ContractAddress({ label = "WhisperChain", address = WHISPERCHAIN_ADDRESS }: { label?: string; address?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] uppercase tracking-[0.18em] text-mute">{label}</span>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(address).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          });
        }}
        title="Copy contract address"
        className="pill font-mono text-[12px] text-fg/80 transition-colors hover:text-fg"
      >
        <span className="hidden sm:inline">{address}</span>
        <span className="sm:hidden">{short(address)}</span>
        <span className="text-accent">{copied ? "Copied" : "Copy"}</span>
      </button>
      <a href={explorerAddress(address)} target="_blank" rel="noreferrer" className="text-xs text-mute transition-colors hover:text-fg">
        BaseScan ↗
      </a>
    </div>
  );
}
