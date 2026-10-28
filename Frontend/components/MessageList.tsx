'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { Check, Copy, Loader2, Lock, Trash2, Users } from 'lucide-react';
import {
    deleteChatMessage,
    deleteChatMessageGasless,
    submitSignedForwardRequest,
    waitForTransaction,
} from '@/lib/scarfActions';
import { isGaslessConfigured } from '@/lib/gasless';
import { getErrorMessage, isUserRejectedError } from '@/lib/errors';
import type { ChatMessage, Thread } from '@/lib/inbox';
import { MessageBubble } from './MessageBubble';
import { AddressAvatar } from './AddressAvatar';
import { useCopy } from './CopyAddress';

type MessageListProps = {
    messages: ChatMessage[];
    thread?: Thread;
    isLoading?: boolean;
    connectedAddress?: string;
    /** Called with the id of a message the user deleted. */
    onDeleted?: (messageId: string) => void;
    onError?: (message: string) => void;
};

const dayLabel = (unix: number) => {
    const d = new Date(unix * 1000);
    if (isToday(d)) return 'Today';
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'EEEE, d MMMM yyyy');
};

export function MessageList({ messages, thread, isLoading, connectedAddress, onDeleted, onError }: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null);
    const firstScroll = useRef(true);
    const isGroup = thread?.kind === 'group';
    const me = connectedAddress?.toLowerCase();
    const peer = thread?.kind === 'direct' ? thread.participants.find((p) => p.toLowerCase() !== me) : undefined;

    // Open at the newest message; afterwards glide down when one arrives.
    const lastId = messages.at(-1)?.id;
    useLayoutEffect(() => {
        if (!lastId) return;
        bottomRef.current?.scrollIntoView({ block: 'end', behavior: firstScroll.current ? 'auto' : 'smooth' });
        firstScroll.current = false;
    }, [lastId]);

    if (isLoading && messages.length === 0) {
        return (
            <div className="flex h-full min-h-[12rem] items-center justify-center">
                <div className="text-center">
                    <span className="mx-auto mb-5 block h-9 w-9 animate-spin rounded-full border-2 border-accent/20 border-t-accent" />
                    <p className="label">Loading messages</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-full px-3 py-6 md:px-6">
            <div className="mx-auto max-w-[48rem] pb-4">
                {/* Who this conversation is with, at the very top. */}
                <div className="mb-8 flex flex-col items-center text-center">
                    {peer ? (
                        <AddressAvatar address={peer} className="h-14 w-14 text-[16px]" />
                    ) : (
                        <span className="avatar is-on h-14 w-14">
                            <Users size={22} strokeWidth={1.8} />
                        </span>
                    )}
                    <p className="mt-3 text-[15px] font-semibold">
                        {peer ? (
                            <span className="break-all font-mono">{peer}</span>
                        ) : (
                            `Group with ${(thread?.participants.length ?? 1) - 1} others`
                        )}
                    </p>
                    <p className="mt-1 max-w-[26rem] text-[12.5px] leading-relaxed text-mute">
                        {messages.length === 0
                            ? peer
                                ? 'This is the start of your conversation. Say hello.'
                                : 'This is the start of the group. Say hello to everyone.'
                            : peer
                              ? 'The start of your conversation with this address.'
                              : 'The start of this group.'}
                    </p>
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] text-mute">
                        <Lock size={11} strokeWidth={1.8} />
                        Messages are stored on-chain and are publicly readable.
                    </p>
                </div>

                {messages.map((message, index) => {
                    const prev = index > 0 ? messages[index - 1] : null;
                    const newDay = !prev || !isSameDay(new Date(prev.timestamp * 1000), new Date(message.timestamp * 1000));
                    const isGrouped =
                        !newDay &&
                        prev !== null &&
                        prev.sender.toLowerCase() === message.sender.toLowerCase() &&
                        message.timestamp - prev.timestamp < 300;

                    return (
                        <div key={message.id} data-message-id={message.messageId}>
                            {newDay && (
                                <div className="my-5 flex items-center gap-3" role="separator">
                                    <span className="h-px flex-1 bg-line" />
                                    <span className="label text-[10px]!">{dayLabel(message.timestamp)}</span>
                                    <span className="h-px flex-1 bg-line" />
                                </div>
                            )}
                            <MessageBubble
                                message={message}
                                index={index}
                                showAvatar={!isGrouped}
                                isGrouped={isGrouped}
                                showAuthor={isGroup}
                                actions={
                                    message.status === 'pending' ? null : (
                                        <MessageMenu message={message} onDeleted={onDeleted} onError={onError} />
                                    )
                                }
                            />
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}

/** Copy, and delete for your own messages. Shown on hover (always on touch screens). */
function MessageMenu({
    message,
    onDeleted,
    onError,
}: {
    message: ChatMessage;
    onDeleted?: (id: string) => void;
    onError?: (message: string) => void;
}) {
    const { copied, copy } = useCopy();
    const [deleting, setDeleting] = useState(false);
    const [confirming, setConfirming] = useState(false);

    useEffect(() => {
        if (!confirming) return;
        const t = setTimeout(() => setConfirming(false), 3000);
        return () => clearTimeout(t);
    }, [confirming]);

    const remove = async () => {
        if (!confirming) {
            setConfirming(true);
            return;
        }
        setDeleting(true);
        try {
            if (isGaslessConfigured()) {
                const { request, signature } = await deleteChatMessageGasless(message.messageId);
                await submitSignedForwardRequest(request, signature);
            } else {
                await waitForTransaction(Promise.resolve(await deleteChatMessage(message.messageId)));
            }
            onDeleted?.(message.messageId);
        } catch (err) {
            if (!isUserRejectedError(err)) onError?.(getErrorMessage(err, 'Failed to delete message'));
        } finally {
            setDeleting(false);
            setConfirming(false);
        }
    };

    const btn =
        'grid h-7 place-items-center rounded-full px-2 text-mute transition-colors hover:bg-[color-mix(in_srgb,var(--fg)_8%,transparent)] hover:text-fg';

    return (
        <div className="flex items-center gap-0.5">
            {message.body && (
                <button onClick={() => copy(message.body)} className={btn} title={copied ? 'Copied' : 'Copy text'} aria-label="Copy message text">
                    {copied ? <Check size={13} className="text-good" /> : <Copy size={13} strokeWidth={1.8} />}
                </button>
            )}
            {message.isSelf && (
                <button
                    onClick={remove}
                    disabled={deleting}
                    className={`${btn} ${confirming ? 'text-bad! gap-1 text-[11px]' : ''}`}
                    title="Delete (hides it in Scarf; the chain keeps its history)"
                    aria-label={confirming ? 'Confirm delete' : 'Delete message'}
                >
                    {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} strokeWidth={1.8} />}
                    {confirming && !deleting && <span>Delete?</span>}
                </button>
            )}
        </div>
    );
}
