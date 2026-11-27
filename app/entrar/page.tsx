import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthForm } from "@/components/auth-form";
import { SiteJsonLd } from "@/components/site-json-ld";
import { SITE_NAME } from "@/lib/seo";

const description = "Entre no Wishly para ver suas listas de desejos.";

export const metadata: Metadata = {
  title: "Entrar",
  description,
  alternates: { canonical: "/entrar" },
  openGraph: {
    title: `Entrar · ${SITE_NAME}`,
    description,
    url: "/entrar",
    type: "website",
    locale: "pt_BR",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Entrar · ${SITE_NAME}`,
    description,
    images: ["/og.jpg"],
  },
};

export default function EntrarPage() {
  return (
    <>
      <SiteJsonLd />
      <div className="min-h-dvh bg-paper text-ink lg:grid lg:grid-cols-2">
        <section className="hidden bg-brand px-12 pt-12 text-brand-cream lg:block">
          <h1 className="font-display text-[64px] leading-[1.05] font-semibold italic">Wishly</h1>
          <p className="mt-3 max-w-md text-lg leading-[1.4] text-on-ink">
            Suas listas de desejos, com foto e preço da loja. Compartilhe um link para ninguém
            comprar o mesmo presente.
          </p>
        </section>
        <section className="px-6 pt-10 pb-[max(1.5rem,env(safe-area-inset-bottom))] ps-[max(1.5rem,env(safe-area-inset-left))] pe-[max(1.5rem,env(safe-area-inset-right))] lg:grid lg:place-items-center lg:px-8 lg:pt-0">
          <div className="mx-auto w-full max-w-[420px]">
            <div className="lg:hidden">
              <h1 className="font-display text-[48px] leading-[1.05] font-semibold italic">
                Wishly
              </h1>
              <p className="mt-2 leading-[1.4] text-muted">
                Entre para guardar suas listas neste aparelho.
              </p>
            </div>
            <div className="mt-8 lg:mt-0">
              <Suspense fallback={<AuthFallback />}>
                <AuthForm />
              </Suspense>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function AuthFallback() {
  return (
    <div className="flex w-full max-w-[420px] flex-col" aria-hidden>
      <div className="h-4 w-16 rounded bg-cream" />
      <div className="mt-4 h-12 rounded-lg bg-cream" />
      <div className="mt-3 h-12 rounded-lg bg-cream" />
      <div className="mt-3 min-h-6" />
      <div className="mt-4 h-12 rounded-lg bg-cream" />
      <div className="mt-2 h-12 rounded-lg bg-cream" />
      <div className="mt-2 h-10" />
    </div>
  );
}
