'use client';

import { Send, Paperclip, Loader2, Sparkles } from 'lucide-react';
import { useState, KeyboardEvent, useRef, useEffect } from 'react';

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
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [input]);

    const handleSend = async () => {
        if (!input.trim() || isSending || disabled) return;

        const message = input.trim();
        setInput('');
        setIsSending(true);

        try {
            await onSend(message);
        } catch (error) {
            console.error('Failed to send message:', error);
            setInput(message);
        } finally {
            setIsSending(false);
            textareaRef.current?.focus();
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="border-t border-white/5 bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-sm p-4 shadow-2xl">
            <div className="mx-auto flex max-w-4xl items-end gap-3">
                <button
                    disabled={disabled}
                    className="group relative rounded-xl border border-white/10 bg-slate-800/50 p-3 text-slate-400 transition-all duration-300 hover:border-sky-500/50 hover:bg-sky-500/10 hover:text-sky-300 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    title="Attach file"
                >
                    <Paperclip className="size-4 transition-transform group-hover:rotate-12" />
                </button>

                <div
                    className={`group relative flex-1 rounded-2xl border bg-slate-800/50 p-3 transition-all duration-300 ${isFocused
                            ? 'border-sky-500/50 bg-slate-800 shadow-lg shadow-sky-500/10'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                >
                    {isFocused && (
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-sky-500/0 via-sky-500/5 to-sky-500/0 animate-shimmer pointer-events-none" />
                    )}
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        disabled={disabled || isSending}
                        placeholder={placeholder}
                        rows={1}
                        className="relative w-full resize-none bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none transition-all duration-300"
                        style={{
                            minHeight: '24px',
                            maxHeight: '120px',
                        }}
                    />
                </div>

                <button
                    onClick={handleSend}
                    disabled={!input.trim() || isSending || disabled}
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 p-3 text-white shadow-lg shadow-sky-500/30 transition-all duration-300 hover:from-sky-400 hover:to-sky-500 hover:shadow-xl hover:shadow-sky-500/40 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    title="Send message"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    {isSending ? (
                        <Loader2 className="relative size-5 animate-spin" />
                    ) : (
                        <Send className="relative size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    )}
                </button>
            </div>
            {input.trim() && (
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 animate-in fade-in slide-in-from-bottom-2">
                    <Sparkles className="size-3 animate-pulse" />
                    <span>Press Enter to send, Shift+Enter for new line</span>
                </div>
            )}
        </div>
    );
}
