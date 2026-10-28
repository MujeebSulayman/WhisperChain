import type { ReactNode } from "react";
import { Icon, type IconName } from "../site/Icons";
import { Reveal } from "../site/Reveal";

/* ── Visuals ──────────────────────────────────────────────────── */

function GroupVisual() {
  const people = ["AN", "LE", "MA", "YO"];
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2.5">
            {people.map((p, i) => (
              <span key={p} className={`avatar h-9 w-9 text-[11px] ring-2 ring-[var(--bg)] ${i === 3 ? "is-on" : ""}`}>
                {p}
              </span>
            ))}
          </div>
          <div>
            <p className="text-[15px] font-semibold">Design crew</p>
            <p className="font-mono text-[11px] text-mute">4 members</p>
          </div>
        </div>
        <span className="pill !h-7 text-[12px]">Group</span>
      </div>
      <div className="mt-6 grid gap-2.5">
        {[
          { who: "ana", text: "New draft is up. Can everyone take a look?" },
          { who: "leo", text: "Looks sharp. Are we shipping Friday?" },
        ].map((m) => (
          <div key={m.who}>
            <p className="mb-1 pl-1 font-mono text-[10.5px] text-mute">{m.who}</p>
            <p className="inset-panel w-fit max-w-[85%] rounded-[16px] rounded-bl-[6px] px-3.5 py-2 text-[14px]">{m.text}</p>
          </div>
        ))}
        <p className="ml-auto w-fit max-w-[85%] rounded-[16px] rounded-br-[6px] bg-[var(--btn-white-bg)] px-3.5 py-2 text-[14px] text-[var(--btn-white-fg)]">
          Friday works. Final files coming here.
        </p>
      </div>
    </div>
  );
}

function MediaVisual() {
  return (
    <div className="card grid grid-cols-2 gap-3 p-6">
      <div className="relative col-span-2 h-40 overflow-hidden rounded-[18px] bg-linear-to-br from-accent/50 via-warm/30 to-fg/5">
        <span className="pill absolute bottom-3 left-3 !h-7 bg-[var(--surface)] text-[12px]">
          <Icon name="file" size={13} />
          sunset.jpg · 2.4 MB
        </span>
      </div>
      <div className="inset-panel flex flex-col justify-between rounded-[18px] p-4">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--btn-white-bg)] text-[var(--btn-white-fg)]">
          <Icon name="arrowRight" size={15} stroke={2.4} />
        </span>
        <p className="mt-6 text-[13px] font-medium">clip.mp4</p>
        <p className="font-mono text-[11px] text-mute">Video · 18 MB</p>
      </div>
      <div className="inset-panel flex flex-col justify-between rounded-[18px] p-4">
        <div className="flex h-9 items-end gap-[3px]">
          {[40, 75, 55, 90, 35, 65, 80, 45, 70, 30, 60].map((h, i) => (
            <span key={i} className="w-[4px] rounded-full bg-accent" style={{ height: `${h}%` }} />
          ))}
        </div>
        <p className="mt-6 text-[13px] font-medium">note.m4a</p>
        <p className="font-mono text-[11px] text-mute">Audio · 1.2 MB</p>
      </div>
    </div>
  );
}

