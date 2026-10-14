import Link from "next/link";
import { APP_URL } from "@/lib/links";
import { Icon, type IconName } from "../site/Icons";

const THREADS = [
  { initials: "MA", name: "maya", line: "These are great. Sending the video next.", time: "now", on: true },
  { initials: "DC", name: "Design crew", line: "leo: Are we shipping Friday?", time: "2m" },
  { initials: "7D", name: "0x7d2e…b41c", line: "Meetup moved to 7pm.", time: "1h" },
  { initials: "SO", name: "sol", line: "Thanks for dinner!", time: "3h" },
];

/** A still of the app: the inbox on the left, an open conversation on the right. */
function AppWindow() {
  return (
    <figure
      className="relative mx-auto mt-16 w-full max-w-[1080px] text-left lg:mt-20"
      aria-label="The WhisperChain app: an inbox of conversations and an open chat with a photo, messages and a payment."
    >
      <div className="sheet rise overflow-hidden !rounded-[24px]" style={{ animationDelay: "320ms" }}>
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-2.5 w-2.5 rounded-full bg-fg/15" />
          ))}
          <span className="mx-auto rounded-full bg-fg/[.05] px-4 py-1 font-mono text-[11px] text-mute">whisperchain / app</span>
        </div>

        <div className="grid md:grid-cols-[280px_1fr]">
          {/* Inbox */}
          <aside className="hidden border-r border-line p-3 md:block">
            <div className="input !py-2.5 text-[13px] text-mute">Search conversations</div>
            <ul className="mt-3 grid grid-cols-1 gap-1">
              {THREADS.map((t) => (
                <li key={t.name} className={`row !cursor-default !py-2 ${t.on ? "is-on" : ""}`}>
                  <span className={`avatar h-9 w-9 text-[11px] ${t.on ? "is-on" : ""}`}>{t.initials}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[13.5px] font-semibold text-fg">{t.name}</span>
                      <span className="ml-auto font-mono text-[10px] text-mute">{t.time}</span>
                    </span>
                    <span className="block truncate text-[12.5px] text-dim">{t.line}</span>
                  </span>
                </li>
              ))}
            </ul>
          </aside>

          {/* Conversation */}
          <div className="flex min-h-[380px] flex-col">
            <div className="flex items-center gap-3 border-b border-line px-5 py-3">
              <span className="avatar is-on h-9 w-9 text-[11px]">MA</span>
              <div>
                <p className="text-[14px] font-semibold">maya</p>
                <p className="font-mono text-[10.5px] text-mute">0xa11c…19e4</p>
              </div>
            </div>
            <div className="grid flex-1 content-start gap-2.5 p-5">
              <p className="card w-fit max-w-[75%] !rounded-[18px] !rounded-bl-[6px] px-3.5 py-2 text-[14px]">Did you get the photos from Saturday?</p>
              <div className="ml-auto grid w-[55%] max-w-[280px] grid-cols-3 gap-1.5 overflow-hidden rounded-[18px] rounded-br-[6px]">
                {["from-accent/60 to-warm/40", "from-warm/50 to-fg/10", "from-good/40 to-accent/30"].map((g) => (
                  <span key={g} className={`aspect-square bg-linear-to-br ${g}`} />
                ))}
              </div>
              <p className="ml-auto w-fit max-w-[75%] rounded-[18px] rounded-br-[6px] bg-[var(--btn-white-bg)] px-3.5 py-2 text-[14px] text-[var(--btn-white-fg)]">
                Here they are. The last one is my favourite.
              </p>
              <div className="card flex w-fit items-center gap-3 !rounded-[18px] !rounded-bl-[6px] px-3.5 py-2.5">
                <Icon name="coin" size={16} className="text-accent" />
                <span className="text-[14px]">Coffee is on me</span>
                <span className="font-mono text-[13px] font-semibold">0.002 ETH</span>
              </div>
            </div>
            <div className="flex items-center gap-2 border-t border-line px-4 py-3">
              <Icon name="file" size={16} className="text-mute" />
              <span className="flex-1 text-[13.5px] text-mute">Write a message…</span>
              <span className="btn btn-sm btn-accent pointer-events-none">
                <Icon name="send" size={14} />
                Send
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating notes on the window's edges */}
      <span className="pill pill-accent absolute -left-6 -top-4 hidden shadow-[var(--shadow)] lg:inline-flex">
        <Icon name="bolt" size={13} stroke={2} />
        Sent gasless
      </span>
      <span className="pill absolute -right-5 bottom-[78px] hidden bg-[var(--surface)] shadow-[var(--shadow)] lg:inline-flex">
        <Icon name="file" size={13} />
        3 photos · on IPFS
      </span>
    </figure>
  );
}

