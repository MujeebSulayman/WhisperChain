"use client";

import { useEffect, useRef, useState } from "react";

export type DemoMode = "direct" | "gasless";

export const DEMO_MODES: { id: DemoMode; label: string }[] = [
  { id: "direct", label: "Direct transaction" },
  { id: "gasless", label: "Gasless relay" },
];

const MESSAGE = "Invoice attached. Sending the 5 USDC now.";
const LOOP_MS = 9000;
/** Where a replay starts (just before the message is signed). */
const REPLAY_AT = 2300;

const ROUTES: Record<DemoMode, string[]> = {
  direct: ["Wallet", "WhisperChain"],
  gasless: ["Wallet", "Relayer", "Forwarder", "WhisperChain"],
};

const OUTCOME: Record<DemoMode, { signs: string; payload: string; route: string; value: string; width: number; note: string }> = {
  direct: {
    signs: "Wallet sends a transaction",
    payload: "eth_sendTransaction → sendMessage(…)",
    route: "Your wallet broadcasts it and pays the network fee.",
    value: "network fee",
    width: 100,
    note: "needs ETH in your wallet",
  },
  gasless: {
    signs: "Wallet signs typed data",
    payload: "eth_signTypedData_v4 → ForwardRequest{ nonce, data }",
    route: "A relayer submits it; the Paymaster refunds the relayer.",
    value: "0 ETH",
    width: 0,
    note: "refund capped per tx (0.01 ETH by default)",
  },
};

const HEX = "0123456789abcdef";

/** Deterministic hex that changes every tick, so the signature visibly churns. */
function noise(seed: number, length: number) {
  let x = (seed * 2654435761) >>> 0;
  let out = "";
  for (let i = 0; i < length; i++) {
    x = (x ^ (x << 13)) >>> 0;
    x = (x ^ (x >>> 17)) >>> 0;
    x = (x ^ (x << 5)) >>> 0;
    out += HEX[x % HEX.length];
  }
  return out;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const easeOut = (n: number) => 1 - Math.pow(1 - clamp01(n), 3);

/**
 * A 9-second scripted send: type a message, sign it, walk it through the route,
 * then show what gas the sender paid under the chosen mode.
 * Bump `replay` to jump back to the moment the message is signed.
 */
export function RelayDemo({ mode, replay = 0 }: { mode: DemoMode; replay?: number }) {
  const [ms, setMs] = useState(0);
  const start = useRef(0);

  useEffect(() => {
    let raf = 0;
    start.current = performance.now();
    const tick = () => {
      setMs((performance.now() - start.current) % LOOP_MS);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  useEffect(() => {
    if (replay) start.current = performance.now() - REPLAY_AT;
  }, [replay]);

  const s = ms / 1000;
  const out = OUTCOME[mode];
  const route = ROUTES[mode];
  const typed = MESSAGE.slice(0, Math.max(0, Math.floor((s - 0.3) / 0.045)));
  const typing = s > 0.3 && typed.length < MESSAGE.length;
  const signedIn = easeOut((s - 2.4) / 0.5);
  const hop = s < 3 ? -1 : Math.min(route.length - 1, Math.floor((s - 3) / (2 / route.length)));
  const resultIn = easeOut((s - 5.2) / 0.5);
  const meter = easeOut((s - 5.4) / 0.9) * out.width;
  const signature = `0x${noise(Math.floor(ms / 110), 24)}…`;

  return (
    <div className="glass w-full max-w-[420px] rounded-[34px] p-5 sm:p-6" data-lg="surface" data-lg-r="34" data-lg-tint="card" aria-hidden>
      <div className="flex items-center justify-between">
        <span className="label">Message monitor</span>
        <span className="pill !h-7 font-mono text-[11px]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-good shadow-[0_0_10px_var(--good)]" />
          Base
        </span>
      </div>

      {/* 1. The message, typed in the app. */}
      <div className="field mt-4 min-h-[86px]">
        <span>To 0xa11c…19e4</span>
        <p className="px-4 pb-3 pt-[29px] text-[15px] leading-snug">
          {typed}
          {typing ? <span className="blink ml-px inline-block h-4 w-[1.5px] translate-y-[3px] bg-accent" /> : null}
        </p>
      </div>

      {/* 2. What the wallet is asked to do. */}
      <div className="mt-4" style={{ opacity: signedIn, transform: `translateY(${(1 - signedIn) * 10}px)` }}>
        <p className="label">{out.signs}</p>
        <div className="inset-panel mt-2 rounded-[14px] px-3 py-2.5">
          <p className="truncate font-mono text-[12px] text-dim">{out.payload}</p>
          <p className="mt-1 truncate font-mono text-[11px] text-accent">sig {signature}</p>
        </div>
      </div>

      {/* 3. The route to the chain. */}
      <div className="mt-5" style={{ opacity: signedIn }}>
        <div className="relative flex items-center justify-between">
          <span className="absolute inset-x-4 top-1/2 h-px -translate-y-1/2 bg-line2" />
          <span
            className="absolute left-4 top-1/2 h-px -translate-y-1/2 bg-accent shadow-[0_0_8px_var(--accent)] transition-[width] duration-500"
            style={{ width: hop < 0 ? 0 : `calc((100% - 2rem) * ${hop / (route.length - 1)})` }}
          />
          {route.map((node, i) => {
            const on = hop >= i;
            return (
              <span
                key={node}
                className={`relative z-[1] grid h-9 min-w-[64px] place-items-center rounded-full px-2.5 font-mono text-[10.5px] transition-all duration-500 ${
                  on ? "bg-[var(--knob)] text-fg shadow-[var(--edge-sm)]" : "bg-[var(--field-bg)] text-mute"
                }`}
              >
                {node}
              </span>
            );
          })}
        </div>
        <p className="mt-2.5 text-center text-[12.5px] text-mute">{out.route}</p>
      </div>

      {/* 4. What it cost the sender. */}
      <div className="card-2 mt-5 rounded-[20px] p-4" style={{ opacity: resultIn, transform: `translateY(${(1 - resultIn) * 12}px)` }}>
        <div className="flex items-baseline justify-between">
          <span className="label">Gas you pay</span>
          <span className={`font-mono text-[13px] tabular-nums ${mode === "gasless" ? "text-accent" : ""}`}>{out.value}</span>
        </div>
        <p className="mt-2 text-[14px] leading-snug">
          MessageSent emitted · <span className="text-accent">5 USDC</span> settled to the recipient
        </p>
        <span className={`meter mt-3 ${mode === "gasless" ? "is-accent" : ""}`}>
          <i style={{ width: `${meter}%` }} />
        </span>
        <p className="mt-2 text-right font-mono text-[11px] text-mute">{out.note}</p>
      </div>
    </div>
  );
}
