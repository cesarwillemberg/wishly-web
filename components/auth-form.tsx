"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cleanEmail, passwordError } from "@/lib/api/parse";
import { safeNextPath } from "@/lib/navigation";

export function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [creating, setCreating] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextEmail = cleanEmail(email);
    if (!nextEmail) {
      setError("Informe um e-mail válido.");
      return;
    }
    const nextPasswordError = passwordError(password);
    if (nextPasswordError) {
      setError(nextPasswordError);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(creating ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ email: nextEmail, password }),
      });
      const body = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        setError(body?.message || "Não foi possível concluir agora.");
        return;
      }
      router.replace(safeNextPath(params.get("next")));
      router.refresh();
    } catch {
      setError("Não foi possível falar com o servidor.");
    } finally {
      setBusy(false);
    }
  }

  const form = (
    <form onSubmit={onSubmit} className="flex w-full max-w-[420px] flex-col" noValidate>
      <p className="text-xs font-bold tracking-[1.2px] text-muted uppercase">
        {creating ? "Criar conta" : "Entrar"}
      </p>
      <label className="sr-only" htmlFor="email">
        E-mail
      </label>
      <Input
        id="email"
        className="mt-4"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="E-mail"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <label className="sr-only" htmlFor="password">
        Senha
      </label>
      <Input
        id="password"
        className="mt-3"
        type="password"
        autoComplete={creating ? "new-password" : "current-password"}
        placeholder="Senha"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      {error ? (
        <p role="alert" className="mt-3 text-base leading-[1.4] text-danger">
          {error}
        </p>
      ) : null}
      <Button className="mt-4 w-full" type="submit" disabled={busy}>
        {busy ? "Aguarde…" : creating ? "Criar conta" : "Entrar"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="mt-2"
        disabled={busy}
        onClick={() => {
          setCreating((value) => !value);
          setError(null);
        }}
      >
        {creating ? "Já tem conta? Entrar" : "Não tem conta? Criar conta"}
      </Button>
      <p className="mt-2 text-center text-sm leading-[1.4] text-muted">
        Na primeira vez o servidor pode levar cerca de um minuto para acordar.
      </p>
    </form>
  );

  return (
    <div className="min-h-dvh bg-paper text-ink lg:grid lg:grid-cols-2">
      <section className="hidden bg-brand px-12 pt-12 text-brand-cream lg:block">
        <h1 className="font-display text-[64px] leading-[1.05] font-semibold italic">Wishly</h1>
        <p className="mt-3 max-w-md text-lg leading-[1.4] text-on-ink">
          Suas listas de desejos, com foto e preço da loja. Compartilhe um link para ninguém comprar
          o mesmo presente.
        </p>
      </section>
      <section className="px-6 pt-10 pb-[max(1.5rem,env(safe-area-inset-bottom))] ps-[max(1.5rem,env(safe-area-inset-left))] pe-[max(1.5rem,env(safe-area-inset-right))] lg:grid lg:place-items-center lg:px-8 lg:pt-0">
        <div className="mx-auto w-full max-w-[420px]">
          <div className="lg:hidden">
            <h1 className="font-display text-[48px] leading-[1.05] font-semibold italic">Wishly</h1>
            <p className="mt-2 leading-[1.4] text-muted">
              Entre para guardar suas listas neste aparelho.
            </p>
          </div>
          <div className="mt-8 lg:mt-0">{form}</div>
        </div>
      </section>
    </div>
  );
}
