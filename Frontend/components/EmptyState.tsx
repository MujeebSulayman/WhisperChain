'use client';

import { KeyRound, MessageSquarePlus, Send, ShieldCheck } from 'lucide-react';

type EmptyStateProps = {
    onNewConversation: () => void;
    /** Whether a wallet is connected; changes the copy and the call to action. */
    connected?: boolean;
};

const STEPS = [
    { icon: KeyRound, title: 'Sign', description: 'Your wallet signs an EIP-712 request.' },
    { icon: Send, title: 'Relay', description: 'A relayer submits it. No gas from you.' },
    { icon: ShieldCheck, title: 'Settle', description: 'WhisperChain records it on Base.' },
];

export function EmptyState({ onNewConversation, connected = false }: EmptyStateProps) {
    return (
        <div className="flex flex-1 items-center justify-center overflow-y-auto p-6 md:p-10">
            <div className="rise w-full max-w-[560px] text-center">
                <span className="tile is-on mx-auto h-16 w-16 rounded-[var(--r-card)]">
                    <MessageSquarePlus size={26} strokeWidth={1.8} />
                </span>
                <p className="eyebrow mt-8">{connected ? 'Ready when you are' : 'Wallet not connected'}</p>
                <h2 className="display mt-3 text-[clamp(28px,3.4vw,40px)]">
                    {connected ? 'Start a conversation.' : 'Connect to start messaging.'}
                </h2>
                <p className="mx-auto mt-4 max-w-[44ch] text-[15px] leading-relaxed text-dim">
                    {connected
                        ? 'Pick a conversation on the right, or open a new one with any registered wallet address.'
                        : 'Connect your wallet from the menu. Your address is your account, so there is nothing else to sign up for.'}
                </p>
                <button onClick={onNewConversation} className="btn btn-lg btn-white mt-8">
                    <MessageSquarePlus size={18} strokeWidth={2} />
                    New conversation
                </button>

                <ol className="mt-12 grid gap-px overflow-hidden rounded-[var(--r-card)] text-left sm:grid-cols-3">
                    {STEPS.map(({ icon: Icon, title, description }, i) => (
                        <li key={title} className="inset-panel flex gap-3 p-4">
                            <Icon size={18} strokeWidth={1.8} className="mt-0.5 shrink-0 text-accent" />
                            <div>
                                <p className="font-mono text-[12px] text-accent">
                                    0{i + 1} · {title}
                                </p>
                                <p className="mt-1 text-[13px] leading-snug text-dim">{description}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
}
