"use client";

import { useRouter } from "next/navigation";
import type { PointerEventHandler, ReactNode } from "react";

type ScrollLinkProps = {
  to: string;
  className?: string;
  onClick?: () => void;
  onPointerEnter?: PointerEventHandler<HTMLAnchorElement>;
  children: ReactNode;
};

const SCROLL_DURATION = 600;

const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

let frame = 0;

/** Animates the window to the top of `#id` over 600ms with easeInOutQuad. Returns false if there's no such section here. */
export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return false;
  cancelAnimationFrame(frame);
  const start = window.scrollY;
  const distance = el.getBoundingClientRect().top;
  const startTime = performance.now();
  const step = (now: number) => {
    const progress = Math.min((now - startTime) / SCROLL_DURATION, 1);
    window.scrollTo(0, start + distance * easeInOutQuad(progress));
    if (progress < 1) frame = requestAnimationFrame(step);
  };
  frame = requestAnimationFrame(step);
  return true;
}

/** Link to a home-page section: smooth-scrolls when the section is on this page, otherwise goes to the home page at it. */
export function ScrollLink({ to, className, onClick, onPointerEnter, children }: ScrollLinkProps) {
  const router = useRouter();
  return (
    <a
      href={`/#${to}`}
      className={className}
      onPointerEnter={onPointerEnter}
      onClick={(e) => {
        e.preventDefault();
        if (!scrollToSection(to)) router.push(`/#${to}`);
        onClick?.();
      }}
    >
      {children}
    </a>
  );
}
