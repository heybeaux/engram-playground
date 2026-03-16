import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Engram — Agent Memory That Actually Works",
  description:
    "Give your AI agents persistent memory that consolidates, deduplicates, and evolves. Watch the Dream Cycle live.",
  openGraph: {
    title: "Engram — Agent Memory That Actually Works",
    description:
      "Your agent forgets everything. Engram fixes that. Watch memory consolidation happen in real time.",
    type: "website",
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
        className={`${inter.className} bg-[#09090b] text-white antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
