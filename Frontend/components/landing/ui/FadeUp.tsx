"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type FadeUpProps = {
  as?: "div" | "h1" | "h2" | "p" | "article";
  delay?: number;
  className?: string;
  children?: ReactNode;
};

/** Fades its content in with a short rise, once, the first time it scrolls into view. Use one per section. */
export function FadeUp({ as = "div", delay = 0, className, children }: FadeUpProps) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial={{ y: 16, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.6, 0.2, 1], delay }}
      viewport={{ once: true, amount: 0.15 }}
    >
      {children}
    </Component>
  );
}
