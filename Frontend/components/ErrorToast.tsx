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
            style={{
                position: 'absolute',
                top: '1rem',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.875rem 1.25rem',
                borderRadius: '0.5rem',
                background: isCancel ? 'rgba(255, 255, 255, 0.08)' : 'rgba(239, 68, 68, 0.1)',
                border: isCancel ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(239, 68, 68, 0.2)',
                backdropFilter: 'blur(10px)',
                minWidth: isCancel ? 'auto' : '20rem',
                maxWidth: '90vw',
            }}
            className="animate-slide-up"
        >
            {isCancel ? (
                <Info style={{ width: '1.25rem', height: '1.25rem', color: 'rgba(255, 255, 255, 0.6)', flexShrink: 0 }} />
            ) : (
                <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: '#f87171', flexShrink: 0 }} />
            )}
            <p style={{ fontSize: '0.875rem', color: isCancel ? 'rgba(255, 255, 255, 0.85)' : '#fca5a5', flex: 1 }}>{message}</p>
            {onDismiss && (
                <button
                    onClick={() => {
                        setIsVisible(false);
                        setTimeout(() => onDismiss(), 300);
                    }}
                    style={{
                        padding: '0.25rem',
                        borderRadius: '0.25rem',
                        background: 'transparent',
                        border: 'none',
                        color: isCancel ? 'rgba(255, 255, 255, 0.6)' : '#fca5a5',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = isCancel ? 'rgba(255, 255, 255, 0.05)' : 'rgba(239, 68, 68, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                    }}
                >
                    <X style={{ width: '1rem', height: '1rem', color: isCancel ? 'rgba(255, 255, 255, 0.6)' : '#fca5a5' }} />
                </button>
            )}
        </div>
    );
}
