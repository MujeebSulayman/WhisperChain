import Link from "next/link";
import { Icon } from "@/components/landing/ui/Icon";
import { ScrollLink } from "@/components/landing/ui/ScrollLink";
import { BASE_CHAIN } from "@/lib/deployments";
import { APP_URL } from "@/lib/links";

const CONTRACT_CALLS = [
  { contract: "Forwarder", result: "verify EIP-712 · nonce 7" },
  { contract: "WhisperChain", result: "sendMessage(0xa11c…e4, 5 USDC)" },
  { contract: "Paymaster", result: "relayer reimbursed" },
];

/** A still of one gasless message: what you wrote, the contracts it passes through, and the signature that starts it. */
function ExecutionPreview() {
  return (
    <figure
      className="glass rise mt-16 grid w-full max-w-[1040px] gap-px overflow-hidden rounded-[var(--r-panel)] text-left md:grid-cols-[1fr_1.1fr_0.95fr] lg:mt-20"
      style={{ animationDelay: "320ms" }}
      data-lg="surface"
      data-lg-r="32"
      data-lg-tint="card"
      aria-label="Example: you send a message with 5 USDC attached; your wallet signs a forward request and a relayer submits it, gas paid by the paymaster."
    >
      {/* 1. The message */}
      <div className="flex flex-col gap-3 p-5 md:p-6">
        <p className="label">Message</p>
        <p className="self-end rounded-[var(--r-inset)] rounded-br-md bg-fg/[.07] px-4 py-2.5 text-[14px]">
          Invoice attached. Here&apos;s the 5 USDC for the design.
        </p>
        <p className="flex items-center gap-2 self-end font-mono text-[12px] text-dim">
          <Icon name="file" size={14} className="text-accent" />
          invoice.pdf · ipfs://bafy…k4q
        </p>
      </div>

      {/* 2. What the contracts did */}
      <div className="hidden flex-col gap-3 border-line p-5 md:flex md:border-x md:p-6">
        <p className="label">Contract calls</p>
        <ol className="grid gap-2 font-mono text-[12px]">
          {CONTRACT_CALLS.map(({ contract, result }) => (
            <li key={contract} className="inset-panel flex flex-col gap-1 rounded-[var(--r-inset)] px-3.5 py-2.5">
              <span className="text-accent">{contract}</span>
              <span className="text-dim">{result}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* 3. Where it starts: your signature */}
      <div className="flex flex-col gap-3 border-t border-line p-5 md:border-t-0 md:p-6">
        <p className="label">Your wallet</p>
        <div className="card flex flex-1 flex-col p-4">
          <p className="text-[15px] font-semibold">Signature request</p>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13px]">
            <dt className="text-mute">Type</dt>
            <dd className="text-right font-mono">ForwardRequest</dd>
            <dt className="text-mute">To</dt>
            <dd className="text-right font-mono">WhisperChain</dd>
            <dt className="text-mute">Gas</dt>
            <dd className="text-right">Paid by paymaster</dd>
            <dt className="text-mute">Network</dt>
            <dd className="text-right">{BASE_CHAIN.name}</dd>
          </dl>
          <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
            <span className="btn btn-sm btn-ghost pointer-events-none">Reject</span>
            <span className="btn btn-sm btn-accent pointer-events-none">Sign</span>
          </div>
        </div>
      </div>
    </figure>
  );
}

export function Banner() {
  return (
    <section
      id="banner"
      className="relative mx-auto flex w-full max-w-[1200px] flex-col items-center px-4 pb-20 pt-36 text-center md:px-6 md:pt-44 lg:pb-24"
    >
      <h1 className="display rise max-w-[16ch] text-[clamp(42px,7vw,96px)]" style={{ animationDelay: "80ms" }}>
        You sign the message. <span className="text-accent">Someone else pays the gas.</span>
      </h1>

      <p
        className="rise mt-8 max-w-[56ch] text-[clamp(16px,1.5vw,19px)] leading-relaxed text-dim"
        style={{ animationDelay: "160ms" }}
      >
        WhisperChain is wallet-to-wallet messaging on {BASE_CHAIN.name}. Every message, file and payment is a contract call
        that you authorize with one signature. A relayer submits it, and the paymaster covers the gas.
      </p>

      <div className="rise mt-10 flex flex-wrap justify-center gap-3" style={{ animationDelay: "240ms" }}>
        <Link href={APP_URL} className="btn btn-lg btn-white">
          <Icon name="send" size={18} stroke={2} />
          Launch the app
        </Link>
        <ScrollLink to="contracts" className="btn btn-lg btn-ghost">
          <Icon name="code" size={18} />
          See the contracts
        </ScrollLink>
      </div>

      <ExecutionPreview />
    </section>
  );
}
