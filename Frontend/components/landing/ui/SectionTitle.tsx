import type { ReactNode } from "react";
import { FadeUp } from "./FadeUp";

type SectionTitleProps = {
  /** Mono kicker above the heading. */
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
  /** Content shown on the right of the heading on wide screens (e.g. a link). */
  aside?: ReactNode;
};

/** A section heading: kicker, statement, and an optional line of copy. */
export function SectionTitle({ eyebrow, title, description, className = "mb-10 lg:mb-12", aside }: SectionTitleProps) {
  return (
    <FadeUp className={`flex flex-wrap items-end justify-between gap-6 ${className}`}>
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="h2 mt-3 max-w-[760px]">{title}</h2>
        {description ? <p className="mt-4 max-w-[60ch] text-[17px] leading-relaxed text-dim">{description}</p> : null}
      </div>
      {aside}
    </FadeUp>
  );
}
