import Link from "next/link";

import { RetryButton } from "@/components/retry-button";

export function Soon({ title, body }: { title: string; body: string }) {
  return (
    <section className="mx-auto w-full max-w-3xl">
      <h1 className="font-display text-[32px] leading-[1.05] font-semibold">{title}</h1>
      <div className="mt-4 rounded-3xl bg-cream p-5 leading-[1.4] text-muted">{body}</div>
    </section>
  );
}

export function PublicSoon({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex min-h-dvh flex-col bg-paper text-ink">
      <header className="bg-brand px-6 pt-[env(safe-area-inset-top)] ps-[max(1.5rem,env(safe-area-inset-left))] pe-[max(1.5rem,env(safe-area-inset-right))]">
        <div className="flex h-16 items-center">
          <Link
            href="/"
            className="font-display text-[32px] leading-none font-semibold text-brand-cream italic"
          >
            Wishly
          </Link>
        </div>
      </header>
      <main className="flex-1 px-6 py-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <Soon title={title} body={body} />
        <p className="mx-auto mt-4 w-full max-w-3xl">
          <Link href="/entrar" className="font-semibold text-accent">
            Entrar
          </Link>
        </p>
      </main>
    </div>
  );
}

export function PrivateFallback() {
  return (
    <div className="flex min-h-dvh flex-col bg-paper text-ink">
      <header className="bg-brand pt-[env(safe-area-inset-top)]">
        <div className="h-16" />
      </header>
      <div className="w-full px-5 py-6">
        <div className="h-9 w-48 rounded-lg bg-cream" />
        <p className="mt-4 min-h-12 max-w-md leading-[1.4] text-muted">
          Abrindo o Wishly… Se o servidor estiver acordando, a primeira resposta pode levar cerca de
          um minuto.
        </p>
        <div className="mt-5 h-[220px] max-w-sm rounded-3xl bg-cream" />
      </div>
    </div>
  );
}

export function Unreachable({ message }: { message: string }) {
  return (
    <div className="flex min-h-dvh flex-col bg-paper px-6 py-16 text-ink">
      <h1 className="font-display text-[32px] leading-[1.05] font-semibold">
        Não foi possível entrar
      </h1>
      <p className="mt-3 max-w-md leading-[1.4] text-muted">{message}</p>
      <RetryButton />
    </div>
  );
}
