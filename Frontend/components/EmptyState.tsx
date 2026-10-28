'use client';

import { KeyRound, MessagesSquare, MessageSquarePlus, QrCode, Send, ShieldCheck } from 'lucide-react';

type EmptyStateProps = {
    onNewConversation: () => void;
    /** Opens the receive/share sheet so others can find you. */
    onShareAddress?: () => void;
    /** Mobile only: how many recent chats there are, and how to open that list. */
    recentCount?: number;
    onOpenRecent?: () => void;
    /** Whether a wallet is connected; changes the copy and the call to action. */
    connected?: boolean;
};

const STEPS = [
    { icon: KeyRound, title: 'Sign', description: 'Your wallet signs an EIP-712 request.' },
    { icon: Send, title: 'Relay', description: 'A relayer submits it. No gas from you.' },
    { icon: ShieldCheck, title: 'Settle', description: 'Scarf records it on Base.' },
];

/** The glowing glass orb from the Prinet chat screen. */
function Orb() {
    return (
        <div className="relative mx-auto h-24 w-24 md:h-28 md:w-28" aria-hidden>
            <div className="assistant-glow absolute -inset-10 rounded-full blur-2xl" />
            <div className="assistant-orb relative h-full w-full rounded-full" />
        </div>
    );
}

export function EmptyState({ onNewConversation, onShareAddress, recentCount = 0, onOpenRecent, connected = false }: EmptyStateProps) {
    return (
        <div className="flex flex-1 items-center justify-center overflow-y-auto p-6 md:p-10">
            <div className="w-full max-w-3xl text-center">
                <Orb />
                <h2 className="display rise mt-10 text-[clamp(1.9rem,4vw,3rem)]">
                    {connected ? (
                        <>
                            Say it here. <span className="text-gradient">Settle it on-chain.</span>
                        </>
                    ) : (
                        <>
                            Connect a wallet. <span className="text-gradient">Start talking.</span>
                        </>
                    )}
                </h2>
                <p className="rise mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-dim" style={{ animationDelay: '0.08s' }}>
                    {connected
                        ? 'Open a chat from Recent chats, start a new one with any wallet address, or share yours so people can reach you.'
                        : 'Your address is your account, so there is nothing else to sign up for. Connect from the menu to begin.'}
                </p>
                <div className="rise mt-8 flex flex-wrap justify-center gap-3" style={{ animationDelay: '0.12s' }}>
                    {connected && recentCount > 0 && onOpenRecent && (
                        <button onClick={onOpenRecent} className="btn btn-lg btn-white">
                            <MessagesSquare size={18} strokeWidth={2} />
                            Recent chats ({recentCount})
                        </button>
                    )}
                    <button onClick={onNewConversation} className={`btn btn-lg ${connected && recentCount > 0 ? 'btn-ghost' : 'btn-white'}`}>
                        <MessageSquarePlus size={18} strokeWidth={2} />
                        New conversation
                    </button>
                    {connected && onShareAddress && (
                        <button onClick={onShareAddress} className="btn btn-lg btn-ghost">
                            <QrCode size={18} strokeWidth={1.8} />
                            Share my address
                        </button>
                    )}
                </div>

                <ol className="rise mt-10 grid gap-3 text-left sm:grid-cols-3" style={{ animationDelay: '0.16s' }}>
                    {STEPS.map(({ icon: Icon, title, description }, i) => (
                        <li key={title} className="card flex gap-3 !rounded-[22px] p-4">
                            <Icon size={18} strokeWidth={1.8} className="mt-0.5 shrink-0 text-accent" />
                            <div>
                                <p className="font-mono text-[12px] text-accent">
                                    0{i + 1} · {title}
                                </p>
                                <p className="mt-1 text-[13.5px] leading-snug text-dim">{description}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
}
