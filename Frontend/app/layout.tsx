import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { GlassBoot } from "@/components/site/GlassBoot";
import { Header } from "@/components/site/Header";
import { LiquidGlassDefs } from "@/components/site/LiquidGlass";
import { ThemeProvider, themeInitScript } from "@/components/site/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://scarf.chat"),
  title: "Whispr - Private messaging from your wallet",
  description:
    "Whispr is a privacy-first messaging app where your wallet is your account. Chat one-to-one or in groups, share photos, video and files that only the people in the conversation can open, and send a payment without leaving the thread.",
  keywords: ["private messaging", "privacy", "blockchain", "messaging", "decentralized", "web3", "base", "gasless", "meta-transactions"],
  authors: [{ name: "Whispr" }],
  openGraph: {
    title: "Whispr",
    description: "Private chats, files and payments, with your wallet as your account.",
    type: "website",
    url: "/",
    siteName: "Whispr",
  },
  twitter: {
    card: "summary_large_image",
    title: "Whispr",
    description: "Private chats, files and payments, with your wallet as your account.",
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
