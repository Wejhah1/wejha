import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-sans",
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
      <body className={`${cairo.variable} font-sans antialiased`}>
        <LocaleProvider>
          <SmoothScrollProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </SmoothScrollProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
