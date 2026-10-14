"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { DOCS, DOC_GROUPS, docHref } from "@/lib/docs";
import { Icon } from "../site/Icons";

function Links({ path, onPick }: { path: string; onPick?: () => void }) {
  return (
    <div className="grid gap-7">
      {DOC_GROUPS.map((group) => (
        <div key={group}>
          <p className="label">{group}</p>
          <ul className="mt-3 grid gap-0.5 border-l border-line">
            {DOCS.filter((d) => d.group === group).map((d) => {
              const href = docHref(d.slug);
              const active = path === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onPick}
                    aria-current={active ? "page" : undefined}
                    className={`-ml-px block border-l-2 py-1.5 pl-4 text-[14.5px] transition-colors ${
                      active ? "border-accent font-medium text-fg" : "border-transparent text-dim hover:border-line2 hover:text-fg"
                    }`}
                  >
                    {d.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** Sticky section list on desktop; a collapsible menu on phones and tablets. */
export function DocsSidebar() {
  const path = usePathname() ?? "/docs";
  const menu = useRef<HTMLDetailsElement>(null);
  const current = DOCS.find((d) => docHref(d.slug) === path);

  useEffect(() => {
    if (menu.current) menu.current.open = false;
  }, [path]);

  return (
    <>
      <nav aria-label="Docs" className="hidden lg:block">
        <div className="sticky top-[calc(var(--bar-h)+32px)] max-h-[calc(100vh-var(--bar-h)-64px)] overflow-y-auto pb-10 pr-2">
          <Links path={path} />
        </div>
      </nav>

      <details ref={menu} className="sheet group !rounded-[20px] lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
          <span className="min-w-0">
            <span className="label block">Docs</span>
            <span className="mt-1 block truncate font-medium text-fg">{current?.title ?? "Docs"}</span>
          </span>
          <Icon name="chevronDown" size={18} className="shrink-0 text-mute transition-transform group-open:rotate-180" />
        </summary>
        <div className="border-t border-line px-5 py-5">
          <Links path={path} />
        </div>
      </details>
    </>
  );
}
