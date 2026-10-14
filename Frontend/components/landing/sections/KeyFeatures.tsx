import { Container } from "@/components/landing/ui/Container";
import { FadeUp } from "@/components/landing/ui/FadeUp";
import { Icon, type IconName } from "@/components/landing/ui/Icon";
import { SectionTitle } from "@/components/landing/ui/SectionTitle";

const FEATURES: { title: string; description: string; icon: IconName; tag: string }[] = [
  {
    title: "Your wallet is your account",
    description:
      "Register once with a username and a public key, and your address is your identity. No email, no password, and no server holding your account.",
    icon: "user",
    tag: "registerUser()",
  },
  {
    title: "Money travels with the message",
    description:
      "Attach ETH or any ERC-20 to a message. The payment goes straight to the recipient in the same transaction, so there's nothing to claim later.",
    icon: "coin",
    tag: "Pay-to-message",
  },
  {
    title: "Files pinned to IPFS",
    description:
      "Images, video, audio and documents are pinned to IPFS. The chain records each file's content hash, and a hash can only be used once.",
    icon: "file",
    tag: "50 MB per file · 1 GB per user",
  },
  {
    title: "Guardrails in the contract",
    description:
      "Reentrancy guards, a pause switch, per-user message caps and storage limits are enforced on-chain, not by a backend that could change.",
    icon: "shield",
    tag: "OpenZeppelin",
  },
];

export function KeyFeatures() {
  return (
    <section id="features" className="scroll-mt-24 pt-28 lg:pt-36">
      <Container>
        <SectionTitle
          eyebrow="Why WhisperChain"
          title={
            <>
              Messages on-chain. <span className="text-mute">No server in the middle.</span>
            </>
          }
        />
        <FadeUp>
          <ul className="grid border-t border-line md:grid-cols-2">
            {FEATURES.map(({ title, description, icon, tag }, i) => (
              <li
                key={title}
                className={`flex gap-5 border-b border-line py-8 md:py-10 ${i % 2 === 0 ? "md:border-r md:pr-10" : "md:pl-10"}`}
              >
                <Icon name={icon} size={22} className="mt-1 shrink-0 text-accent" />
                <div>
                  <h3 className="text-[21px] font-semibold leading-tight tracking-[-0.03em]">{title}</h3>
                  <p className="mt-2 max-w-[46ch] text-[15px] leading-relaxed text-dim">{description}</p>
                  <p className="label mt-4">{tag}</p>
                </div>
              </li>
            ))}
          </ul>
        </FadeUp>
      </Container>
    </section>
  );
}
