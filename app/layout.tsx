import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";

import { HashRedirect } from "@/components/hash-redirect";
import { THEME_BOOT_SCRIPT, ThemeProvider } from "@/components/theme-provider";
import { HASH_REDIRECT_SCRIPT } from "@/lib/navigation";

import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Wishly",
    template: "%s · Wishly",
  },
  description: "Suas listas de desejos, com foto e preço da loja.",
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
          <HashRedirect />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
