import type { Metadata } from "next";
import { Cairo, El_Messiri } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import { AppShell } from "@/components/site/app-shell";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-sans",
  display: "swap",
});

const elMessiri = El_Messiri({
  subsets: ["arabic", "latin"],
  weight: ["500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "وجهة | Wejha",
  description: "منصة لاستئجار مواقع التصوير — Book the perfect filming location",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.variable} ${elMessiri.variable} font-sans antialiased`}>
        <LocaleProvider>
          <SmoothScrollProvider>
            <AppShell>{children}</AppShell>
          </SmoothScrollProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
