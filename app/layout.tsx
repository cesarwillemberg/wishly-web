import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";

import { DeferredAnalytics } from "@/components/deferred-analytics";
import { HashRedirect } from "@/components/hash-redirect";
import { QueryProvider } from "@/components/query-provider";
import { THEME_BOOT_SCRIPT, ThemeProvider } from "@/components/theme-provider";
import { HASH_REDIRECT_SCRIPT } from "@/lib/navigation";
import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from "@/lib/seo";

import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  adjustFontFallback: true,
  fallback: ["Arial", "Helvetica", "sans-serif"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
  adjustFontFallback: true,
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/og.jpg"],
  },
  appleWebApp: {
    title: "Wishly",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F3EEE6" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1410" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${outfit.variable} ${fraunces.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-paper text-ink">
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: HASH_REDIRECT_SCRIPT }} />
        <ThemeProvider>
          <QueryProvider>
            <HashRedirect />
            <DeferredAnalytics />
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
