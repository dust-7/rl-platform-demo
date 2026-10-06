import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Platform - Intelligent Business Solutions",
  description: "Enterprise-grade platform for business optimization",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} font-sans h-full`}>
      <body className="min-h-full flex flex-col bg-white">{children}</body>
    </html>
  );
}
