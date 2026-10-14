'use client';

import { AlertCircle, X, Info } from 'lucide-react';
import { useState, useEffect } from 'react';

type ErrorToastProps = {
    message: string;
    onDismiss?: () => void;
    autoHide?: boolean;
    autoHideDelay?: number;
    variant?: 'error' | 'cancel';
};

export function ErrorToast({
    message,
    onDismiss,
    autoHide = true,
    autoHideDelay = 5000,
    variant = 'error',
}: ErrorToastProps) {
    const [isVisible, setIsVisible] = useState(true);
    const isCancel = variant === 'cancel';

    useEffect(() => {
        if (autoHide) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(() => onDismiss?.(), 300);
            }, autoHideDelay);
            return () => clearTimeout(timer);
        }
    }, [autoHide, autoHideDelay, onDismiss]);

    if (!isVisible) return null;

    return (
        <div
            role="alert"
            className="lgx rise absolute left-1/2 top-4 z-50 flex max-w-[90%] -translate-x-1/2 items-center gap-3 rounded-full py-2 pl-4 pr-2"
        >
            {isCancel ? (
                <Info size={18} strokeWidth={1.8} className="shrink-0 text-dim" />
            ) : (
                <AlertCircle size={18} strokeWidth={1.8} className="shrink-0 text-bad" />
            )}
            <p className={`flex-1 text-[14px] ${isCancel ? 'text-dim' : 'text-fg'}`}>{message}</p>
            {onDismiss && (
                <button
                    onClick={() => {
                        setIsVisible(false);
                        setTimeout(() => onDismiss(), 300);
                    }}
                    className="icon-btn h-8! w-8!"
                    aria-label="Dismiss"
                >
                    <X size={15} strokeWidth={2} />
                </button>
            )}
        </div>
    );
}
