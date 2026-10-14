import Link from "next/link";
import { type DocPage, docHref, neighbours } from "@/lib/docs";
import { Icon } from "../site/Icons";

/** One docs page: breadcrumb and title, the body, previous/next links, and an "On this page" list on wide screens. */
export function DocView({ doc }: { doc: DocPage }) {
  const { prev, next } = neighbours(doc.slug);

  return (
    <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_200px]">
      <article className="min-w-0 max-w-[740px]">
        <header>
          <p className="flex items-center gap-2 font-mono text-[12px] text-mute">
            <Link href="/docs" className="hover:text-fg">
              Docs
            </Link>
            <span>/</span>
            <span className="text-accent">{doc.group}</span>
          </p>
          <h1 className="display mt-4 text-[clamp(2.1rem,4.4vw,3.2rem)]">{doc.title}</h1>
          <p className="mt-4 text-[clamp(16px,1.4vw,18px)] leading-relaxed text-dim">{doc.description}</p>
        </header>

        <div className="mt-10 border-t border-line pt-10">{doc.body()}</div>

        <nav aria-label="Pagination" className="mt-16 grid gap-3 border-t border-line pt-8 sm:grid-cols-2">
          {prev ? (
            <Link href={docHref(prev.slug)} className="group rounded-[18px] border border-line p-5 transition-colors hover:border-accent/50">
              <span className="label flex items-center gap-1.5">
                <Icon name="arrowRight" size={13} className="rotate-180" /> Previous
              </span>
              <span className="mt-2 block font-medium text-fg">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={docHref(next.slug)} className="group rounded-[18px] border border-line p-5 text-right transition-colors hover:border-accent/50">
              <span className="label flex items-center justify-end gap-1.5">
                Next <Icon name="arrowRight" size={13} />
              </span>
              <span className="mt-2 block font-medium text-fg">{next.title}</span>
            </Link>
          ) : null}
        </nav>
      </article>

      <aside aria-label="On this page" className="hidden xl:block">
        <div className="sticky top-[calc(var(--bar-h)+32px)]">
          <p className="label">On this page</p>
          <ul className="mt-3 grid gap-2">
            {doc.toc.map((t) => (
              <li key={t.id}>
                <a href={`#${t.id}`} className="text-[13.5px] text-dim transition-colors hover:text-fg">
                  {t.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
