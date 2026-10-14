import type { ReactNode } from "react";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { Footer } from "@/components/site/Footer";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="mx-auto w-full max-w-[1200px] px-4 pb-12 pt-10 sm:px-6 md:pt-14">
        <div className="grid gap-8 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-14">
          <DocsSidebar />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
      <Footer />
    </>
  );
}
