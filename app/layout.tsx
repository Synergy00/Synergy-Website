import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { NetworkStatus } from "@/components/shared/NetworkStatus";
import { SessionGuardian } from "@/components/shared/SessionGuardian";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PROTOHACK: The Product Build Challenge | SYNERGY 2026",
  description:
    "Learn. Build. Break the Clock. The premier product build challenge for SRMIST students organized by SYNERGY.",
  icons: {
    icon: "/finalsynergy1.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-surface text-on-surface min-h-screen relative selection:bg-primary-container selection:text-on-primary">
        <SessionGuardian />
        <NetworkStatus />
        {children}
      </body>
    </html>
  );
}