function BatchVisual() {
  const recipients = ["0xa11c…19e4", "0x7d2e…b41c", "0x3f90…02aa"];
  return (
    <div className="card p-6">
      <p className="label">To</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {recipients.map((r) => (
          <span key={r} className="pill !h-7 font-mono text-[11.5px]">
            {r}
          </span>
        ))}
        <span className="pill pill-accent !h-7 text-[12px]">+ add</span>
      </div>
      <div className="inset-panel mt-4 rounded-[16px] px-4 py-3 text-[14px]">Meetup moved to 7pm, same place. See you there!</div>
      <ul className="mt-4 grid gap-2 font-mono text-[12px]">
        {recipients.map((r) => (
          <li key={r} className="flex items-center justify-between border-b border-dashed border-line2 pb-2 last:border-0">
            <span className="text-dim">{r}</span>
            <span className="flex items-center gap-1.5 text-good">
              <Icon name="check" size={13} stroke={2.4} />
              delivered
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PaymentVisual() {
  return (
    <div className="card p-6">
      <p className="card w-fit max-w-[80%] !rounded-[16px] !rounded-bl-[6px] px-3.5 py-2 text-[14px]">Dinner was 0.01 ETH each.</p>
      <div className="ml-auto mt-3 w-[80%] rounded-[20px] rounded-br-[6px] bg-[var(--btn-white-bg)] p-4 text-[var(--btn-white-fg)]">
        <p className="text-[12px] opacity-60">Payment attached</p>
        <p className="mt-1 font-display text-[34px] leading-none">0.01 ETH</p>
        <p className="mt-3 text-[14px]">Here&apos;s my share. Thanks for organising!</p>
      </div>
      <p className="mt-3 flex items-center justify-end gap-1.5 font-mono text-[11px] text-good">
        <Icon name="check" size={12} stroke={2.4} />
        settled to maya
      </p>
    </div>
  );
}

/* ── Rows ─────────────────────────────────────────────────────── */

const ROWS: { tag: string; title: string; body: string; points: string[]; icon: IconName; Visual: () => ReactNode }[] = [
  {
    tag: "Conversations",
    title: "One-to-one or the whole crew.",
    body: "Message any registered wallet, or start a group with as many people as you like. Every conversation lives in one inbox you can search.",
    points: ["Direct messages and groups", "Search by address or message", "New messages arrive live"],
    icon: "chat",
    Visual: GroupVisual,
  },
  {
    tag: "Media",
    title: "Share the photo, not a link to it.",
    body: "Send images, video, audio and documents up to 50 MB each. Files are stored on IPFS and open right in the chat.",
    points: ["Images, video, audio, documents", "Up to 50 MB per file", "1 GB of storage per user"],
    icon: "file",
    Visual: MediaVisual,
  },
  {
    tag: "Batch send",
    title: "Tell everyone at once.",
    body: "Write one message, add up to ten recipients, and send it to all of them with a single signature.",
    points: ["Up to 10 recipients", "One signature for the batch", "Each one lands in its own chat"],
    icon: "send",
    Visual: BatchVisual,
  },
  {
    tag: "Payments",
    title: "Settle up without leaving the chat.",
    body: "Attach ETH or USDC to a message. It goes straight to the other person in the same send, with nothing to claim later.",
    points: ["ETH or USDC", "Paid directly to the recipient", "A full payment history"],
    icon: "coin",
    Visual: PaymentVisual,
  },
];

export function Showcase() {
  return (
    <section id="features" className="mx-auto w-full max-w-[1200px] scroll-mt-24 px-4 pt-28 sm:px-6 lg:pt-36">
      <Reveal className="mx-auto max-w-[720px] text-center">
        <span className="kicker">
          <i />
          Features
        </span>
        <h2 className="h2 mt-5">Everything you expect from a chat app.</h2>
        <p className="mx-auto mt-4 max-w-[52ch] text-[17px] leading-relaxed text-dim">
          Plus the things only a wallet can do: sign in without an account, and send money with a message.
        </p>
      </Reveal>

      <div className="mt-20 grid gap-24 lg:gap-32">
        {ROWS.map(({ tag, title, body, points, icon, Visual }, i) => (
          <div key={tag} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal variant={i % 2 ? "right" : "left"} className={i % 2 ? "lg:order-2" : ""}>
              <p className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.14em] text-accent">
                <Icon name={icon} size={15} />
                {tag}
              </p>
              <h3 className="display mt-4 text-[clamp(30px,3.6vw,46px)]">{title}</h3>
              <p className="mt-4 max-w-[46ch] text-[16.5px] leading-relaxed text-dim">{body}</p>
              <ul className="mt-6 grid gap-3">
                {points.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-[15px]">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-accent/15 text-accent">
                      <Icon name="check" size={13} stroke={2.4} />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal variant="scale" delay={80} className={i % 2 ? "lg:order-1" : ""}>
              <Visual />
            </Reveal>
          </div>
        ))}
      </div>
    </section>
  );
}
