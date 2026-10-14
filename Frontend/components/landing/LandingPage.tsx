import { GlassBoot } from "./GlassBoot";
import { Footer } from "./layout/Footer";
import { Header } from "./layout/Header";
import { Banner } from "./sections/Banner";
import { BannerFeatures } from "./sections/BannerFeatures";
import { CallToAction } from "./sections/CallToAction";
import { Contracts } from "./sections/Contracts";
import { Deployments } from "./sections/Deployments";
import { HowItWorks } from "./sections/HowItWorks";
import { KeyFeatures } from "./sections/KeyFeatures";
import { Powering } from "./sections/Powering";

/** The marketing page. Everything inside `.wc` uses the liquid-glass theme in globals.css; the app at /app is untouched. */
export function LandingPage() {
  return (
    <div className="wc">
      <link rel="preconnect" href="https://api.fontshare.com" />
      <link
        rel="stylesheet"
        href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&f[]=clash-display@400,500,600,700&display=swap"
        precedence="default"
      />
      <GlassBoot />
      <Header />
      <main>
        <Banner />
        <BannerFeatures />
        <KeyFeatures />
        <HowItWorks />
        <Contracts />
        <Powering />
        <Deployments />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}
