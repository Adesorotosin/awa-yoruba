import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ÀWA YORÙBÁ | Learn Yoruba Language & Culture",
  description: "Interactive Yoruba language learning for diaspora kids and adults.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body
        className="font-sans antialiased bg-[#FFFDF7] text-[#1A2621]"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}