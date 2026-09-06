import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { getServerDictionary } from "@/lib/locale";
import { getSiteContent } from "@/lib/settings";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const notoBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-noto-bengali",
  display: "swap",
  weight: ["400", "500", "600", "700"]
});

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return {
    title: {
      default: content.seoDefaultTitle,
      template: `%s | ${content.siteName}`
    },
    description: content.seoDefaultDescription,
    icons: content.faviconUrl ? [{ url: content.faviconUrl }] : undefined,
    openGraph: {
      title: content.seoDefaultTitle,
      description: content.seoDefaultDescription,
      siteName: content.siteName,
      type: "website"
    },
    metadataBase: process.env.NEXT_PUBLIC_APP_URL
      ? new URL(process.env.NEXT_PUBLIC_APP_URL)
      : undefined
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const { locale } = getServerDictionary();

  return (
    <html lang={locale} className={`${inter.variable} ${notoBengali.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
