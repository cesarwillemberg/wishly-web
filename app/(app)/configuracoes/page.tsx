"use client";

import Link from "next/link";

import { useSessionUser } from "@/components/app-shell";
import { ThemeChoiceControl } from "@/components/theme-menu";

export default function SettingsPage() {
  const user = useSessionUser();

  return (
    <section className="mx-auto w-full max-w-[560px] pb-8">
      <Link href="/" className="text-sm font-semibold text-muted">
        Suas listas
      </Link>
      <h1 className="mt-3 font-display text-[32px] leading-[1.05] font-semibold">Configurações</h1>

      <h2 className="mt-8 font-display text-xl font-semibold">Conta</h2>
      <p className="mt-3 text-lg font-semibold">{user.name}</p>
      <p className="text-muted">{user.email}</p>
      <p className="mt-2 leading-[1.4] text-muted">
        Nome, e-mail, senha e foto entram na etapa da conta.
      </p>

      <h2 className="mt-8 font-display text-xl font-semibold">Aparência</h2>
      <div className="mt-3">
        <ThemeChoiceControl />
      </div>

      <h2 className="mt-8 font-display text-xl font-semibold">Sair</h2>
      <button
        type="submit"
        form="logout-form"
        className="mt-3 h-12 cursor-pointer font-bold text-danger"
      >
        Sair desta conta
      </button>
    </section>
  );
}
