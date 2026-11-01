"use client";

import { useState } from "react";
import { TELEGRAM_URL } from "@/lib/links";
import { BASE_CHAIN } from "@/lib/deployments";
import { Icon } from "../site/Icons";

const FAQS: [string, string][] = [
  [
    "What is Whispr?",
    "A privacy-first messaging app where your wallet is your account. Chat one-to-one or in groups, share photos, video, audio and documents that only the people in the conversation can open, message several people at once, and send a payment in the thread when you need to. Everything runs on smart contracts on Base.",
  ],
  [
    "Can I chat in groups?",
    "Yes. Start a new conversation and add as many registered wallet addresses as you like. Everyone in the group sees the conversation in their inbox.",
  ],
  [
    "What can I share?",
    "Text, photos, video, audio and documents. Files up to 50 MB open right in the chat, only for the people in it, and each user has 1 GB of storage.",
  ],
  [
    "Can I message many people at once?",
    "Yes. Batch send lets you write one message to up to ten recipients and send it with a single signature.",
  ],
  [
    "Do I need ETH to chat?",
    "No. You sign each message in your wallet, the app's relayer submits it, and the Paymaster covers the gas. Whoever runs the app needs to keep the relayer and Paymaster funded.",
  ],
  [
    "Who can read my messages?",
    "Only you and the people in the conversation. Messages, photos and files stay private to the chat. Payments are private too: anyone can see that money moved, but not who received it. What's on the public network is who messaged whom, and when.",
  ],
  [
    "Can I delete a message?",
    "Yes. Hover a message and delete it, and it disappears from the chat. A record that a message was sent always stays in Base's history, but what it said stays private.",
  ],
  [
    "Which network is it on?",
    `${BASE_CHAIN.name}. The contract addresses are on this page and can be checked on BaseScan.`,
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