const TICKER: { icon: IconName; label: string }[] = [
  { icon: "chat", label: "Direct messages" },
  { icon: "user", label: "Group chats" },
  { icon: "file", label: "Photos and video" },
  { icon: "book", label: "Documents" },
  { icon: "send", label: "Batch send to 10" },
  { icon: "coin", label: "Payments in chat" },
  { icon: "bolt", label: "No gas to send" },
  { icon: "key", label: "Wallet sign-in" },
];

const TICKER_FADE = "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)";

/** An endless horizontal carousel of features. Self-styled, so it never falls back to a vertical list. */
function Ticker() {
  const track = (copy: number) => (
    <div
      aria-hidden={copy > 0 || undefined}
      style={{ display: "flex", flexShrink: 0, gap: 40, paddingRight: 40, animation: "wc-ticker 36s linear infinite" }}
    >
      {TICKER.map((t) => (
        <span key={t.label} style={{ display: "flex", flexShrink: 0, alignItems: "center", gap: 10, whiteSpace: "nowrap" }} className="text-[15px] text-dim">
          <Icon name={t.icon} size={16} className="text-accent" />
          {t.label}
        </span>
      ))}
    </div>
  );
  return (
    <div
      className="mt-20 border-y border-line py-5"
      style={{ display: "flex", overflow: "hidden", WebkitMaskImage: TICKER_FADE, maskImage: TICKER_FADE }}
    >
      <style>{`@keyframes wc-ticker { to { transform: translateX(-100%); } }
@media (prefers-reduced-motion: reduce) { [style*="wc-ticker"] { animation: none !important; } }`}</style>
      {track(0)}
      {track(1)}
    </div>
  );
}

export function Hero() {
  return (
    <>
      <section className="relative mx-auto w-full max-w-[1200px] px-4 pt-16 text-center sm:px-6 lg:pt-24">
        <span className="kicker rise">
          <i />
          Wallet-to-wallet messaging
        </span>

        <h1 className="display rise mx-auto mt-6 max-w-[13ch] text-[clamp(46px,7.6vw,108px)]" style={{ animationDelay: "80ms" }}>
          Chat from <span className="text-gradient">your wallet.</span>
        </h1>

        <p className="rise mx-auto mt-6 max-w-[54ch] text-[clamp(16px,1.5vw,19px)] leading-relaxed text-dim" style={{ animationDelay: "160ms" }}>
          WhisperChain is a messaging app where your wallet is your account. Talk one-to-one or in groups, share photos, video and
          files, and send a payment right in the conversation.
        </p>

        <div className="rise mt-9 flex flex-wrap justify-center gap-3" style={{ animationDelay: "240ms" }}>
          <Link href={APP_URL} className="btn btn-lg btn-accent">
            Start chatting
            <Icon name="arrowRight" size={18} stroke={2.2} />
          </Link>
          <Link href="/#features" className="btn btn-lg btn-ghost">
            Explore features
          </Link>
        </div>
        <p className="rise mt-5 font-mono text-[12px] text-mute" style={{ animationDelay: "280ms" }}>
          No email. No password. No gas.
        </p>

        <AppWindow />
      </section>
      <Ticker />
    </>
  );
}
