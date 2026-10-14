import { Container } from "@/components/landing/ui/Container";
import { FadeUp } from "@/components/landing/ui/FadeUp";
import { Icon, type IconName } from "@/components/landing/ui/Icon";
import { SectionTitle } from "@/components/landing/ui/SectionTitle";
import { BASE_CHAIN, FORWARDER_ADDRESS, PAYMASTER_ADDRESS, WHISPERCHAIN_ADDRESS } from "@/lib/deployments";
import { explorerAddress } from "@/lib/links";

const DEPLOYMENTS: { name: string; address: string; icon: IconName; description: string }[] = [
  {
    name: "WhisperChain",
    address: WHISPERCHAIN_ADDRESS,
    icon: "chat",
    description: "Read profiles, messages and conversations straight from contract state and events.",
  },
  {
    name: "Forwarder",
    address: FORWARDER_ADDRESS,
    icon: "key",
    description: "Look up any address's nonce and every forward request it has executed.",
  },
  {
    name: "Paymaster",
    address: PAYMASTER_ADDRESS,
    icon: "bolt",
    description: "Check the gas balance, the reimbursement cap and every Relayed event.",
  },
];

const short = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`;

export function Deployments() {
  return (
    <section className="fuel pt-28 lg:pt-36">
      <Container>
        <SectionTitle
          eyebrow={`Live on ${BASE_CHAIN.name}`}
          title="Deployed and open to inspect."
          description={`Chain ID ${BASE_CHAIN.id}. Deployed with Hardhat Ignition, so you can check every claim on this page on BaseScan.`}
        />
        <FadeUp>
          <ul className="grid border-y border-line md:grid-cols-3">
            {DEPLOYMENTS.map(({ name, address, icon, description }, i) => (
              <li key={name} className={i > 0 ? "border-t border-line md:border-l md:border-t-0" : ""}>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={explorerAddress(address)}
                  className={`group flex h-full gap-4 py-6 transition-colors hover:bg-fg/[.025] ${i === 0 ? "md:pr-6" : "md:px-6"}`}
                >
                  <Icon name={icon} size={24} className="mt-0.5 shrink-0 text-fg" />
                  <span className="flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-[17px] font-semibold tracking-[-0.02em]">{name}</span>
                      <Icon name="arrowUpRight" size={18} className="text-mute transition-colors group-hover:text-accent" />
                    </span>
                    <span className="mt-0.5 block font-mono text-[12px] text-accent" title={address}>
                      {short(address)}
                    </span>
                    <span className="mt-2 block text-[14px] leading-relaxed text-dim">{description}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </FadeUp>
      </Container>
    </section>
  );
}
