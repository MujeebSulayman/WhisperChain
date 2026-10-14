import type { ReactNode } from "react";
import { Icon, type IconName } from "../site/Icons";
import { Reveal } from "../site/Reveal";

function Card({ index, title, children, className = "", delay = 0 }: { index: string; title: string; children: ReactNode; className?: string; delay?: number }) {
  return (
    <Reveal variant="scale" delay={delay} className={`h-full min-w-0 ${className}`}>
      <article className="card flex h-full flex-col overflow-hidden p-7">
        <p className="font-mono text-[12px] text-accent">{index}</p>
        <p className="mt-3 text-[26px] font-semibold leading-tight tracking-[-0.04em]">{title}</p>
        {children}
      </article>
    </Reveal>
  );
}

const THREADS: { initials: string; name: string; line: string; time: string; on?: boolean; members?: string }[] = [
  { initials: "MA", name: "maya", line: "These are great. Sending you the video next.", time: "now", on: true },
  { initials: "DC", name: "Design crew", line: "leo: Are we shipping Friday?", time: "2m", members: "4" },
  { initials: "7D", name: "0x7d2e…b41c", line: "Meetup moved to 7pm, same place.", time: "1h" },
];

const MEDIA: { icon: IconName; label: string }[] = [
  { icon: "file", label: "Images" },
  { icon: "sparkles", label: "Video" },
  { icon: "chat", label: "Audio" },
  { icon: "book", label: "Documents" },
];

/** One sender fanning out to many recipients. */
function FanOut() {
  const ys = [22, 46, 70, 94];
  return (
    <svg viewBox="0 0 300 116" fill="none" className="h-28 w-full" role="img" aria-label="One message fans out to several recipients.">
      {ys.map((y) => (
        <path key={y} d={`M64 58 C 140 58, 150 ${y}, 228 ${y}`} stroke="currentColor" strokeOpacity="0.22" />
      ))}
      <g transform="translate(40 58)">
        <circle r="20" fill="var(--bg)" stroke="var(--accent)" strokeWidth="1.2" />
        <text y="4" textAnchor="middle" fontSize="10" fill="var(--accent)" style={{ fontFamily: "var(--font-mono)" }}>
          you
        </text>
      </g>
      {ys.map((y, i) => (
        <g key={y} transform={`translate(246 ${y})`}>
          <rect x="-18" y="-9" width="36" height="18" rx="9" fill="var(--bg)" stroke="currentColor" strokeOpacity="0.45" />
          <text y="3.5" textAnchor="middle" fontSize="9" fill="currentColor" fillOpacity="0.7" style={{ fontFamily: "var(--font-mono)" }}>
            0x{["a1", "7d", "3f", "c4"][i]}
          </text>
        </g>
      ))}
      <circle r="3" fill="var(--accent)">
        <animateMotion dur="2.6s" repeatCount="indefinite" path="M64 58 C 140 58, 150 22, 228 22" />
      </circle>
      <circle r="3" fill="var(--accent)">
        <animateMotion dur="2.6s" begin="0.4s" repeatCount="indefinite" path="M64 58 C 140 58, 150 70, 228 70" />
      </circle>
    </svg>
  );
}

