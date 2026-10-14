"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";
import { buildNavLens, springTo } from "@/lib/glass";
import { APP_URL, GITHUB_URL } from "@/lib/links";
import { Icon, Logo, type IconName } from "./Icons";
import { useTheme } from "./ThemeProvider";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Home", icon: "home" },
  { href: APP_URL, label: "Chat", icon: "chat" },
  { href: "/#features", label: "Features", icon: "sparkles" },
  { href: "/#how", label: "How it works", icon: "layers" },
  { href: "/#stack", label: "Contracts", icon: "code" },
  ];

/** Routes are active by path; in-page links (with a #) never are. */
const isActive = (path: string, href: string) =>
  href.includes("#") ? false : href === "/" ? path === "/" : path.startsWith(href);

/** A glass highlight that springs to the current link, and to the hovered one. */
function useDrop(key: string, path: string) {
  const host = useRef<HTMLElement>(null);
  const drop = useRef<HTMLSpanElement>(null);
  const placed = useRef(false);

  const go = (a: HTMLElement | null | undefined, snap = false) => {
    const d = drop.current;
    if (!d) return;
    if (!a || !a.offsetWidth) {
      d.style.opacity = "0";
      return;
    }
    d.style.opacity = "1";
    springTo(key, d, a.offsetLeft, a.offsetWidth, snap || !placed.current);
    placed.current = true;
  };
  const current = () => host.current?.querySelector<HTMLElement>('a[aria-current="page"]');

  useLayoutEffect(() => {
    go(current());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);
  useEffect(() => {
    const ro = new ResizeObserver(() => go(current(), true));
    if (host.current) ro.observe(host.current);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    host,
    drop,
    enter: (e: React.PointerEvent<HTMLElement>) => e.pointerType === "mouse" && go(e.currentTarget),
    leave: () => go(current()),
  };
}

function ThemeButton() {
  const { theme, toggle } = useTheme();
  const light = theme === "light";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
      className="grid h-10 w-10 place-items-center rounded-full text-mute transition-colors hover:text-fg"
    >
      <Icon name={light ? "moon" : "sun"} size={18} />
    </button>
  );
}

/** Desktop: a floating liquid-glass bar across the top. Phones and tablets: a slim glass top bar. */
export function Header() {
  const path = usePathname() ?? "/";
  const drop = useDrop("nav", path);
  const inApp = path.startsWith(APP_URL);

  // Rebuild the refraction map once the layout has settled.
  useEffect(() => {
    const t = setTimeout(buildNavLens, 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <header className="topnav nav lgx" id="nav">
        <Link
          href="/"
          aria-label="WhisperChain home"
          className="shrink-0 transition-transform duration-700 [transition-timing-function:var(--ease-spring)] hover:scale-105"
        >
          <Logo size={34} wordmark={false} />
        </Link>
        <nav className="nav-links" aria-label="Main" ref={drop.host} onPointerLeave={drop.leave}>
          <span className="drop" ref={drop.drop} aria-hidden />
          {NAV.map((n) => {
            const active = isActive(path, n.href);
            return (
              <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined} onPointerEnter={drop.enter}>
                <Icon name={n.icon} size={17} stroke={active ? 2.1 : 1.8} />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex shrink-0 items-center gap-1.5">
          <ThemeButton />
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="btn btn-sm btn-ghost !h-10">
            <Icon name="github" size={15} />
            GitHub
          </a>
          {!inApp && (
            <Link href={APP_URL} className="btn btn-sm btn-accent !h-10">
              <Icon name="send" size={15} stroke={2} />
              Launch app
            </Link>
          )}
        </div>
      </header>

      <header className="topbar lgx">
        <Link href="/" className="shrink-0" aria-label="WhisperChain home">
          <Logo size={30} wordmark={false} />
        </Link>
        <div className="ml-auto flex items-center gap-1">
          <ThemeButton />
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="btn btn-sm btn-ghost !h-10" aria-label="GitHub">
            <Icon name="github" size={15} />
          </a>
        </div>
      </header>
    </>
  );
}

/** Floating glass tab bar on phones and tablets, with Chat in the middle. */
export function TabBar() {
  const path = usePathname() ?? "/";
  const drop = useDrop("tab", path);
  const tab = (href: string, label: string, icon: IconName) => {
    const active = isActive(path, href);
    return (
      <Link href={href} aria-current={active ? "page" : undefined}>
        <Icon name={icon} size={20} stroke={active ? 2.1 : 1.8} />
        {label}
      </Link>
    );
  };

  return (
    <nav className="tabbar lgx" id="tabbar" aria-label="Main" ref={drop.host}>
      <span className="drop" ref={drop.drop} aria-hidden />
      {tab("/", "Home", "home")}
      {tab("/#features", "Features", "sparkles")}
      <Link
        href={APP_URL}
        aria-label="Chat"
        aria-current={path.startsWith(APP_URL) ? "page" : undefined}
        className="mx-1 !grid h-[52px] w-[52px] !flex-none place-items-center !rounded-[20px] !p-0 !text-[var(--accent-ink)]"
        style={{ background: "var(--g-accent)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.5), 0 10px 24px -10px rgba(150,200,40,.6)" }}
      >
        <Icon name="chat" size={22} stroke={2} />
      </Link>
      {tab("/#stack", "Contracts", "code")}
      {tab("/#faq", "FAQ", "book")}
    </nav>
  );
}
