import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { GlassBoot } from "@/components/site/GlassBoot";
import { Header } from "@/components/site/Header";
import { LiquidGlassDefs } from "@/components/site/LiquidGlass";
import { ThemeProvider, themeInitScript } from "@/components/site/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://scarf.chat"),
  title: "Scarf - Gasless Messaging on Base",
  description:
    "Wallet-to-wallet messages, files and payments on Base. Sign once with EIP-712; a relayer submits it and the paymaster covers the gas.",
  keywords: ["blockchain", "messaging", "decentralized", "web3", "base", "gasless", "meta-transactions"],
  authors: [{ name: "Scarf" }],
  openGraph: {
    title: "Scarf",
    description: "Wallet-to-wallet messaging, settled on Base. You sign; the paymaster pays the gas.",
    type: "website",
    url: "/",
    siteName: "Scarf",
  },
  twitter: {
    card: "summary_large_image",
    title: "Scarf",
    description: "Wallet-to-wallet messaging, settled on Base. You sign; the paymaster pays the gas.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    // data-theme is rewritten by themeInitScript before hydration.
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://api.fontshare.com" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&f[]=clash-display@400,500,600,700&display=swap"
        />
      </head>
      <body>
        <LiquidGlassDefs />
        <ThemeProvider>
          <GlassBoot />
          <Header />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
