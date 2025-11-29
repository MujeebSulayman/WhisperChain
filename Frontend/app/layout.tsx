import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// 
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "WhisperChain - Decentralized Messaging on Blockchain",
  description: "Secure, private, and decentralized messaging platform built on blockchain. Send encrypted messages, files, and payments directly on-chain.",
  keywords: ["blockchain", "messaging", "decentralized", "web3", "ethereum", "crypto", "encrypted messaging"],
  authors: [{ name: "WhisperChain" }],
  openGraph: {
    title: "WhisperChain - Decentralized Messaging",
    description: "Secure, private, and decentralized messaging platform built on blockchain",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WhisperChain - Decentralized Messaging",
    description: "Secure, private, and decentralized messaging platform built on blockchain",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0f] text-white`}
      >
        {children}
      </body>
    </html>
  );
}
