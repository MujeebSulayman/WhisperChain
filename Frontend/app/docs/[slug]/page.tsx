import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocView } from "@/components/docs/DocView";
import { DOCS, findDoc } from "@/lib/docs";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return DOCS.filter((d) => d.slug).map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doc = findDoc((await params).slug);
  return doc ? { title: `${doc.title} - Scarf Docs`, description: doc.description } : {};
}

export default async function DocPage({ params }: Props) {
  const doc = findDoc((await params).slug);
  if (!doc || !doc.slug) notFound();
  return <DocView doc={doc} />;
}
