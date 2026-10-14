import { Container } from "@/components/landing/ui/Container";
import { FadeUp } from "@/components/landing/ui/FadeUp";
import { Icon, type IconName } from "@/components/landing/ui/Icon";
import { SectionTitle } from "@/components/landing/ui/SectionTitle";

const PARTS: { name: string; kind: string; description: string; architecture: string; icon: IconName }[] = [
  {
    name: "WhisperChain.sol",
    kind: "Contract",
    description:
      "The protocol. It holds profiles, messages, conversations and storage accounting. It settles ETH and ERC-20 payments and reads the real sender through ERC-2771.",
    architecture: "Forwarder → WhisperChain → _msgSender() → MessageSent",
    icon: "chat",
  },
  {
    name: "Forwarder.sol",
    kind: "Contract",
    description:
      "The trusted forwarder. It verifies an EIP-712 ForwardRequest and its nonce, then calls WhisperChain with your address appended so the call runs as you.",
    architecture: "Your wallet → EIP-712 signature → Forwarder → WhisperChain",
    icon: "key",
  },
  {
    name: "WhisperChainPaymaster.sol",
    kind: "Contract",
    description:
      "The gas tank. It holds ETH, runs relays through the Forwarder and pays back the relayer, capped by maxReimbursementPerTx.",
    architecture: "Relayer → Paymaster → Forwarder → Reimburse relayer",
    icon: "bolt",
  },
  {
    name: "Next.js client",
    kind: "Frontend",
    description:
      "The app you use. It runs on ethers v6 with TypeChain bindings and Pinata for IPFS, plus a server-side /api/relay route that holds the relayer key.",
    architecture: "ethers v6 → TypeChain → /api/relay → Paymaster",
    icon: "code",
  },
];

const HIGHLIGHT = new Set(["WhisperChain", "Forwarder", "Paymaster"]);

/** "A → B → C" as a wrapped row of chips. Each arrow stays with the hop it points to, so a line never ends on one. */
function Route({ path }: { path: string }) {
  const hops = path.split("→").map((s) => s.trim());
  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
      {hops.map((hop, i) => (
        <span key={i} className="flex items-center gap-1.5 whitespace-nowrap">
          {i > 0 && <Icon name="arrowRight" size={13} className="text-mute-soft" />}
          <span
            className={`rounded-full px-2.5 py-1 font-mono text-[12px] ${
              HIGHLIGHT.has(hop) ? "bg-accent/12 text-accent" : "bg-fg/[.05] text-dim"
            }`}
          >
            {hop}
          </span>
        </span>
      ))}
    </div>
  );
}

export function Contracts() {
  return (
    <section id="contracts" className="scroll-mt-24 pt-28 lg:pt-36">
      <Container>
        <SectionTitle
          eyebrow="The stack"
          title="Three contracts. One messaging protocol."
          description="Each piece does one job. The Forwarder proves who you are, WhisperChain keeps the record, the Paymaster pays the gas, and the client ties them together."
        />
        <FadeUp className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {PARTS.map(({ name, kind, description, architecture, icon }, i) => (
            <article key={name} className="card flex h-full flex-col p-6 lg:p-8">
              <div className="flex items-center gap-4">
                <span className="tile h-14 w-14 rounded-[var(--r-inset)]">
                  <Icon name={icon} size={24} />
                </span>
                <div>
                  <p className="label">
                    {kind} 0{i + 1}
                  </p>
                  <h3 className="mt-1 font-mono text-[20px] font-medium tracking-[-0.02em]">{name}</h3>
                </div>
              </div>
              <p className="mt-6 flex-1 text-[15px] leading-relaxed text-dim">{description}</p>
              <div className="inset-panel mt-6 rounded-[var(--r-inset)] p-4 lg:p-5">
                <p className="label mb-3">Call path</p>
                <Route path={architecture} />
              </div>
            </article>
          ))}
        </FadeUp>
      </Container>
    </section>
  );
}
