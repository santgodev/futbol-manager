import type { Metadata } from "next";
import { Geist, Geist_Mono, Rajdhani, Montserrat } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rajdhani = Rajdhani({
  weight: ["500", "600", "700"],
  variable: "--font-rajdhani",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  weight: ["800", "900"],
  style: ["italic"],
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PEGASIGHT SPORT",
  description: "La plataforma definitiva para el seguimiento de torneos deportivos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${rajdhani.variable} ${montserrat.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground tabular-nums">{children}</body>
    </html>
  );
}
