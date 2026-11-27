"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError, createList } from "@/lib/client-api";
import { roleLabel, type WishList } from "@/lib/domain";

export function ListSidebar({
  lists,
  currentId,
  onClose,
  onCreated,
  onCategories,
}: {
  lists: WishList[];
  currentId: string;
  onClose: () => void;
  onCreated: (list: WishList) => void;
  onCategories?: () => void;
}) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Informe um nome.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const list = await createList(trimmed);
      setName("");
      setCreating(false);
      onCreated(list);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Não foi possível criar.");
      setBusy(false);
    }
  }

  return (
    <aside className="flex h-dvh flex-col bg-brand pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-brand-cream">
      <div className="px-4 py-3">
        <Link href="/" className="inline-flex h-12 items-center font-semibold" onClick={onClose}>
          ← Suas listas
        </Link>
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto px-2">
        {lists.map((list) => {
          const current = list.id === currentId;
          return (
            <Link
              key={list.id}
              href={`/list/${list.id}`}
              onClick={onClose}
              className={
                current
                  ? "mb-1 block rounded-xl bg-white/10 px-3 py-3"
                  : "mb-1 block rounded-xl px-3 py-3 hover:bg-white/5"
              }
            >
              <span className="block truncate font-semibold">{list.name}</span>
              <span className="block text-xs text-on-ink-muted">
                {list.role === "owner"
                  ? list.itemCount === 1
                    ? "1 item"
                    : `${list.itemCount} itens`
                  : roleLabel(list.role)}
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-3">
        {creating ? (
          <form onSubmit={onSubmit}>
            <Input
              value={name}
              placeholder="Nome da lista"
              onChange={(event) => setName(event.target.value)}
            />
            {error ? <p className="mt-2 text-sm text-[#ffb4a2]">{error}</p> : null}
            <div className="mt-2 flex gap-2">
              <Button type="submit" disabled={busy}>
                {busy ? "Salvando…" : "Criar"}
              </Button>
              <button
                type="button"
                className="h-12 px-3 text-sm"
                onClick={() => setCreating(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <button type="button" className="h-12 font-semibold" onClick={() => setCreating(true)}>
            Nova lista
          </button>
        )}
        {onCategories ? (
          <button type="button" className="mt-1 block h-12 font-semibold" onClick={onCategories}>
            Categorias
          </button>
        ) : null}
        <Link
          href="/configuracoes"
          className="mt-1 flex h-12 items-center font-semibold"
          onClick={onClose}
        >
          Configurações
        </Link>
        <form action="/api/auth/logout" method="post">
          <button type="submit" className="h-12 font-semibold text-[#ffb4a2]">
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
