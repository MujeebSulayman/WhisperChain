"use client";

import { useState } from "react";
import { Icon } from "../site/Icons";

const FAQS: [string, string][] = [
  [
    "What is WhisperChain?",
    "Wallet-to-wallet messaging on Base. Messages, files and payments are calls to a smart contract, your wallet address is your account, and a relayer can submit the transaction for you so you don't pay gas.",
  ],
  [
    "Do I need ETH to send a message?",
    "Not when gasless sending is set up. You sign a request in your wallet, a relayer submits it, and the Paymaster refunds the relayer's gas. If gasless isn't configured, the app sends the transaction from your wallet and you pay the network fee.",
  ],
  [
    "Who can read my messages?",
    "Anyone who reads the chain. Message text is stored in the contract on a public network, and files on IPFS can be fetched by anyone with their CID. Don't send anything you need to keep secret.",
  ],
  [
    "Can the relayer change or fake my message?",
    "No. The Forwarder checks your EIP-712 signature over the exact call and your nonce. If a single byte changes, or the request is replayed, the signature fails and nothing runs.",
  ],
  [
    "How do payments work?",
    "Attach ETH or any ERC-20 to a message. The contract transfers it straight to the recipient in the same transaction and emits PaymentSettled. ERC-20 payments need a token approval first.",
  ],
  [
    "Where are files stored?",
    "On IPFS, pinned through Pinata. The contract records the file's CID, type and size, caps each file at 50 MB and each user at 1 GB, and won't accept the same CID twice.",
  ],
  [
    "Can I delete a message?",
    "The sender or recipient can mark a message deleted, and the app stops showing it. The original transaction stays in Base's history, as everything on-chain does.",
  ],
  [
    "Which network is it on?",
    "Base Sepolia, Base's test network (chain ID 84532). The contract addresses are on this page and can be checked on BaseScan.",
  ],
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="grid gap-3 lg:grid-cols-2 lg:items-start">
      {FAQS.map(([q, a], i) => {
        const on = open === i;
        return (
          <div key={q} className={`card overflow-hidden transition-colors duration-500 ${on ? "!bg-fg/[.07]" : ""}`}>
            <button
              type="button"
              className="flex w-full items-center gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
              onClick={() => setOpen(on ? null : i)}
              aria-expanded={on}
            >
              <span className={`font-mono text-[12px] transition-colors ${on ? "text-accent" : "text-mute"}`}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 text-[16px] font-semibold tracking-[-0.015em]">{q}</span>
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-[12px] transition-all duration-500 [transition-timing-function:var(--ease-spring)] ${
                  on ? "rotate-180 bg-accent-fill text-[var(--accent-ink)]" : "bg-fg/8"
                }`}
              >
                <Icon name="chevronDown" size={16} stroke={2.2} />
              </span>
            </button>
            <div className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: on ? "1fr" : "0fr" }}>
              <div className="overflow-hidden">
                <p className="pb-5 pl-[52px] pr-5 text-[15px] leading-relaxed text-dim sm:pr-6">{a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
