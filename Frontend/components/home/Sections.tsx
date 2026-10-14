import Link from "next/link";
import type { ReactNode } from "react";
import { FORWARDER_ADDRESS, PAYMASTER_ADDRESS, WHISPERCHAIN_ADDRESS } from "@/lib/deployments";
import { APP_URL, TELEGRAM_URL, explorerAddress } from "@/lib/links";
import { TelegramIcon } from "../site/Socials";
import { ContractAddress } from "../site/ContractAddress";
import { Icon } from "../site/Icons";
import { Reveal } from "../site/Reveal";

function Section({ id, className = "", children }: { id?: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={`mx-auto w-full max-w-[1200px] scroll-mt-24 px-4 pt-28 sm:px-6 lg:pt-36 ${className}`}>
      {children}
    </section>
  );
}

/** A section heading: big index number, kicker, statement, optional link on the right. */
function SectionHead({ index, eyebrow, title, link }: { index: string; eyebrow: string; title: ReactNode; link?: { href: string; label: string } }) {
  return (
    <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-end gap-5">
        <span className="hidden font-mono text-[64px] font-medium leading-[0.8] tracking-[-0.08em] text-fg/10 sm:block">{index}</span>
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="h2 mt-3 max-w-[760px]">{title}</h2>
        </div>
      </div>
      {link ? (
        <Link href={link.href} className="btn btn-sm btn-ghost shrink-0">
          {link.label} <Icon name="arrowRight" size={15} />
        </Link>
      ) : null}
    </Reveal>
  );
}

/* ── 01 How it works ──────────────────────────────────────────── */

const REQUEST_FIELDS: [string, string][] = [
  ["from", "0x7d2e…b41c"],
  ["to", "WhisperChain"],
  ["value", "0"],
  ["gas", "214000"],
  ["nonce", "7"],
  ["data", "sendMessage(0xa11c…, …)"],
];

