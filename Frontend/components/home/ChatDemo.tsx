"use client";

import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "../site/Icons";

export type DemoMode = "direct" | "group" | "batch";

export const DEMO_MODES: { id: DemoMode; label: string }[] = [
  { id: "direct", label: "Direct chat" },
  { id: "group", label: "Group" },
  { id: "batch", label: "Batch send" },
];

type Item =
  | { at: number; from: "you" | string; text: string }
  | { at: number; from: "you" | string; file: { name: string; meta: string; icon: IconName } };

const SCRIPTS: Record<DemoMode, { title: string; subtitle: string; initials: string; items: Item[] }> = {
  direct: {
    title: "maya",
    subtitle: "0xa11c…19e4",
    initials: "MA",
    items: [
      { at: 0.4, from: "maya", text: "Did you get the photos from Saturday?" },
      { at: 1.8, from: "you", file: { name: "lisbon-sunset.jpg", meta: "Image · 2.4 MB · ipfs", icon: "file" } },
      { at: 3.0, from: "you", text: "Here they are. The last one is my favourite." },
      { at: 5.2, from: "maya", text: "These are great. Sending you the video next." },
    ],
  },
  group: {
    title: "Design crew",
    subtitle: "4 members",
    initials: "DC",
    items: [
      { at: 0.4, from: "ana", text: "New draft is up. Can everyone take a look?" },
      { at: 1.8, from: "you", file: { name: "brand-v3.pdf", meta: "Document · 1.1 MB · ipfs", icon: "file" } },
      { at: 3.0, from: "leo", text: "Looks sharp. Are we shipping Friday?" },
      { at: 5.2, from: "you", text: "Friday works. I'll post the final files here." },
    ],
  },
  batch: {
    title: "Batch send",
    subtitle: "3 recipients · one signature",
    initials: "3×",
    items: [
      { at: 0.4, from: "you", text: "Meetup moved to 7pm, same place. See you there!" },
      { at: 2.2, from: "0xa11c…19e4", text: "delivered" },
      { at: 2.9, from: "0x7d2e…b41c", text: "delivered" },
      { at: 3.6, from: "0x3f90…02aa", text: "delivered" },
    ],
  },
};

const LOOP_MS = 9000;
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const easeOut = (n: number) => 1 - Math.pow(1 - clamp01(n), 3);

function TypingDots() {
  return (
    <span className="inline-flex gap-1.5 py-1" aria-hidden>
      {[0, 150, 300].map((delay) => (
        <span key={delay} className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--mute)]" style={{ animationDelay: `${delay}ms` }} />
      ))}
    </span>
  );
}

/** A 9-second scripted conversation in the WhisperChain app. Bump `replay` to restart it. */
export function ChatDemo({ mode, replay = 0 }: { mode: DemoMode; replay?: number }) {
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
    if (replay) start.current = performance.now();
  }, [replay]);

  const s = ms / 1000;
  const script = SCRIPTS[mode];
  const isBatch = mode === "batch";
  // Someone else is "typing" just before their next message lands.
  const next = script.items.find((item) => item.at > s);
  const typing = !isBatch && next && next.from !== "you" && next.at - s < 1.2;

  return (
    <div className="glass w-full max-w-[420px] overflow-hidden rounded-[34px]" data-lg="surface" data-lg-r="34" data-lg-tint="card" aria-hidden>
      {/* Conversation header */}
      <div className="flex items-center gap-3 border-b border-line px-5 py-4">
        <span className="avatar h-10 w-10">{script.initials}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold">{script.title}</p>
          <p className="truncate font-mono text-[11px] text-mute">{script.subtitle}</p>
        </div>
        <span className="pill !h-7 font-mono text-[11px]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-good shadow-[0_0_10px_var(--good)]" />
          live
        </span>
      </div>

      {/* Thread */}
      <div className="grid min-h-[300px] content-start gap-2.5 px-5 py-5">
        {script.items.map((item, i) => {
          const shown = easeOut((s - item.at) / 0.45);
          if (shown <= 0) return null;
          const style = { opacity: shown, transform: `translateY(${(1 - shown) * 10}px)` };
          const mine = item.from === "you";

          if (isBatch && !mine && "text" in item) {
            return (
              <div key={i} className="inset-panel flex items-center justify-between rounded-[14px] px-3.5 py-2.5 font-mono text-[12px]" style={style}>
                <span>{item.from}</span>
                <span className="flex items-center gap-1.5 text-good">
                  <Icon name="check" size={13} stroke={2.4} />
                  {item.text}
                </span>
              </div>
            );
          }

          return (
            <div key={i} className={`flex flex-col ${mine ? "items-end" : "items-start"}`} style={style}>
              {!mine && mode === "group" ? <span className="mb-1 pl-1 font-mono text-[10.5px] text-mute">{item.from}</span> : null}
              {"file" in item ? (
                <div className={`flex w-[78%] items-center gap-3 rounded-[18px] px-3 py-2.5 ${mine ? "rounded-br-[6px]" : "rounded-bl-[6px]"} inset-panel`}>
                  <span className="tile h-9 w-9 rounded-[12px]">
                    <Icon name={item.file.icon} size={17} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-medium">{item.file.name}</p>
                    <p className="truncate font-mono text-[10.5px] text-mute">{item.file.meta}</p>
                  </div>
                </div>
              ) : (
                <p
                  className={`max-w-[82%] rounded-[18px] px-3.5 py-2 text-[14px] leading-snug ${
                    mine
                      ? "rounded-br-[6px] bg-[var(--btn-white-bg)] text-[var(--btn-white-fg)] shadow-[var(--edge-sm)]"
                      : "card !rounded-[18px] !rounded-bl-[6px]"
                  }`}
                >
                  {item.text}
                </p>
              )}
            </div>
          );
        })}
        {typing ? (
          <div className="card w-fit !rounded-[18px] !rounded-bl-[6px] px-3.5 py-1.5">
            <TypingDots />
          </div>
        ) : null}
      </div>

      {/* Composer */}
      <div className="flex items-center gap-2 border-t border-line px-4 py-3">
        <span className="grid h-8 w-8 place-items-center text-mute">
          <Icon name="file" size={16} />
        </span>
        <span className="flex-1 text-[13.5px] text-mute">Write a message…</span>
        <span className="tile is-on h-9 w-9 rounded-full">
          <Icon name="send" size={15} />
        </span>
      </div>
    </div>
  );
}
