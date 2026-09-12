import type { Metadata } from "next";
import { Inter, DM_Sans, DM_Serif_Display } from "next/font/google";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { InitialLoader } from "@/components/ui/InitialLoader";
import { PublicLayoutWrapper } from "@/components/landing/PublicLayoutWrapper";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif-display",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Young Entrepreneur Camp — Competition Platform",
  description: "Platform manajemen kompetisi Young Entrepreneur Camp (YEC)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${inter.variable} ${dmSans.variable} ${dmSerifDisplay.variable} antialiased`}
      >
        <InitialLoader />
        <SmoothScroll>
          <PublicLayoutWrapper>
            {children}
          </PublicLayoutWrapper>
        </SmoothScroll>
      </body>
    </html>
  );
}
