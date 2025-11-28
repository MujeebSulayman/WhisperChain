'use client';

import { AlertCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

type ErrorToastProps = {
    message: string;
    onDismiss?: () => void;
    autoHide?: boolean;
    autoHideDelay?: number;
};

export function ErrorToast({
    message,
    onDismiss,
    autoHide = true,
    autoHideDelay = 5000,
}: ErrorToastProps) {
    const [isVisible, setIsVisible] = useState(true);

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
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                backdropFilter: 'blur(10px)',
                minWidth: '20rem',
                maxWidth: '90vw',
            }}
            className="animate-slide-up"
        >
            <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: '#f87171', flexShrink: 0 }} />
            <p style={{ fontSize: '0.875rem', color: '#fca5a5', flex: 1 }}>{message}</p>
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
                        color: '#fca5a5',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                    }}
                >
                    <X style={{ width: '1rem', height: '1rem' }} />
                </button>
            )}
        </div>
    );
}
