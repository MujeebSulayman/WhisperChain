"use client";

import { useState } from "react";
import { TELEGRAM_URL } from "@/lib/links";
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
    <section id="faq" className="mx-auto w-full max-w-[1200px] scroll-mt-24 px-4 pt-28 sm:px-6 lg:pt-36">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <span className="kicker">
            <i />
            FAQ
          </span>
          <h2 className="h2 mt-5">Questions, answered.</h2>
          <p className="mt-4 max-w-[36ch] text-[16px] leading-relaxed text-dim">
            Still curious? Ask the team on{" "}
            <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="text-accent underline-offset-4 hover:underline">
              Telegram
            </a>
            .
          </p>
        </div>

        <div className="border-t border-line">
          {FAQS.map(([q, a], i) => {
            const on = open === i;
            return (
              <div key={q} className="border-b border-line">
                <button
                  type="button"
                  className="flex w-full items-center gap-4 py-5 text-left"
                  onClick={() => setOpen(on ? null : i)}
                  aria-expanded={on}
                >
                  <span className={`flex-1 text-[17px] font-semibold tracking-[-0.015em] transition-colors ${on ? "text-fg" : "text-dim"}`}>{q}</span>
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-all duration-500 [transition-timing-function:var(--ease-spring)] ${
                      on ? "rotate-45 bg-accent text-[var(--accent-ink)]" : "bg-fg/8 text-fg"
                    }`}
                  >
                    <Icon name="plus" size={16} stroke={2.2} />
                  </span>
                </button>
                <div className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: on ? "1fr" : "0fr" }}>
                  <div className="overflow-hidden">
                    <p className="max-w-[62ch] pb-6 pr-12 text-[15.5px] leading-relaxed text-dim">{a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
