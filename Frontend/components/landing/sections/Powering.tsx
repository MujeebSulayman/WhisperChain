import { Container } from "@/components/landing/ui/Container";
import { FadeUp } from "@/components/landing/ui/FadeUp";
import { Icon, type IconName } from "@/components/landing/ui/Icon";
import { SectionTitle } from "@/components/landing/ui/SectionTitle";

type Pillar = { icon: IconName; title: string; description: string };

/** What only your signature can do. */
const USER_SIDE: Pillar[] = [
  {
    icon: "key",
    title: "Authority stays with you",
    description: "The contract only sees you as the sender when your own key signed the request. A relayer can't impersonate you.",
  },
  {
    icon: "hash",
    title: "Replay-proof by nonce",
    description: "Every forward request carries your next Forwarder nonce, so a signed message can only execute once.",
  },
];

/** What the relay side handles. */
const RELAY_SIDE: Pillar[] = [
  {
    icon: "bolt",
    title: "Gas from the Paymaster",
    description: "The Paymaster refunds each relay from its own balance, capped per transaction by maxReimbursementPerTx.",
  },
  {
    icon: "pause",
    title: "Owner controls, on-chain",
    description: "The owner can pause messaging, adjust the reimbursement cap and top up or withdraw the Paymaster.",
  },
];

function Side({ label, pillars }: { label: string; pillars: Pillar[] }) {
  return (
    <div className="p-6 sm:p-10">
      <p className="label">{label}</p>
      <ul className="mt-8 grid gap-8">
        {pillars.map(({ icon, title, description }) => (
          <li key={title} className="flex gap-4">
            <Icon name={icon} size={20} className="mt-0.5 shrink-0 text-accent" />
            <div>
              <h3 className="h3">{title}</h3>
              <p className="mt-2 max-w-[42ch] text-[15px] leading-relaxed text-dim">{description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Powering() {
  return (
    <section className="pt-28 lg:pt-36">
      <Container>
        <SectionTitle
          eyebrow="Under the hood"
          title="Your signature on one side. Their gas on the other."
          description="ERC-2771 meta-transactions keep a hard line between who authorizes a message and who pays to submit it. The two meet only at the signature."
        />
        <FadeUp>
          <div
            className="glass relative grid rounded-[var(--r-panel)] md:grid-cols-2"
            data-lg="surface"
            data-lg-r="32"
            data-lg-tint="card"
          >
            <Side label="Your side · authorizes" pillars={USER_SIDE} />

            {/* The line between them, and the only place they meet. */}
            <div
              aria-hidden
              className="relative mx-6 h-px bg-line2 md:absolute md:inset-y-10 md:left-1/2 md:mx-0 md:h-auto md:w-px"
            >
              <span className="pill absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-bg! font-mono text-[12px] text-accent">
                <Icon name="key" size={14} />
                EIP-712 signature
              </span>
            </div>

            <Side label="Relay side · pays" pillars={RELAY_SIDE} />
          </div>
        </FadeUp>
      </Container>
    </section>
  );
}
