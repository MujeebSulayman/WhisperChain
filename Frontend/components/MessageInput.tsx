'use client';

import { Send, Paperclip, Loader2 } from 'lucide-react';
import { useState, KeyboardEvent } from 'react';

type MessageInputProps = {
    onSend: (message: string) => Promise<void>;
    disabled?: boolean;
    placeholder?: string;
};

export function MessageInput({
    onSend,
    disabled = false,
    placeholder = 'Type a message...',
}: MessageInputProps) {
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSend = async () => {
        if (!input.trim() || isSending || disabled) return;

        const message = input.trim();
        setInput('');
        setIsSending(true);

        try {
            await onSend(message);
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="border-t border-white/5 bg-slate-900/60 p-4">
            <div className="mx-auto flex max-w-4xl items-end gap-3">
                <button
                    disabled={disabled}
                    className="rounded-xl border border-white/10 bg-slate-800/50 p-3 text-slate-400 transition hover:bg-slate-800 hover:text-slate-300 disabled:opacity-50"
                    title="Attach file"
                >
                    <Paperclip className="size-4" />
                </button>

                <div className="flex-1 rounded-2xl border border-white/10 bg-slate-800/50 p-3 focus-within:border-sky-500/50 focus-within:bg-slate-800">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={disabled || isSending}
                        placeholder={placeholder}
                        rows={1}
                        className="w-full resize-none bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                        style={{
                            minHeight: '24px',
                            maxHeight: '120px',
                        }}
                    />
                </div>

                <button
                    onClick={handleSend}
                    disabled={!input.trim() || isSending || disabled}
                    className="rounded-xl bg-sky-500 p-3 text-white transition hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Send message"
                >
                    {isSending ? (
                        <Loader2 className="size-5 animate-spin" />
                    ) : (
                        <Send className="size-5" />
                    )}
                </button>
            </div>
        </div>
    );
}

