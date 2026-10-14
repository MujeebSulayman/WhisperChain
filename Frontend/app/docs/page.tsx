import type { Metadata } from "next";
import { DocView } from "@/components/docs/DocView";
import { findDoc } from "@/lib/docs";

const doc = findDoc("")!;

export const metadata: Metadata = {
  title: "Docs - WhisperChain",
  description: doc.description,
};

export default function DocsHome() {
  return <DocView doc={doc} />;
}