function RelayIllustration() {
  const hops: [number, string, boolean][] = [
    [46, "you", true],
    [124, "relayer", false],
    [202, "paymaster", false],
    [280, "chain", true],
  ];
  return (
    <svg viewBox="0 0 320 112" fill="none" className="h-28 w-full" role="img" aria-label="Your signed request passes through a relayer and the paymaster to the chain.">
      <path d="M46 56 H280" stroke="currentColor" strokeOpacity="0.22" strokeDasharray="3 5" />
      {hops.map(([x, label, active]) => (
        <g key={label} transform={`translate(${x} 56)`}>
          <rect x="-30" y="-14" width="60" height="28" rx="14" fill="var(--bg)" stroke={active ? "var(--accent)" : "currentColor"} strokeOpacity={active ? 1 : 0.45} strokeWidth="1.2" />
          <text y="4" textAnchor="middle" fontSize="10" fill={active ? "var(--accent)" : "currentColor"} fillOpacity={active ? 1 : 0.7} style={{ fontFamily: "var(--font-mono)" }}>
            {label}
          </text>
        </g>
      ))}
      <circle r="3" fill="var(--accent)">
        <animate attributeName="cx" values="46;280" dur="3.2s" repeatCount="indefinite" />
        <animate attributeName="cy" values="56;56" dur="3.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;1;1;0" dur="3.2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

export function HowItWorks() {
  return (
    <Section id="how">
      <SectionHead index="02" eyebrow="Under the hood" title="What happens when you hit send." />
      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr] lg:grid-rows-2">
        <Reveal variant="scale" className="h-full lg:row-span-2">
          <article className="card flex h-full flex-col overflow-hidden p-7">
            <p className="font-mono text-[12px] text-accent">01 / Sign</p>
            <p className="mt-3 text-[28px] font-semibold leading-tight tracking-[-0.04em]">One tap, one signature.</p>
            <p className="mt-2 max-w-[42ch] text-[15.5px] text-dim">
              Your wallet signs an EIP-712 ForwardRequest: a readable description of the exact call, bound to your next nonce so it
              can only run once.
            </p>
            <div className="inset-panel mt-10 rounded-[22px] p-4 lg:mt-auto">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent">ForwardRequest</p>
                <span className="pill !h-6 font-mono text-[10.5px]">EIP-712</span>
              </div>
              <dl className="mt-3 grid gap-2">
                {REQUEST_FIELDS.map(([k, v]) => (
                  <div key={k} className="receipt-row font-mono text-[12.5px]">
                    <dt className="text-mute">{k}</dt>
                    <span className="leader" />
                    <dd className="truncate">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <p className="mt-4 text-center font-mono text-[12px] text-mute">signed in your wallet, never sent as a transaction</p>
          </article>
        </Reveal>

        <Reveal variant="scale" delay={60} className="h-full">
          <article className="card h-full p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[12px] text-accent">02 / Relay</p>
                <p className="mt-3 text-[28px] font-semibold leading-tight tracking-[-0.04em]">A relayer delivers it.</p>
              </div>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] bg-[var(--knob)] text-accent shadow-[var(--edge-sm)]">
                <Icon name="send" size={22} />
              </span>
            </div>
            <p className="mt-2 text-[15.5px] text-dim">
              The app&apos;s relayer submits your signed request, and the Paymaster covers its gas, so you never need ETH to chat.
            </p>
            <div className="mt-4 text-fg">
              <RelayIllustration />
            </div>
          </article>
        </Reveal>

        <Reveal variant="scale" delay={120} className="h-full">
          <article className="card h-full p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[12px] text-accent">03 / Settle</p>
                <p className="mt-3 text-[28px] font-semibold leading-tight tracking-[-0.04em]">Recorded as you.</p>
              </div>
              <span className="pill pill-accent shrink-0 font-mono">ERC-2771</span>
            </div>
            <p className="mt-2 text-[15.5px] text-dim">
              The Forwarder verifies the signature and calls WhisperChain with your address, so the message, payment and file are yours.
            </p>
            <ul className="mt-6 grid gap-2 font-mono text-[12px]">
              {["MessageSent", "PaymentSettled", "MediaUploaded"].map((event) => (
                <li key={event} className="inset-panel flex items-center justify-between rounded-[14px] px-3.5 py-2.5">
                  <span>{event}</span>
                  <span className="text-accent">emitted</span>
                </li>
              ))}
            </ul>
          </article>
        </Reveal>
      </div>
    </Section>
  );
}

/* ── 03 What the contract enforces ────────────────────────────── */

const LIMITS = [
  { rule: "File size", note: "Photos, video, audio and documents, pinned to IPFS.", value: "50 MB" },
  { rule: "Storage per user", note: "Tracked on-chain; free it with clearStorage().", value: "1 GB" },
  { rule: "Messages per user", note: "A hard cap in the contract, not a server setting.", value: "10,000" },
  { rule: "Batch send", note: "Recipients in one signed batch.", value: "10" },
  { rule: "IPFS hash reuse", note: "A media hash can be recorded only once.", value: "once", accent: true },
];

export function Limits() {
  return (
    <Section id="limits">
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.15fr]">
        <div className="lg:sticky lg:top-12">
          <SectionHead index="03" eyebrow="The rules" title="What the contract enforces." />
          <Reveal variant="fade">
            <p className="-mt-4 max-w-[42ch] text-[16px] leading-relaxed text-dim">
              There is no backend deciding what you can send. Every limit below is a constant or a check in WhisperChain.sol, so it
              applies to everyone the same way.
            </p>
            <p className="mt-4 max-w-[42ch] text-[16px] leading-relaxed text-dim">
              Sends also run behind <span className="text-fg">ReentrancyGuard</span> and a <span className="text-fg">pause switch</span>{" "}
              from OpenZeppelin.
            </p>
            <a href={CONTRACTS_SRC_URL} target="_blank" rel="noreferrer" className="btn btn-ghost mt-6">
              Read the source <Icon name="arrowUpRight" size={16} />
            </a>
          </Reveal>
        </div>

        <Reveal variant="right">
          <div className="glass rounded-[30px]" data-lg="surface" data-lg-r="30" data-lg-tint="card">
            <div className="flex items-center justify-between border-b border-dashed border-line2 px-6 py-5 sm:px-8">
              <span className="font-mono text-[12px] uppercase tracking-[0.16em] text-dim">WhisperChain · limits</span>
              <Icon name="receipt" size={18} className="text-accent" />
            </div>
            <div className="grid gap-6 px-6 py-7 sm:px-8">
              {LIMITS.map((row) => (
                <div key={row.rule}>
                  <div className="receipt-row">
                    <span className={`text-[16px] font-semibold ${row.accent ? "text-accent" : ""}`}>{row.rule}</span>
                    <span className="leader" />
                    <span className={`font-mono text-[16px] font-medium tabular-nums ${row.accent ? "text-accent" : ""}`}>{row.value}</span>
                  </div>
                  <p className="mt-1 text-[13.5px] text-dim">{row.note}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-dashed border-line2 px-6 py-5 font-mono text-[12.5px] sm:px-8">
              <span className="uppercase tracking-[0.14em] text-dim">Solidity</span>
              <span className="text-accent">0.8.28</span>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ── 04 The contracts ─────────────────────────────────────────── */

const RIM = "url(#lgRim)";
const DOT = "#EEF9CF";

function ChatGlyph() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-12 w-12" aria-hidden="true">
      <path d="M9 11h30a3 3 0 0 1 3 3v15a3 3 0 0 1-3 3H22l-8 6v-6H9a3 3 0 0 1-3-3V14a3 3 0 0 1 3-3Z" stroke={RIM} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M14 21 H30" stroke={RIM} strokeWidth="1.8" strokeLinecap="round">
        <animate attributeName="opacity" values="1;0.2;1" dur="2.2s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

function KeyGlyph() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-12 w-12" aria-hidden="true">
      <circle cx="16" cy="30" r="7" stroke={RIM} strokeWidth="1.8" />
      <path d="M21 25 L38 8 M32 14 L36 18 M28 18 L31 21" stroke={RIM} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="16" cy="30" r="2" fill={DOT}>
        <animate attributeName="opacity" values="0.3;1;0.3" dur="3.2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function TankGlyph() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-12 w-12" aria-hidden="true">
      <path d="M8 24 H18" stroke={RIM} strokeWidth="1.8" strokeLinecap="round" />
      <rect x="18" y="14" width="14" height="20" rx="4" stroke={RIM} strokeWidth="1.8" />
      <path d="M32 24 H40" stroke={RIM} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="13" cy="24" r="2" fill={DOT}>
        <animate attributeName="cx" values="9;17;9" dur="3.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;1;0" dur="3.6s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

const CONTRACTS = [
  {
    tag: "Protocol",
    accent: true,
    title: "WhisperChain.sol",
    line: "Profiles, messages, conversations and storage. Settles ETH and ERC-20 payments and reads the real sender through ERC-2771.",
    call: "sendMessage(recipient, hash, token, amount, cid, type, size, text)",
    address: WHISPERCHAIN_ADDRESS,
    Glyph: ChatGlyph,
  },
  {
    tag: "Signatures",
    accent: false,
    title: "Forwarder.sol",
    line: "The trusted forwarder. Verifies an EIP-712 ForwardRequest and its nonce, then calls WhisperChain as you.",
    call: "execute(ForwardRequest req, bytes signature)",
    address: FORWARDER_ADDRESS,
    Glyph: KeyGlyph,
  },
  {
    tag: "Gas",
    accent: false,
    title: "WhisperChainPaymaster.sol",
    line: "Holds ETH, runs relays through the Forwarder and refunds the relayer, capped per transaction.",
    call: "relay(req, signature, relayer, reimbursement)",
    address: PAYMASTER_ADDRESS,
    Glyph: TankGlyph,
  },
];

export function Stack() {
  return (
    <Section id="stack">
      <SectionHead index="04" eyebrow="The contracts" title="Three contracts. One messaging protocol." />
      <div className="grid gap-4 lg:grid-cols-3">
        {CONTRACTS.map((c, i) => (
          <Reveal key={c.title} delay={i * 60} variant="scale" className="h-full min-w-0">
            <article className="card flex h-full min-w-0 flex-col p-7">
              <div className="flex items-start justify-between">
                <c.Glyph />
                <span className={c.accent ? "pill pill-accent" : "pill"}>{c.tag}</span>
              </div>
              <h3 className="h3 mt-8 break-words font-mono !text-[17px]">{c.title}</h3>
              <p className="mt-2 flex-1 text-[15px] leading-relaxed text-dim">{c.line}</p>
              <pre className="inset-panel mt-6 overflow-hidden whitespace-pre-wrap break-all rounded-[16px] p-4 font-mono text-[12px] leading-relaxed text-dim">
                <code>{c.call}</code>
              </pre>
              <a href={explorerAddress(c.address)} target="_blank" rel="noreferrer" className="btn btn-ghost mt-5 w-full">
                View on BaseScan <Icon name="arrowUpRight" size={15} />
              </a>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ── Closing ──────────────────────────────────────────────────── */

export function Closing() {
  return (
    <Section>
      <Reveal variant="scale">
        <div
          className="glass relative grid items-center gap-10 overflow-hidden rounded-[38px] px-6 py-14 sm:px-12 md:grid-cols-[1.2fr_1fr] md:py-16"
          data-lg="surface"
          data-lg-r="38"
          data-lg-tint="card"
        >
          <div>
            <p className="eyebrow">Start here</p>
            <h2 className="display mt-4 text-[clamp(36px,5vw,68px)]">
              Start a conversation. <span className="text-gradient">Bring your wallet.</span>
            </h2>
            <p className="mt-5 max-w-[42ch] text-[17px] text-dim">
              Connect a wallet, pick a username and say hello. Chats, groups, files and payments are all in one inbox, and you don&apos;t need
              ETH to send.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={APP_URL} className="btn btn-lg btn-white">
                Open the app
                <Icon name="arrowRight" size={18} stroke={2.2} />
              </Link>
              <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="btn btn-lg btn-ghost">
                <TelegramIcon className="h-[18px] w-[18px]" />
                Join the community
              </a>
            </div>
          </div>
          <div className="mx-auto w-full max-w-[360px] rotate-[-3deg]">
            <div className="card overflow-hidden p-4">
              <div className="flex items-center justify-between px-1">
                <span className="label">Run it yourself</span>
                <span className="font-mono text-[11px] text-mute">npm</span>
              </div>
              <pre className="inset-panel mt-3 overflow-x-auto rounded-[18px] p-5 font-mono text-[12.5px] leading-[1.9] text-dim">
                <code>
                  <span className="text-mute-soft"># deploy the three contracts</span>
                  {"\n"}
                  <span className="text-accent">$</span> npx hardhat ignition deploy
                  {"\n\n"}
                  <span className="text-mute-soft"># start the app and relayer</span>
                  {"\n"}
                  <span className="text-accent">$</span> npm run dev
                  {"\n"}
                  <span className="text-accent">✓</span> request signed
                  {"\n"}
                  <span className="text-accent">✓</span> relayed · gas refunded
                </code>
              </pre>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
