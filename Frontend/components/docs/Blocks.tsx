import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "../site/Icons";
import { CopyButton } from "./CopyButton";

/** Building blocks for docs pages. */

export function H2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="group mt-14 scroll-mt-24 font-sans text-[1.45rem] font-semibold tracking-[-0.02em] text-fg first:mt-0 md:text-[1.65rem]">
      <a href={`#${id}`} className="flex items-center gap-2">
        {children}
        <span className="text-[0.8em] text-mute opacity-0 transition-opacity group-hover:opacity-100">#</span>
      </a>
    </h2>
  );
}

export function H3({ children }: { children: ReactNode }) {
  return <h3 className="mt-8 text-[1.1rem] font-semibold tracking-[-0.01em] text-fg">{children}</h3>;
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-[16px] leading-[1.75] text-fg/85">{children}</p>;
}

export function A({ href, children }: { href: string; children: ReactNode }) {
  const external = href.startsWith("http");
  const cls = "text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent";
  return external ? (
    <a href={href} target="_blank" rel="noreferrer" className={cls}>
      {children}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export function List({ items }: { items: ReactNode[] }) {
  return (
    <ul className="mt-4 grid gap-2.5 text-[16px] leading-[1.7] text-fg/85">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-[2px] bg-accent" />
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Numbered steps joined by a vertical line. */
export function Steps({ items }: { items: { title: string; body: ReactNode }[] }) {
  return (
    <ol className="mt-6 grid">
      {items.map((s, i) => (
        <li key={s.title} className="relative flex gap-5 pb-7 last:pb-0">
          {i < items.length - 1 && <span aria-hidden className="absolute bottom-0 left-[15px] top-9 w-px bg-line2" />}
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent font-mono text-[13px] font-semibold text-[var(--accent-ink)]">
            {i + 1}
          </span>
          <div className="min-w-0 pt-1">
            <p className="font-semibold tracking-[-0.01em] text-fg">{s.title}</p>
            <div className="mt-1.5 text-[15px] leading-relaxed text-dim">{s.body}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function Code({ children, label }: { children: string; label?: string }) {
  return (
    <div className="inset-panel mt-5 overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute">{label ?? "Code"}</span>
        <CopyButton text={children} />
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-fg/85">
        <code>{children}</code>
      </pre>
    </div>
  );
}

export function C({ children }: { children: ReactNode }) {
  return <code className="rounded-md bg-fg/[.07] px-1.5 py-0.5 font-mono text-[0.86em]">{children}</code>;
}

export function Callout({ tone = "note", title, children }: { tone?: "note" | "warn"; title: string; children: ReactNode }) {
  const warn = tone === "warn";
  return (
    <aside className={`mt-6 flex gap-3 rounded-[18px] border p-5 ${warn ? "border-warn/30 bg-warn/[.06]" : "border-accent/25 bg-accent/[.05]"}`}>
      <Icon name={warn ? "shield" : "sparkles"} size={18} className={`mt-0.5 shrink-0 ${warn ? "text-warn" : "text-accent"}`} />
      <div className="min-w-0">
        <p className={`text-[14px] font-semibold ${warn ? "text-warn" : "text-accent"}`}>{title}</p>
        <div className="mt-1.5 text-[15px] leading-relaxed text-dim">{children}</div>
      </div>
    </aside>
  );
}

export function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-[18px] border border-line">
      <table className="w-full min-w-[520px] border-collapse text-left text-[14.5px]">
        <thead>
          <tr className="bg-fg/[.03]">
            {head.map((h) => (
              <th key={h} className="label border-b border-line px-4 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-line last:border-0">
              {row.map((cell, j) => (
                <td key={j} className={`px-4 py-3 align-top ${j === 0 ? "font-medium text-fg" : "text-dim"}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** A grid of links to other docs pages. */
export function Cards({ items }: { items: { href: string; title: string; body: string }[] }) {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      {items.map((c) => (
        <Link key={c.href} href={c.href} className="card group !rounded-[20px] p-5 transition-colors hover:bg-fg/[.04]">
          <span className="flex items-center justify-between gap-2 font-semibold text-fg">
            {c.title}
            <Icon name="arrowRight" size={15} className="text-mute transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
          </span>
          <span className="mt-1.5 block text-[14px] leading-relaxed text-dim">{c.body}</span>
        </Link>
      ))}
    </div>
  );
}