export function Features() {
  return (
    <section id="features" className="mx-auto w-full max-w-[1200px] scroll-mt-24 px-4 pt-28 sm:px-6 lg:pt-36">
      <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-end gap-5">
          <span className="hidden font-mono text-[64px] font-medium leading-[0.8] tracking-[-0.08em] text-fg/10 sm:block">01</span>
          <div>
            <p className="eyebrow">What you can do</p>
            <h2 className="h2 mt-3 max-w-[760px]">
              Everything a chat app needs. <span className="text-mute">Built on your wallet.</span>
            </h2>
          </div>
        </div>
      </Reveal>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card index="01 / Conversations" title="Direct chats and groups." className="lg:col-span-2">
          <p className="mt-2 max-w-[48ch] text-[15.5px] text-dim">
            Start a conversation with any registered wallet, or add several people to a group. Every chat sits in one inbox you can
            search.
          </p>
          <ul className="mt-6 grid gap-1.5 lg:mt-auto">
            {THREADS.map((t) => (
              <li key={t.name} className={`row !cursor-default ${t.on ? "is-on" : ""}`}>
                <span className={`avatar h-10 w-10 ${t.on ? "is-on" : ""}`}>{t.initials}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-[14px] font-semibold text-fg">{t.name}</span>
                    {t.members ? <span className="pill !h-5 !px-2 font-mono text-[10px]">{t.members} members</span> : null}
                    <span className="ml-auto font-mono text-[10.5px] text-mute">{t.time}</span>
                  </span>
                  <span className="block truncate text-[13px] text-dim">{t.line}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card index="02 / Media" title="Share anything." delay={60}>
          <p className="mt-2 text-[15.5px] text-dim">Send photos, video, audio and documents up to 50 MB each, stored on IPFS and linked in the chat.</p>
          <div className="mt-6 grid grid-cols-2 gap-2 lg:mt-auto">
            {MEDIA.map((m) => (
              <span key={m.label} className="inset-panel flex items-center gap-2 rounded-[14px] px-3 py-2.5 text-[13px]">
                <Icon name={m.icon} size={15} className="text-accent" />
                {m.label}
              </span>
            ))}
          </div>
        </Card>

        <Card index="03 / Batch send" title="Message ten people at once." delay={0}>
          <p className="mt-2 text-[15.5px] text-dim">Write one message, add up to ten recipients, and send them all with a single signature.</p>
          <div className="mt-4 text-fg lg:mt-auto">
            <FanOut />
          </div>
        </Card>

        <Card index="04 / Profiles" title="A name, not just an address." delay={60}>
          <p className="mt-2 text-[15.5px] text-dim">Pick a username when you join. It lives on-chain with your address, so it follows your wallet.</p>
          <div className="inset-panel mt-6 flex items-center gap-3 rounded-[18px] p-3 lg:mt-auto">
            <span className="avatar is-on h-10 w-10 text-[14px]">M</span>
            <div className="min-w-0">
              <p className="text-[14px] font-semibold">maya</p>
              <p className="font-mono text-[11px] text-mute">0xa11c…19e4</p>
            </div>
            <span className="ml-auto pill pill-accent !h-6 !px-2.5 text-[11px]">registered</span>
          </div>
        </Card>

        <Card index="05 / Payments" title="Send money in the chat." delay={120}>
          <p className="mt-2 text-[15.5px] text-dim">Attach ETH or any ERC-20 to a message when you need to. It lands with the message, straight to the other person.</p>
          <div className="mt-6 flex items-center gap-3 rounded-[18px] bg-[var(--btn-white-bg)] px-4 py-3 text-[var(--btn-white-fg)] shadow-[var(--edge-sm)] lg:mt-auto">
            <Icon name="coin" size={18} />
            <span className="text-[14px]">Thanks for dinner!</span>
            <span className="ml-auto font-mono text-[13px] font-semibold">0.01 ETH</span>
          </div>
        </Card>

        <Card index="06 / Inbox" title="Live, searchable, yours." className="lg:col-span-2" delay={0}>
          <p className="mt-2 max-w-[52ch] text-[15.5px] text-dim">
            New messages appear as they land on-chain. Search conversations by address or latest message, delete messages you no longer want shown,
            and keep an eye on your message count and storage.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:mt-auto">
            {[
              { icon: "chat" as IconName, label: "Live updates", value: "on-chain events" },
              { icon: "book" as IconName, label: "Search", value: "address or message" },
              { icon: "layers" as IconName, label: "Storage", value: "1 GB per user" },
            ].map((s) => (
              <div key={s.label} className="inset-panel rounded-[18px] p-4">
                <Icon name={s.icon} size={17} className="text-accent" />
                <p className="mt-3 text-[14px] font-semibold">{s.label}</p>
                <p className="font-mono text-[11.5px] text-mute">{s.value}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card index="07 / Gasless" title="No ETH to say hello." delay={60}>
          <p className="mt-2 text-[15.5px] text-dim">
            You sign each message in your wallet and a relayer submits it, so new people can chat without buying gas first.
          </p>
          <span className="pill pill-accent mt-6 w-fit lg:mt-auto">
            <Icon name="bolt" size={13} stroke={2} />
            Gasless sending
          </span>
        </Card>
      </div>
    </section>
  );
}
