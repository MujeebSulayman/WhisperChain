import { Faq } from "@/components/home/Faq";
import { Hero } from "@/components/home/Hero";
import { Closing, HowItWorks, Limits, Payments, Stack, Why } from "@/components/home/Sections";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Why />
      <Limits />
      <Stack />
      <Payments />
      <section id="faq" className="mx-auto w-full max-w-[1200px] scroll-mt-24 px-4 pt-28 sm:px-6 lg:pt-36">
        <Reveal className="mb-10">
          <p className="eyebrow">Questions</p>
          <h2 className="h2 mt-3">Before you send your first message.</h2>
        </Reveal>
        <Faq />
      </section>
      <Closing />
      <Footer />
    </>
  );
}
