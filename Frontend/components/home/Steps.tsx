import { Icon, type IconName } from "../site/Icons";
import { Reveal } from "../site/Reveal";

const STEPS: { icon: IconName; title: string; body: string }[] = [
  { icon: "wallet", title: "Connect your wallet", body: "MetaMask or any injected wallet. Your address is your account, so there is no sign-up form." },
  { icon: "user", title: "Pick a username", body: "Choose the name people will see. It is saved on-chain with your address in one signature." },
  { icon: "chat", title: "Say hello", body: "Start a chat or a group and send your first message. A relayer submits it, so you pay no gas." },
];

const NUMBERS = [
  { value: "0 ETH", label: "to send a message" },
  { value: "50 MB", label: "per file you share" },
  { value: "10", label: "people per batch send" },
  { value: "1 GB", label: "of storage per user" },
];

export function Steps() {
  return (
    <section id="how" className="mx-auto w-full max-w-[1200px] scroll-mt-24 px-4 pt-28 sm:px-6 lg:pt-36">
      <Reveal className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <span className="kicker">
            <i />
            How it works
          </span>
          <h2 className="h2 mt-5 max-w-[16ch]">Up and chatting in a minute.</h2>
        </div>
        <p className="max-w-[40ch] text-[16px] leading-relaxed text-dim">
          Behind each message is a signed request your wallet approves. The app handles the rest.
        </p>
      </Reveal>

      <Reveal variant="fade">
        <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          <span aria-hidden className="absolute left-7 right-7 top-7 hidden border-t border-dashed border-line2 md:block" />
          {STEPS.map(({ icon, title, body }, i) => (
            <li key={title} className="relative">
              <span className={`relative grid h-14 w-14 place-items-center rounded-[18px] ${i === 2 ? "bg-accent text-[var(--accent-ink)]" : "bg-[var(--surface)] text-accent shadow-[var(--card-rim)]"}`}>
                <Icon name={icon} size={22} />
              </span>
              <p className="mt-6 font-mono text-[12px] text-mute">Step {i + 1}</p>
              <h3 className="h3 mt-1 !text-[21px]">{title}</h3>
              <p className="mt-2 max-w-[34ch] text-[15px] leading-relaxed text-dim">{body}</p>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal variant="fade" className="mt-20">
        <dl className="grid grid-cols-2 border-y border-line md:grid-cols-4">
          {NUMBERS.map((n, i) => (
            <div key={n.label} className={`px-2 py-8 md:px-6 ${i % 2 ? "border-l border-line" : ""} ${i === 2 ? "md:border-l" : ""} ${i > 1 ? "border-t border-line md:border-t-0" : ""}`}>
              <dt className="font-display text-[clamp(34px,4.4vw,56px)] leading-none">{n.value}</dt>
              <dd className="mt-3 text-[14px] text-mute">{n.label}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
}
