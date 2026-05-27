import type { Metadata } from "next";
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
