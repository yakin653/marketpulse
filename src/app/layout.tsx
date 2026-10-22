import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MarketPulse",
  description: "Sentez le pouls des marchés.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.className} flex flex-col md:flex-row h-screen overflow-hidden`}>
        <Navbar />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0 p-4 md:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
