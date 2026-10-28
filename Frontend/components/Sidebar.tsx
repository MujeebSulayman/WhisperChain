'use client';

import { MessageSquarePlus, Settings, Send, PanelLeftClose, PanelLeftOpen, Coins, Wallet } from 'lucide-react';
import { WalletConnect } from './WalletConnect';
import { UserStats } from './UserStats';
import { StorageManagement } from './StorageManagement';
import type { WalletBalance } from '@/hooks/useWalletBalance';
import type { WalletTab } from './WalletHub';

type SidebarProps = {
    isOpen: boolean;
    onToggle: () => void;
    connectedAddress?: string;
    onConnect: () => void | Promise<void>;
    balance?: WalletBalance;
    onOpenWallet?: (tab: WalletTab) => void;
    profile?: {
        publicKey?: string;
        lastSeen?: bigint;
    };
    onNewChat: () => void;
    onBatchSend: () => void;
    onSettings: () => void;
    onPaymentHistory: () => void;
    isMobile?: boolean;
};

export function Sidebar({
    isOpen,
    onToggle,
    connectedAddress,
    onConnect,
    balance,
    onOpenWallet,
    profile,
    onNewChat,
    onBatchSend,
    onSettings,
    onPaymentHistory,
    isMobile = false,
}: SidebarProps) {
    if (isMobile && !isOpen) return null;

    // No names in Scarf: the avatar is the first two hex characters of the address.
    const initial = connectedAddress ? connectedAddress.slice(2, 4).toUpperCase() : '';
    const shortAddress = connectedAddress ? `${connectedAddress.slice(0, 6)}…${connectedAddress.slice(-4)}` : '';

    const frame = isMobile
        ? 'sheet fixed inset-y-3 left-3 z-[60] w-[18rem] max-w-[calc(100vw-1.5rem)] rise'
        : `relative shrink-0 transition-[width] duration-300 [transition-timing-function:var(--ease-out)] ${isOpen ? 'w-[18rem]' : 'w-[4.5rem]'}`;

    if (!isOpen) {
        // Collapsed rail (desktop only): the mark and one pebble per action.
        return (
            <aside className={`glass flex flex-col items-center gap-2 rounded-[var(--r-card)] py-4 ${frame}`}>
                <button onClick={onToggle} className="icon-btn" aria-label="Expand menu" title="Expand menu">
                    <PanelLeftOpen size={18} strokeWidth={1.8} />
                </button>
                <span className="my-2 h-px w-8 bg-line" />
                <button onClick={onNewChat} className="tile is-on h-10 w-10 rounded-full" title="New conversation" aria-label="New conversation">
                    <MessageSquarePlus size={18} strokeWidth={1.8} />
                </button>
                <button onClick={onBatchSend} className="icon-btn" title="Batch send" aria-label="Batch send">
                    <Send size={18} strokeWidth={1.8} />
                </button>
                <button onClick={onPaymentHistory} className="icon-btn" title="Payment history" aria-label="Payment history">
                    <Coins size={18} strokeWidth={1.8} />
                </button>
                {connectedAddress && onOpenWallet && (
                    <button onClick={() => onOpenWallet('receive')} className="icon-btn" title="Wallet" aria-label="Open wallet">
                        <Wallet size={18} strokeWidth={1.8} />
                    </button>
                )}
                {profile && connectedAddress && (
                    <div className="mt-auto flex flex-col items-center gap-2">
                        <button onClick={onSettings} className="icon-btn" title="Settings" aria-label="Settings">
                            <Settings size={18} strokeWidth={1.8} />
                        </button>
                        <button onClick={onToggle} className="avatar is-on h-10 w-10" title={shortAddress}>
                            {initial}
                        </button>
                    </div>
                )}
            </aside>
        );
    }

    return (
        <aside className={`${isMobile ? '' : 'glass'} flex flex-col overflow-hidden rounded-[var(--r-card)] ${frame}`}>
            {/* Brand and collapse */}
            <div className="flex items-center justify-between gap-2 px-4 pb-3 pt-4">
                <div>
                    <p className="label">Account</p>
                    <h2 className="mt-1 font-display text-[22px] font-medium">Your wallet</h2>
                </div>
                <button onClick={onToggle} className="icon-btn" aria-label={isMobile ? 'Close menu' : 'Collapse menu'}>
                    <PanelLeftClose size={18} strokeWidth={1.8} />
                </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-3 pb-4">
                <WalletConnect
                    connectedAddress={connectedAddress}
                    onConnect={onConnect}
                    balance={balance}
                    onOpenWallet={onOpenWallet && (() => onOpenWallet('receive'))}
                />

                <nav aria-label="Actions" className="grid gap-1">
                    <button onClick={onNewChat} className="btn btn-white mb-2 w-full">
                        <MessageSquarePlus size={17} strokeWidth={2} />
                        New conversation
                    </button>
                    <button onClick={onBatchSend} className="row">
                        <Send size={17} strokeWidth={1.8} className="text-accent" />
                        <span className="text-[14px] font-medium">Batch send</span>
                    </button>
                    <button onClick={onPaymentHistory} className="row">
                        <Coins size={17} strokeWidth={1.8} className="text-accent" />
                        <span className="text-[14px] font-medium">Payment history</span>
                    </button>
                    {profile && connectedAddress && (
                        <button onClick={onSettings} className="row">
                            <Settings size={17} strokeWidth={1.8} className="text-accent" />
                            <span className="text-[14px] font-medium">Settings</span>
                        </button>
                    )}
                </nav>

                {connectedAddress && (
                    <section className="grid gap-3">
                        <p className="label px-1">Activity</p>
                        <UserStats userAddress={connectedAddress} />
                        <StorageManagement userAddress={connectedAddress} onUpdate={() => { }} />
                    </section>
                )}
            </div>
        </aside>
    );
}
