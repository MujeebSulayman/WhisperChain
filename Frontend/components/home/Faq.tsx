"use client";

import { useState } from "react";
import { Icon } from "../site/Icons";

const FAQS: [string, string][] = [
  [
    "What is WhisperChain?",
    "A messaging app where your wallet is your account. Chat one-to-one or in groups, share photos, video, audio and documents, message several people at once, and send a payment in the thread when you need to. Everything runs on smart contracts on Base.",
  ],
  [
    "Can I chat in groups?",
    "Yes. Start a new conversation and add as many registered wallet addresses as you like. Everyone in the group sees the conversation in their inbox.",
  ],
  [
    "What can I share?",
    "Text, photos, video, audio and documents. Files up to 50 MB are uploaded to IPFS and linked in the chat, and each user has 1 GB of storage.",
  ],
  [
    "Can I message many people at once?",
    "Yes. Batch send lets you write one message to up to ten recipients and send it with a single signature.",
  ],
  [
    "Do I need ETH to chat?",
    "Not when gasless sending is set up. You sign each message in your wallet, a relayer submits it, and the Paymaster covers the gas. If gasless isn't configured, the app sends the transaction from your wallet and you pay the network fee.",
  ],
  [
    "Who can read my messages?",
    "Anyone who reads the chain. Message text is stored in the contract on a public network, and files on IPFS can be fetched by anyone with their link. Don't send anything you need to keep secret.",
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
                  on ? "rotate-180 bg-accent text-[var(--accent-ink)]" : "bg-fg/8"
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
