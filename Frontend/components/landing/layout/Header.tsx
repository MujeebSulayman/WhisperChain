"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Logo } from "@/components/landing/icons";
import { Icon } from "@/components/landing/ui/Icon";
import { ScrollLink } from "@/components/landing/ui/ScrollLink";
import { springTo } from "@/lib/glass";
import { APP_URL, GITHUB_URL } from "@/lib/links";

const NAV_ITEMS = [
  { title: "Home", to: "banner" },
  { title: "Why WhisperChain", to: "features" },
  { title: "How it works", to: "howit" },
  { title: "Contracts", to: "contracts" },
  { title: "GitHub", to: GITHUB_URL },
];

/** Home-page sections are plain ids; routes start with "/", external links with "http". */
const isSection = (to: string) => !to.startsWith("/") && !to.startsWith("http");
const SECTION_IDS = NAV_ITEMS.filter((item) => isSection(item.to)).map((item) => item.to);

/** A glass highlight that springs to the active link, and to the hovered one. */
function useDrop(activeId: string | null) {
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
    springTo("nav", d, a.offsetLeft, a.offsetWidth, snap || !placed.current);
    placed.current = true;
  };
  const current = () => host.current?.querySelector<HTMLElement>("a.active");

  useLayoutEffect(() => {
    go(current());
  }, [activeId]);
  useEffect(() => {
    const ro = new ResizeObserver(() => go(current(), true));
    if (host.current) ro.observe(host.current);
    return () => ro.disconnect();
  }, []);

  return {
    host,
    drop,
    enter: (e: React.PointerEvent<HTMLElement>) => e.pointerType === "mouse" && go(e.currentTarget),
    leave: () => go(current()),
  };
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const [sectionId, setActiveId] = useState<string | null>(null);
  const path = usePathname() ?? "/";
  // On a route its nav link is active; on the home page, the section in view.
  const activeId = NAV_ITEMS.find((item) => item.to.startsWith("/") && path.startsWith(item.to))?.to ?? sectionId;
  const { host: navRef, drop: dropRef, enter: dropEnter, leave: dropLeave } = useDrop(activeId);

  useEffect(() => {
    const onScroll = () => {
      setIsFixed(window.scrollY > 200);
      // Like react-scroll's spy: a link is active only while the viewport top is inside its section.
      const y = window.scrollY;
      const current = SECTION_IDS.find((id) => {
        const rect = document.getElementById(id)?.getBoundingClientRect();
        if (!rect) return false;
        const top = rect.top + y;
        return y >= Math.floor(top) && y < Math.floor(top + rect.height);
      });
      setActiveId(current ?? null);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", menuOpen);
  }, [menuOpen]);

  const toggleMenu = () => setMenuOpen((open) => !open);
  const closeOnMobile = () => {
    if (window.innerWidth <= 991) setMenuOpen(false);
  };

  return (
    <>
      <header className={`heading ${isFixed ? "position-fixed" : ""}`}>
        <div className="heading-wrap lgx nav" id="nav">
          <ScrollLink
            to="banner"
            className="logo block shrink-0 transition-transform duration-700 [transition-timing-function:var(--ease-spring)] hover:scale-105"
            onClick={closeOnMobile}
          >
            <Logo size={22} />
          </ScrollLink>

          <nav className="nav-links" aria-label="Main" ref={navRef} onPointerLeave={dropLeave}>
            <span className="drop" ref={dropRef} aria-hidden />
            {NAV_ITEMS.map((item) =>
              item.to.startsWith("/") ? (
                <Link
                  key={item.to}
                  href={item.to}
                  className={activeId === item.to ? "active" : ""}
                  onClick={closeOnMobile}
                  onPointerEnter={dropEnter}
                >
                  {item.title}
                </Link>
              ) : item.to.startsWith("http") ? (
                <a key={item.to} href={item.to} target="_blank" rel="noopener noreferrer" onPointerEnter={dropEnter}>
                  {item.title}
                  <Icon name="arrowUpRight" size={13} className="opacity-60" />
                </a>
              ) : (
                <ScrollLink
                  key={item.to}
                  to={item.to}
                  className={activeId === item.to ? "active" : ""}
                  onClick={closeOnMobile}
                  onPointerEnter={dropEnter}
                >
                  {item.title}
                </ScrollLink>
              ),
            )}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 lg:ml-0">
            <Link href={APP_URL} className="btn btn-sm btn-accent h-11! lg:px-5!">
              <Icon name="send" size={16} stroke={2} />
              Launch app
            </Link>
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-full text-dim transition-colors hover:text-fg lg:hidden!"
              onClick={toggleMenu}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <Icon name={menuOpen ? "x" : "menu"} size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Outside the header: its transform and backdrop-filter would trap this fixed sheet. */}
      <nav className={`heading-menu ${menuOpen ? "show-menu" : ""}`} aria-label="Mobile" aria-hidden={!menuOpen}>
        <ul className="grid gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              {item.to.startsWith("/") ? (
                <Link href={item.to} className={activeId === item.to ? "active" : ""} onClick={() => setMenuOpen(false)}>
                  {item.title}
                  <Icon name="arrowRight" size={20} className="text-mute" />
                </Link>
              ) : item.to.startsWith("http") ? (
                <a href={item.to} target="_blank" rel="noopener noreferrer">
                  {item.title}
                  <Icon name="arrowUpRight" size={20} className="text-mute" />
                </a>
              ) : (
                <ScrollLink to={item.to} className={activeId === item.to ? "active" : ""} onClick={closeOnMobile}>
                  {item.title}
                  <Icon name="arrowRight" size={20} className="text-mute" />
                </ScrollLink>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
