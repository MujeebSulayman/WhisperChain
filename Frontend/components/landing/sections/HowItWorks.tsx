import { Container } from "@/components/landing/ui/Container";
import { FadeUp } from "@/components/landing/ui/FadeUp";
import { Icon, type IconName } from "@/components/landing/ui/Icon";
import { SectionTitle } from "@/components/landing/ui/SectionTitle";

const FLOW = ["Compose", "Sign", "Relay", "Settle"];

const STEPS: { title: string; description: string; icon: IconName }[] = [
  {
    title: "Write it, attach anything",
    description:
      "Type a message, add a file or a payment. Files are pinned to IPFS, and the CID and a keccak256 hash go into the call.",
    icon: "chat",
  },
  {
    title: "Sign a forward request",
    description:
      "Your wallet signs an EIP-712 ForwardRequest naming the target, the calldata and your nonce. Nothing is broadcast yet.",
    icon: "wallet",
  },
  {
    title: "The relayer submits it",
    description:
      "The app's /api/relay route hands it to Paymaster.relay(), which forwards the call and reimburses the relayer's gas.",
    icon: "send",
  },
  {
    title: "The chain records it",
    description:
      "The Forwarder checks your signature, and WhisperChain runs as you, settles any payment and emits MessageSent.",
    icon: "chain",
  },
];

export function HowItWorks() {
  return (
    <section id="howit" className="scroll-mt-24 pt-28 lg:pt-36">
      <Container>
        <SectionTitle
          eyebrow="The message path"
          title="From a text box to a confirmed transaction."
          description="Four stages, each with a clear owner: you write, your wallet signs, the relayer submits, the contracts settle."
        />

        {/* One path, read left to right (top to bottom on phones). The signing stop is the one that matters. */}
        <FadeUp>
          <ol className="relative grid gap-10 md:grid-cols-4 md:gap-6">
            <span
              aria-hidden
              className="absolute hidden h-px bg-line2 md:block md:left-6 md:right-[calc(25%-42px)] md:top-[23px]"
            />
            {STEPS.map(({ title, description, icon }, i) => (
              <li key={title} className="relative flex gap-5 md:block">
                {i < STEPS.length - 1 && (
                  <span aria-hidden className="absolute -bottom-10 left-[23px] top-12 w-px bg-line2 md:hidden" />
                )}
                <span className={`tile relative h-12 w-12 rounded-full ${i === 1 ? "is-on" : ""}`}>
                  <Icon name={icon} size={20} />
                </span>
                <div className="md:mt-7 md:pr-4">
                  <p className="font-mono text-[12px] text-accent">
                    0{i + 1} · {FLOW[i]}
                  </p>
                  <h3 className="h3 mt-2">{title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-dim">{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </FadeUp>
      </Container>
    </section>
  );
}
