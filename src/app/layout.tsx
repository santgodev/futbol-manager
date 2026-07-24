import type { Metadata, Viewport } from "next";
import "./globals.css";
// Use static standard/google fonts imported via CSS to guarantee build environment reliability
const geistSans = { variable: "font-sans" };
const geistMono = { variable: "font-mono" };
const rajdhani = { variable: "font-display" };
const montserrat = { variable: "font-italic-title" };

export const metadata: Metadata = {
  title: "PEGASIGHT SPORT",
  description: "La plataforma definitiva para el seguimiento de torneos deportivos.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${rajdhani.variable} ${montserrat.variable} dark antialiased`}
    >
      <body className="min-h-[100dvh] w-full max-w-[100vw] overflow-x-hidden flex flex-col bg-background text-foreground tabular-nums">{children}</body>
    </html>
  );
}
