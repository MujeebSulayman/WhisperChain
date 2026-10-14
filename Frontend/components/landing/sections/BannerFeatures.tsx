import type { ComponentType } from "react";
import { ContractsArt, RelayArt, SignArt } from "@/components/landing/icons";
import { Container } from "@/components/landing/ui/Container";
import { FadeUp } from "@/components/landing/ui/FadeUp";

const FEATURES: { title: string; description: string; Art: ComponentType<{ className?: string }> }[] = [
  {
    title: "Relayed, never trusted",
    description: "The relayer submits your transaction. It can't alter it or act as you without your signature.",
    Art: RelayArt,
  },
  {
    title: "One signature per message",
    description: "Your wallet signs an EIP-712 request you can read. You don't need ETH in the wallet.",
    Art: SignArt,
  },
  {
    title: "Three contracts, one protocol",
    description: "The Forwarder verifies, WhisperChain stores and settles, and the Paymaster covers gas.",
    Art: ContractsArt,
  },
];

export function BannerFeatures() {
  return (
    <div className="bannerFeature pb-4">
      <Container>
        <FadeUp>
          <div
            className="glass grid grid-cols-1 gap-3 rounded-[var(--r-panel)] p-3 md:grid-cols-2 md:gap-4 md:p-4 xl:grid-cols-3"
            data-lg="surface"
            data-lg-r="32"
            data-lg-tint="card"
          >
            {FEATURES.map(({ title, description, Art }, i) => (
              <div
                key={title}
                className="card relative z-1 flex min-h-[400px] flex-col justify-end overflow-hidden lg:min-h-[440px]"
              >
                <div className="absolute inset-x-0 top-0 flex justify-center px-4 pt-4">
                  <Art className="h-auto w-full max-w-[320px]" />
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-1 h-40 bg-linear-to-t from-bg/80 to-transparent" />
                <div className="relative z-2 px-6 pb-7 md:px-7">
                  <p className="font-mono text-[12px] text-accent">0{i + 1}</p>
                  <h3 className="h3 mt-2 text-[21px]">{title}</h3>
                  <p className="mt-1.5 text-[15px] text-dim">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeUp>
      </Container>
    </div>
  );
}
