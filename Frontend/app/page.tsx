import { Contracts } from "@/components/home/Contracts";
import { CtaBand } from "@/components/home/CtaBand";
import { Faq } from "@/components/home/Faq";
import { Hero } from "@/components/home/Hero";
import { Showcase } from "@/components/home/Showcase";
import { Steps } from "@/components/home/Steps";
import { Footer } from "@/components/site/Footer";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Showcase />
      <Steps />
      <Contracts />
      <Faq />
      <CtaBand />
      <Footer />
    </>
  );
}
