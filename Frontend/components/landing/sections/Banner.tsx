import Link from "next/link";
import { Icon, type IconName } from "@/components/landing/ui/Icon";
import { ScrollLink } from "@/components/landing/ui/ScrollLink";
import { BASE_CHAIN } from "@/lib/deployments";
import { APP_URL } from "@/lib/links";

/** The standards the product is built on, shown as a spec strip under the call to action. */
const SPECS: { label: string; value: string }[] = [
  { label: "Signing", value: "EIP-712" },
  { label: "Gasless relay", value: "ERC-2771" },
  { label: "Media", value: "IPFS" },
  { label: "Settlement", value: "Base L2" },
];

const STATUS: { label: string; icon: IconName }[] = [
  { label: "Signed", icon: "key" },
  { label: "Relayed", icon: "send" },
  { label: "Confirmed", icon: "check" },
];

/** A still of the app: one conversation carrying a message, a file and a payment, each confirmed on-chain. */
function ConversationPreview() {
  return (
    <figure
      className="relative w-full max-w-[520px] justify-self-center lg:justify-self-end"
      aria-label="Example conversation: a message, an IPFS file and a 5 USDC payment, each signed, relayed and confirmed on Base."
    >
      <div
        className="glass rise overflow-hidden rounded-[var(--r-panel)]"
        style={{ animationDelay: "280ms" }}
        data-lg="surface"
        data-lg-r="32"
        data-lg-tint="card"
      >
        {/* Conversation header */}
        <div className="flex items-center gap-3 border-b border-line px-5 py-4">
          <span className="tile h-10 w-10 rounded-full font-mono text-[12px] text-fg">0x</span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold">Studio Northwind</p>
            <p className="font-mono text-[12px] text-mute">0xa11c…19e4</p>
          </div>
          <span className="pill h-7! px-3! text-[12px] text-dim">
            <span className="h-1.5 w-1.5 rounded-full bg-good" />
            {BASE_CHAIN.name}
          </span>
        </div>

        {/* Thread */}
        <div className="grid gap-3 px-5 py-5">
          <p className="max-w-[80%] rounded-[var(--r-inset)] rounded-bl-md bg-fg/[.05] px-4 py-2.5 text-[14px] text-dim">
            Could you send over the signed invoice for the brand work?
          </p>

          <div className="inset-panel ml-auto flex w-[80%] items-center gap-3 rounded-[var(--r-inset)] rounded-br-md px-4 py-3">
            <span className="tile h-9 w-9 rounded-[10px]">
              <Icon name="file" size={18} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-medium">invoice-0142.pdf</p>
              <p className="truncate font-mono text-[11px] text-mute">248 KB · ipfs://bafy…k4q</p>
            </div>
          </div>

          <div className="ml-auto w-[80%] rounded-[var(--r-inset)] rounded-br-md bg-accent-fill px-4 py-3 text-white">
            <p className="text-[12px] opacity-80">Payment attached</p>
            <p className="mt-0.5 text-[22px] font-semibold tracking-[-0.02em]">5.00 USDC</p>
            <p className="mt-1 text-[13px] opacity-90">Here you go. Thanks for the quick turnaround.</p>
          </div>

          <ul className="ml-auto flex items-center gap-3 font-mono text-[11px] text-mute">
            {STATUS.map(({ label, icon }) => (
              <li key={label} className="flex items-center gap-1">
                <Icon name={icon} size={12} className="text-good" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Composer */}
        <div className="flex items-center gap-2 border-t border-line px-4 py-3">
          <span className="flex-1 px-1 text-[14px] text-mute">Write a message…</span>
          <span className="pill pill-accent h-7! px-3! text-[12px]">
            <Icon name="bolt" size={12} />
            Gasless
          </span>
          <span className="tile h-9 w-9 rounded-full is-on">
            <Icon name="send" size={16} />
          </span>
        </div>
      </div>

      {/* Receipt that floats over the corner */}
      <div
        className="card rise absolute -bottom-6 -left-4 hidden w-[230px] p-4 shadow-[var(--shadow)] sm:block lg:-left-10"
        style={{ animationDelay: "420ms" }}
      >
        <p className="label">Transaction</p>
        <dl className="mt-2.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[12px]">
          <dt className="text-mute">Status</dt>
          <dd className="text-right text-good">Confirmed</dd>
          <dt className="text-mute">Method</dt>
          <dd className="text-right font-mono">sendMessage</dd>
          <dt className="text-mute">Gas</dt>
          <dd className="text-right">Paymaster</dd>
        </dl>
      </div>
    </figure>
  );
}

export function Banner() {
  return (
    <section
      id="banner"
      className="relative mx-auto grid w-full max-w-[1200px] grid-cols-1 items-center gap-16 px-4 pb-24 pt-36 md:px-6 md:pt-44 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:pb-32"
    >
      <div>
        <p className="pill rise" style={{ animationDelay: "40ms" }}>
          <span className="h-1.5 w-1.5 rounded-full bg-good" />
          Live on {BASE_CHAIN.name}
        </p>

        <h1 className="display rise mt-7 max-w-[14ch] text-[clamp(40px,5.6vw,76px)]" style={{ animationDelay: "100ms" }}>
          Wallet-native messaging, <span className="text-accent">settled <span className="whitespace-nowrap">on-chain.</span></span>
        </h1>

        <p
          className="rise mt-7 max-w-[50ch] text-[clamp(16px,1.4vw,18px)] leading-relaxed text-dim"
          style={{ animationDelay: "160ms" }}
        >
          Send messages, files and payments between wallets. Each one is authorized by your signature, relayed without gas
          and recorded permanently on Base.
        </p>

        <div className="rise mt-10 flex flex-wrap gap-3" style={{ animationDelay: "220ms" }}>
          <Link href={APP_URL} className="btn btn-lg btn-white">
            Launch the app
            <Icon name="arrowRight" size={18} stroke={2.2} />
          </Link>
          <ScrollLink to="contracts" className="btn btn-lg btn-ghost">
            <Icon name="code" size={18} />
            Explore the contracts
          </ScrollLink>
        </div>

        <dl
          className="rise mt-14 grid max-w-[520px] grid-cols-2 gap-y-6 border-t border-line pt-7 md:grid-cols-4"
          style={{ animationDelay: "300ms" }}
        >
          {SPECS.map(({ label, value }) => (
            <div key={label}>
              <dt className="label text-[11px]!">{label}</dt>
              <dd className="mt-1.5 font-mono text-[15px] text-fg">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <ConversationPreview />
    </section>
  );
}
